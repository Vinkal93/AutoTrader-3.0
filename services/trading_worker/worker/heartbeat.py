"""
Worker Heartbeat and Distributed Lock Manager
Ensures only one authoritative trading worker runs as the active leader.
"""
import asyncio
import logging
import socket
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("worker.heartbeat")


class HeartbeatManager:
    def __init__(
        self,
        worker_id: str,
        interval_seconds: int = 5,
        redis_client=None,
        db_session_factory=None,
    ):
        self.worker_id = worker_id
        self.hostname = socket.gethostname()
        self.interval_seconds = interval_seconds
        self.redis = redis_client
        self.db_session_factory = db_session_factory
        self.is_leader: bool = False
        self._running: bool = False
        self._task: Optional[asyncio.Task] = None

    async def acquire_leadership(self) -> bool:
        """
        Attempts to acquire the distributed leader lock.
        In Phase 1, if Redis is not configured, falls back to standalone leadership.
        """
        if not self.redis:
            self.is_leader = True
            return True

        try:
            acquired = await self.redis.set(
                "autotrader:worker:leader",
                self.worker_id,
                nx=True,
                ex=15,
            )
            if acquired:
                self.is_leader = True
                logger.info(f"Worker {self.worker_id} acquired leadership")
                return True
            else:
                current_leader = await self.redis.get("autotrader:worker:leader")
                if current_leader == self.worker_id:
                    # Renew lock
                    await self.redis.expire("autotrader:worker:leader", 15)
                    self.is_leader = True
                    return True
                self.is_leader = False
                return False
        except Exception as e:
            logger.warning(f"Error checking distributed lock in Redis: {e}")
            self.is_leader = True  # Standalone fallback
            return True

    async def record_heartbeat(self, engine_state: str = "READY", trading_mode: str = "OFF"):
        """
        Emits a heartbeat timestamp to DB / Redis.
        """
        now = datetime.now(timezone.utc)
        logger.debug(
            f"Heartbeat from {self.worker_id} ({self.hostname}) - State: {engine_state}, Mode: {trading_mode}, Leader: {self.is_leader}"
        )
        if self.db_session_factory:
            try:
                from sqlalchemy import select
                from app.models.entities import WorkerHeartbeat
                async with self.db_session_factory() as session:
                    stmt = select(WorkerHeartbeat).where(WorkerHeartbeat.worker_id == self.worker_id)
                    hb = (await session.execute(stmt)).scalars().first()
                    if hb:
                        hb.engine_state = engine_state
                        hb.trading_mode = trading_mode
                        hb.is_leader = self.is_leader
                        hb.last_heartbeat_at = now
                    else:
                        hb = WorkerHeartbeat(
                            worker_id=self.worker_id,
                            hostname=self.hostname,
                            engine_state=engine_state,
                            trading_mode=trading_mode,
                            is_leader=self.is_leader,
                            last_heartbeat_at=now,
                        )
                        session.add(hb)
                    await session.commit()
            except Exception as e:
                logger.debug(f"Failed to persist heartbeat in DB: {e}")

    async def start(self):
        self._running = True
        while self._running:
            try:
                await self.acquire_leadership()
                await self.record_heartbeat()
            except Exception as e:
                logger.error(f"Heartbeat loop error: {e}")
            await asyncio.sleep(self.interval_seconds)

    async def stop(self):
        self._running = False
        if self.redis and self.is_leader:
            try:
                await self.redis.delete("autotrader:worker:leader")
            except Exception:
                pass
        self.is_leader = False
        logger.info(f"Worker {self.worker_id} heartbeat stopped")
