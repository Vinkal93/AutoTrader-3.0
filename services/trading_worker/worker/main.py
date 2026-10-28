"""
Trading Worker Entry Point
"""
import asyncio
import logging
import signal
from worker.config import worker_settings
from worker.heartbeat import HeartbeatManager
from worker.engine import TradingEngine, EngineState, TradingMode

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [%(name)s]: %(message)s",
)
logger = logging.getLogger("worker.main")


async def main():
    logger.info(f"Starting {worker_settings.APP_NAME} (Worker ID: {worker_settings.WORKER_ID})")
    
    engine = TradingEngine(mode=TradingMode.OFF)
    engine.transition_to(EngineState.STARTING, "System process initialized")

    heartbeat = HeartbeatManager(
        worker_id=worker_settings.WORKER_ID,
        interval_seconds=worker_settings.HEARTBEAT_INTERVAL_SECONDS,
    )

    engine.transition_to(EngineState.READY, "Worker ready, awaiting scheduled market hours")

    stop_event = asyncio.Event()

    def handle_exit(signum, frame):
        logger.info(f"Shutdown signal received ({signum}). Terminating worker...")
        stop_event.set()

    # Note: On Windows signal handlers for SIGINT work in main thread
    heartbeat_task = asyncio.create_task(heartbeat.start())

    try:
        while not stop_event.is_set():
            await asyncio.sleep(1)
    except (asyncio.CancelledError, KeyboardInterrupt):
        pass
    finally:
        engine.transition_to(EngineState.STOPPED, "Graceful worker shutdown")
        await heartbeat.stop()
        heartbeat_task.cancel()
        logger.info("Worker shutdown complete.")


# ASGI & HTTP entry points for Vercel service runtime
async def app(scope, receive, send):
    if scope.get("type") == "http":
        await send({
            "type": "http.response.start",
            "status": 200,
            "headers": [[b"content-type", b"application/json"]],
        })
        await send({
            "type": "http.response.body",
            "body": b'{"status":"ok","service":"trading_worker"}',
        })


handler = app


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
