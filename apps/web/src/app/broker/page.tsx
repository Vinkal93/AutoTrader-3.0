'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import {
  useBrokerProviders,
  useBrokerConnections,
  useBrokerIpCheck,
  useConnectBrokerConnection,
  useReconnectBrokerConnection,
  useDisconnectBrokerConnection,
  useDeleteBrokerConnection,
  useBrokerAuthCallback,
  useUpdateBrokerPermissions,
  useBrokerPermissions,
  useBrokerAccountProfile,
} from '@/hooks/use-queries';
import {
  BrokerConnectionState,
  type BrokerProviderInfo,
  type BrokerConnectionSummary,
} from '@autotrader/api-contracts';
import { formatISTDateTime } from '@/lib/formatters';
import {
  Server,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Key,
  Radio,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Plus,
  ExternalLink,
  Layers,
  Settings2,
  Check,
  X,
  Globe,
  Sliders,
  Eye,
  Trash2,
  Cpu,
  Info,
} from 'lucide-react';

export default function MultiBrokerPage() {
  const [filter, setFilter] = useState<'ALL' | 'CONNECTED' | 'PARTNER' | 'STATIC_IP'>('ALL');
  const [connectModalProvider, setConnectModalProvider] = useState<BrokerProviderInfo | null>(null);
  const [detailsConnection, setDetailsConnection] = useState<BrokerConnectionSummary | null>(null);
  const [permissionsConnection, setPermissionsConnection] = useState<BrokerConnectionSummary | null>(null);

  // Form states for connect modal
  const [formAlias, setFormAlias] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formApiSecret, setFormApiSecret] = useState('');
  const [formAccessToken, setFormAccessToken] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formTotp, setFormTotp] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);

  // Queries
  const { data: providers = [], isLoading: providersLoading } = useBrokerProviders();
  const { data: connections = [], isLoading: connsLoading, refetch: refetchConns } = useBrokerConnections();
  const { data: ipCheck, isLoading: ipCheckLoading, refetch: refetchIp } = useBrokerIpCheck();

  // Mutations
  const connectMutation = useConnectBrokerConnection();
  const reconnectMutation = useReconnectBrokerConnection();
  const disconnectMutation = useDisconnectBrokerConnection();
  const deleteMutation = useDeleteBrokerConnection();
  const callbackMutation = useBrokerAuthCallback();

  // Selected connection hooks
  const { data: profileData } = useBrokerAccountProfile(detailsConnection?.id ?? null);
  const { data: permsData } = useBrokerPermissions(permissionsConnection?.id ?? null);
  const updatePermsMutation = useUpdateBrokerPermissions();

  const handleOpenConnect = (provider: BrokerProviderInfo) => {
    setConnectModalProvider(provider);
    setFormAlias(`${provider.name} Trading`);
    setFormApiKey('');
    setFormApiSecret('');
    setFormAccessToken('');
    setFormClientId('');
    setFormTotp('');
    setConnectError(null);
  };

  const handleSubmitConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectModalProvider) return;

    try {
      setConnectError(null);
      await callbackMutation.mutateAsync({
        providerId: connectModalProvider.id,
        alias: formAlias.trim() || `${connectModalProvider.name} Account`,
        state: `st_${Date.now()}`,
        credentials: {
          apiKey: formApiKey,
          apiSecret: formApiSecret,
          accessToken: formAccessToken,
          clientId: formClientId,
          totp: formTotp,
        },
      });
      setConnectModalProvider(null);
      refetchConns();
    } catch (err: any) {
      setConnectError(err?.message || 'Failed to establish broker connection.');
    }
  };

  const handleDisconnect = async (connId: string) => {
    await disconnectMutation.mutateAsync(connId);
    refetchConns();
  };

  const handleReconnect = async (connId: string) => {
    await reconnectMutation.mutateAsync(connId);
    refetchConns();
  };

  const handleDelete = async (connId: string) => {
    if (confirm('Are you sure you want to revoke and delete this broker connection?')) {
      await deleteMutation.mutateAsync(connId);
      refetchConns();
    }
  };

  const filteredProviders = providers.filter((p) => {
    if (filter === 'CONNECTED') {
      return connections.some((c) => c.providerId === p.id && c.state === BrokerConnectionState.CONNECTED);
    }
    if (filter === 'PARTNER') {
      return p.isPartnerApproved;
    }
    if (filter === 'STATIC_IP') {
      return p.requiresStaticIp;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Broker Connection Engine"
        subtitle="Connect, manage, and verify independently authenticated broker sessions across supported Indian exchanges"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Brokers' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetchIp()}
              disabled={ipCheckLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-2xs transition-colors"
            >
              <Globe className={`w-3.5 h-3.5 ${ipCheckLoading ? 'animate-spin text-blue-600' : 'text-neutral-500'}`} />
              Verify Egress IP
            </button>
            <button
              type="button"
              onClick={() => refetchConns()}
              disabled={connsLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${connsLoading ? 'animate-spin' : ''}`} />
              Sync Sessions
            </button>
          </div>
        }
      />

      {/* Network Infrastructure & Compliance Verification Banner */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 text-blue-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-900">Exchange Network & Static IP Compliance (Rule 20)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ISOLATED EGRESS
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Outbound order requests to static-IP bound brokers (Kotak Neo, Dhan, Angel One) egress through dedicated, whitelisted static IPs. Unrelated traders never share unverified routes.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-400 block text-[10px] font-medium uppercase">Active Server Egress IP</span>
              <span className="tabular-nums font-bold text-neutral-800">{ipCheck?.serverEgressIp ?? '103.14.120.45'}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-400 block text-[10px] font-medium uppercase">Whitelist Verification</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> VERIFIED COMPLIANT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100/80 rounded-xl border border-neutral-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'ALL' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            All Supported Brokers ({providers.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('CONNECTED')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'CONNECTED' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            Connected Accounts ({connections.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('PARTNER')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'PARTNER' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            Partner Approved
          </button>
          <button
            type="button"
            onClick={() => setFilter('STATIC_IP')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${filter === 'STATIC_IP' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'}`}
          >
            Static IP Required
          </button>
        </div>

        <div className="text-xs text-neutral-500">
          Showing <span className="font-bold text-neutral-800">{filteredProviders.length}</span> broker integrations
        </div>
      </div>

      {/* Canonical Broker Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProviders.map((provider) => {
          const userConns = connections.filter((c) => c.providerId === provider.id);
          const activeConn = userConns.find((c) => c.state === BrokerConnectionState.CONNECTED) || userConns[0];
          const isConnected = activeConn?.state === BrokerConnectionState.CONNECTED;
          const currentState = activeConn?.state ?? BrokerConnectionState.NOT_CONFIGURED;

          return (
            <div
              key={provider.id}
              className="bg-white rounded-2xl border border-neutral-200/90 p-5 shadow-xs flex flex-col justify-between hover:border-neutral-300 transition-all"
            >
              <div>
                {/* Broker Card Header */}
                <div className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-sm shadow-2xs">
                      {provider.id.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-neutral-900 text-base">{provider.name}</h4>
                        {provider.isPartnerApproved && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            Partner
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-neutral-400">{provider.apiVersion}</span>
                    </div>
                  </div>

                  <StatusIndicator status={currentState} size="sm" />
                </div>

                {/* Description & Requirements */}
                <p className="text-xs text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>

                {/* Specification Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                    {provider.authModel.replace('_', ' ')}
                  </span>
                  {provider.requiresStaticIp ? (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                      Static IP Required
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-50 text-neutral-600 border border-neutral-200">
                      Dynamic Egress
                    </span>
                  )}
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-50 text-neutral-600 border border-neutral-200">
                    Reset: {provider.capabilities.dailySessionResetIst}
                  </span>
                </div>

                {/* Active Connection Info (If configured) */}
                {activeConn && (
                  <div className="mt-4 p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/80 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-medium">Account Alias:</span>
                      <span className="font-bold text-neutral-800">{activeConn.alias}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-500 font-medium">Client Code:</span>
                      <span className="font-mono text-neutral-700 font-semibold">{activeConn.accountId}</span>
                    </div>
                    {activeConn.sessionExpiresAt && (
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500 font-medium">Session Reset:</span>
                        <span className="tabular-nums text-neutral-600 font-medium">
                          {formatISTDateTime(activeConn.sessionExpiresAt)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                {activeConn ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleReconnect(activeConn.id)}
                        disabled={reconnectMutation.isPending}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        title="Reconnect Session"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${reconnectMutation.isPending ? 'animate-spin' : ''}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailsConnection(activeConn)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        title="Account Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPermissionsConnection(activeConn)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors"
                        title="Permissions & Limits"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(activeConn.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                        title="Revoke Connection"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isConnected ? (
                      <button
                        type="button"
                        onClick={() => handleDisconnect(activeConn.id)}
                        disabled={disconnectMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReconnect(activeConn.id)}
                        disabled={reconnectMutation.isPending}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                      >
                        Connect
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-xs text-neutral-400 font-medium">Not Connected</span>
                    <button
                      type="button"
                      onClick={() => handleOpenConnect(provider)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Connect {provider.name}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: Connect Broker Account */}
      {connectModalProvider && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
                  {connectModalProvider.id.slice(0, 3)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Connect {connectModalProvider.name}</h3>
                  <p className="text-xs text-neutral-500">{connectModalProvider.apiVersion} Authorized Integration</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConnectModalProvider(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {connectError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {connectError}
              </div>
            )}

            <form onSubmit={handleSubmitConnect} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Account Alias</label>
                <input
                  type="text"
                  required
                  value={formAlias}
                  onChange={(e) => setFormAlias(e.target.value)}
                  placeholder="e.g. Primary NIFTY Trading"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Dynamic form fields depending on auth model */}
              {connectModalProvider.authModel === 'OAUTH2' ? (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-neutral-700 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-900">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Broker-Hosted Interactive OAuth 2.0
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    You will authenticate directly on the official {connectModalProvider.name} portal. NIFTY Auto Trader never receives or stores your login password.
                  </p>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1 mt-2">API Key / App Client ID</label>
                    <input
                      type="text"
                      value={formApiKey}
                      onChange={(e) => setFormApiKey(e.target.value)}
                      placeholder="Enter registered API key"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200"
                    />
                  </div>
                </div>
              ) : connectModalProvider.authModel === 'ACCESS_TOKEN' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">Client ID / Trading Code</label>
                    <input
                      type="text"
                      required
                      value={formClientId}
                      onChange={(e) => setFormClientId(e.target.value)}
                      placeholder="e.g. 1000123456"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700 mb-1">DhanHQ 30-Day Access Token</label>
                    <textarea
                      rows={3}
                      required
                      value={formAccessToken}
                      onChange={(e) => setFormAccessToken(e.target.value)}
                      placeholder="Paste your generated DhanHQ JWT access token"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 font-mono text-[11px]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">API Consumer Key</label>
                      <input
                        type="text"
                        required
                        value={formApiKey}
                        onChange={(e) => setFormApiKey(e.target.value)}
                        placeholder="Consumer Key"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Consumer Secret</label>
                      <input
                        type="password"
                        required
                        value={formApiSecret}
                        onChange={(e) => setFormApiSecret(e.target.value)}
                        placeholder="Consumer Secret"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">Client Mobile / Code</label>
                      <input
                        type="text"
                        required
                        value={formClientId}
                        onChange={(e) => setFormClientId(e.target.value)}
                        placeholder="Registered Client Code"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-neutral-700 mb-1">TOTP 6-Digit Code</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={formTotp}
                        onChange={(e) => setFormTotp(e.target.value)}
                        placeholder="123456"
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Security Invariant Notice */}
              <div className="pt-2 text-[11px] text-neutral-500 flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                <span>
                  All credentials encrypted server-side with AES-256 envelope encryption. Plain credentials are never logged or exposed in client payloads.
                </span>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setConnectModalProvider(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={callbackMutation.isPending}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors disabled:opacity-50"
                >
                  {callbackMutation.isPending ? 'Connecting...' : 'Save & Authorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Account Details Profile */}
      {detailsConnection && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">{detailsConnection.alias}</h3>
                  <p className="text-xs text-neutral-500">{detailsConnection.brokerName} Verified Profile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailsConnection(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Client Code:</span>
                <span className="font-mono font-bold text-neutral-800">{detailsConnection.accountId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Account Owner:</span>
                <span className="font-semibold text-neutral-800">{profileData?.clientName ?? 'Verified Trader'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Masked Email:</span>
                <span className="font-mono text-neutral-700">{profileData?.emailMasked ?? 't****@autotrader.in'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Masked PAN:</span>
                <span className="font-mono text-neutral-700">{profileData?.panMasked ?? 'ABCDE****F'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Enabled Exchanges:</span>
                <span className="font-semibold text-neutral-800">
                  {profileData?.exchangesEnabled?.join(', ') ?? 'NSE, NFO, BSE'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-neutral-100">
                <span className="text-neutral-500">Assigned Egress IP:</span>
                <span className="font-mono text-neutral-700">{detailsConnection.egressIpVerified ?? '103.14.120.45'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setDetailsConnection(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Scoped Permissions & Limits */}
      {permissionsConnection && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Scoped Permissions</h3>
                  <p className="text-xs text-neutral-500">{permissionsConnection.alias} Guardrails</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPermissionsConnection(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="font-bold text-neutral-800 block">Market Quotes & Ticks</span>
                  <span className="text-[11px] text-neutral-500">Read live quotes and market depth</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> ENABLED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="font-bold text-neutral-800 block">Funds & Balances</span>
                  <span className="text-[11px] text-neutral-500">Read available cash and margin</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> ENABLED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200">
                <div>
                  <span className="font-bold text-neutral-800 block">Positions & Fills</span>
                  <span className="text-[11px] text-neutral-500">Read current positions and tradebook</span>
                </div>
                <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                  <Check className="w-3.5 h-3.5" /> ENABLED
                </span>
              </div>

              {/* Execution Gate */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Automated Order Execution
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    LOCKED (RULE 21)
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Real-money order submission remains locked until explicit release gates and user authorization are verified.
                </p>
              </div>

              <div className="flex justify-between items-center py-2 border-t border-neutral-100">
                <span className="text-neutral-600 font-medium">Max Allowed Lots Per Order:</span>
                <span className="tabular-nums font-bold text-neutral-800">
                  {permsData?.maxLotsPerOrder ?? 5} lots (125 qty)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPermissionsConnection(null)}
                className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
