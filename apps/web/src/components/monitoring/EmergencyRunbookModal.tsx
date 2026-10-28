'use client';

import React from 'react';
import type { EmergencyRunbookStep } from '@autotrader/api-contracts';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, ExternalLink } from 'lucide-react';

interface EmergencyRunbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: EmergencyRunbookStep[];
}

export const EmergencyRunbookModal: React.FC<EmergencyRunbookModalProps> = ({
  isOpen,
  onClose,
  steps = [],
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 tracking-tight">
                Emergency Response Runbook & Procedures
              </h3>
              <p className="text-xs text-neutral-500">
                Authoritative protocol for system degradation, network partitions, or broker outages
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prominent Safety Warning */}
        <div className="p-4 bg-amber-50/90 border-b border-amber-200/80 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-950">CRITICAL SAFETY INVARIANT</span>
            <p className="mt-0.5 leading-relaxed text-amber-800">
              When broker API connectivity is unavailable, credentials expire, or network partitions occur, the
              watchdog <strong>CANNOT</strong> automatically square off positions. You must immediately log directly into
              your broker’s native mobile app or web portal to execute manual market exits.
            </p>
          </div>
        </div>

        {/* Steps List */}
        <div className="p-5 overflow-y-auto space-y-4">
          {steps.map((step) => (
            <div
              key={step.stepNumber}
              className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/60 flex items-start gap-3.5"
            >
              <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center text-xs font-bold tabular-nums shrink-0">
                {step.stepNumber}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-bold text-sm text-neutral-900">{step.title}</h4>
                  <span className="text-[11px] font-medium text-neutral-500 bg-white px-2 py-0.5 rounded border border-neutral-200">
                    {step.toolOrLocation}
                  </span>
                </div>

                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  {step.actionRequired}
                </p>

                {step.caveat && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium leading-relaxed">
                    {step.caveat}
                  </div>
                )}

                {step.criticalNotice && (
                  <div className="mt-2 p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-medium">
                    {step.criticalNotice}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between">
          <a
            href="https://neo.kotak.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            <span>Open Kotak Neo Terminal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 transition-all shadow-xs"
          >
            I Understand the Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
