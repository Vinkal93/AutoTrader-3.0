'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useOptionChain } from '@/hooks/use-queries';
import { OptionType } from '@autotrader/api-contracts';
import { formatCurrency } from '@/lib/formatters';
import { Search, Filter, Layers, ArrowUpDown, ChevronRight } from 'lucide-react';

export interface SelectedOptionContract {
  instrumentToken: string;
  tradingSymbol: string;
  optionType: OptionType;
  strikePrice: number;
  expiryDate: string;
  ltp: number;
  bidPrice: number;
  askPrice: number;
  bidQuantity: number;
  askQuantity: number;
  lotSize: number;
  tickSize: number;
}

interface OptionChainTableProps {
  onSelectContract: (contract: SelectedOptionContract) => void;
  selectedToken?: string;
  className?: string;
}

export const OptionChainTable: React.FC<OptionChainTableProps> = ({
  onSelectContract,
  selectedToken,
  className,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'CE' | 'PE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: chain, isLoading } = useOptionChain('NIFTY');

  const entries = chain?.entries ?? [];

  // Filter strikes
  const filteredEntries = entries.filter((e) => {
    if (searchTerm) {
      return String(e.strikePrice).includes(searchTerm);
    }
    return true;
  });

  return (
    <div className={cn('bg-white rounded-2xl border border-neutral-200/90 p-4 shadow-xs flex flex-col', className)}>
      {/* Header and Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-500" />
          <h3 className="font-bold text-sm text-neutral-900 tracking-tight">NIFTY Option Chain</h3>
          {chain?.spotPrice && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
              Spot: ₹{chain.spotPrice.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search Strike */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search strike..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-neutral-50 border border-neutral-200 rounded-lg text-xs font-mono w-28 sm:w-36 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* CE/PE Filter */}
          <div className="flex items-center bg-neutral-100 p-0.5 rounded-lg text-xs font-semibold">
            {(['ALL', 'CE', 'PE'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFilterType(t)}
                className={cn(
                  'px-2 py-0.5 rounded-md transition-all',
                  filterType === t ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-2 select-none max-h-[360px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="sticky top-0 bg-white border-b border-neutral-200 text-neutral-500 font-semibold text-[11px]">
            <tr>
              <th className="py-2 px-2.5">Type</th>
              <th className="py-2 px-2.5">Strike</th>
              <th className="py-2 px-2.5 text-right">LTP</th>
              <th className="py-2 px-2.5 text-right">Bid</th>
              <th className="py-2 px-2.5 text-right">Ask</th>
              <th className="py-2 px-2.5 text-right">Spread</th>
              <th className="py-2 px-2.5 text-right">Ask Depth</th>
              <th className="py-2 px-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-mono text-neutral-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400 font-sans text-xs">
                  Loading option chain quotes...
                </td>
              </tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400 font-sans text-xs">
                  No option contracts found for the current selection.
                </td>
              </tr>
            ) : (
              filteredEntries.flatMap((entry) => {
                const rows = [];
                if ((filterType === 'ALL' || filterType === 'CE') && entry.ce) {
                  const ce = entry.ce;
                  const spread = (ce.askPrice - ce.bidPrice).toFixed(2);
                  const isSelected = selectedToken === ce.instrumentToken;
                  rows.push(
                    <tr
                      key={`ce-${ce.instrumentToken}`}
                      onClick={() =>
                        onSelectContract({
                          instrumentToken: ce.instrumentToken,
                          tradingSymbol: ce.tradingSymbol,
                          optionType: OptionType.CE,
                          strikePrice: entry.strikePrice,
                          expiryDate: entry.expiryDate,
                          ltp: ce.lastPrice,
                          bidPrice: ce.bidPrice,
                          askPrice: ce.askPrice,
                          bidQuantity: ce.bidQuantity,
                          askQuantity: ce.askQuantity,
                          lotSize: 25,
                          tickSize: 0.05,
                        })
                      }
                      className={cn(
                        'hover:bg-blue-50/50 cursor-pointer transition-colors',
                        isSelected && 'bg-blue-50 font-bold border-l-2 border-blue-600'
                      )}
                    >
                      <td className="py-2 px-2.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          CE
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-bold">{entry.strikePrice}</td>
                      <td className="py-2 px-2.5 text-right">₹{ce.lastPrice.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right text-neutral-600">₹{ce.bidPrice.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right font-bold text-neutral-900">₹{ce.askPrice.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right text-neutral-500">₹{spread}</td>
                      <td className="py-2 px-2.5 text-right text-neutral-600">{ce.askQuantity}</td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          type="button"
                          className="text-[11px] font-sans font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                }

                if ((filterType === 'ALL' || filterType === 'PE') && entry.pe) {
                  const pe = entry.pe;
                  const spread = (pe.askPrice - pe.bidPrice).toFixed(2);
                  const isSelected = selectedToken === pe.instrumentToken;
                  rows.push(
                    <tr
                      key={`pe-${pe.instrumentToken}`}
                      onClick={() =>
                        onSelectContract({
                          instrumentToken: pe.instrumentToken,
                          tradingSymbol: pe.tradingSymbol,
                          optionType: OptionType.PE,
                          strikePrice: entry.strikePrice,
                          expiryDate: entry.expiryDate,
                          ltp: pe.lastPrice,
                          bidPrice: pe.bidPrice,
                          askPrice: pe.askPrice,
                          bidQuantity: pe.bidQuantity,
                          askQuantity: pe.askQuantity,
                          lotSize: 25,
                          tickSize: 0.05,
                        })
                      }
                      className={cn(
                        'hover:bg-amber-50/50 cursor-pointer transition-colors',
                        isSelected && 'bg-amber-50 font-bold border-l-2 border-amber-600'
                      )}
                    >
                      <td className="py-2 px-2.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          PE
                        </span>
                      </td>
                      <td className="py-2 px-2.5 font-bold">{entry.strikePrice}</td>
                      <td className="py-2 px-2.5 text-right">₹{pe.lastPrice.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right text-neutral-600">₹{pe.bidPrice.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right font-bold text-neutral-900">₹{pe.askPrice.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-right text-neutral-500">₹{spread}</td>
                      <td className="py-2 px-2.5 text-right text-neutral-600">{pe.askQuantity}</td>
                      <td className="py-2 px-2.5 text-right">
                        <button
                          type="button"
                          className="text-[11px] font-sans font-semibold text-blue-600 hover:text-blue-800"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                }
                return rows;
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
