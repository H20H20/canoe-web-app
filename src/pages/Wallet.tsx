import { useState, useEffect } from 'react';
import { Wallet as WalletIcon, ArrowDownLeft, ArrowUpRight, TrendingUp, Clock } from 'lucide-react';
import api from '../services/api';

interface Balance {
  available: number;
  ledger?: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference?: string;
  created_at: string;
  fee?: number;
  metadata?: { description?: string; purpose?: string };
  counterparty?: { name?: string; phone?: string };
}

const TX_COLORS: Record<string, string> = {
  credit:     'text-green-600 bg-green-50',
  debit:      'text-red-500 bg-red-50',
  withdrawal: 'text-orange-500 bg-orange-50',
  deposit:    'text-green-600 bg-green-50',
  refund:     'text-blue-500 bg-blue-50',
  fee:        'text-gray-500 bg-gray-50',
};

const STATUS_BADGE: Record<string, string> = {
  completed:  'bg-green-100 text-green-700',
  success:    'bg-green-100 text-green-700',
  pending:    'bg-amber-100 text-amber-700',
  failed:     'bg-red-100 text-red-700',
  reversed:   'bg-gray-100 text-gray-600',
};

function fmt(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString()}`;
}

export default function Wallet() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet/balance')
      .then((r) => api.parseResponse<{ data?: Balance }>(r))
      .then((res) => { if (res.data) setBalance(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.get('/wallet/transactions')
      .then((r) => api.parseResponse<{ data?: Transaction[] | { transactions?: Transaction[] } }>(r))
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : ((res.data as any)?.transactions || []);
        setTransactions(list);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, []);

  const currency = balance?.currency || 'UGX';
  const totalCredits = transactions.filter((t) => ['credit', 'deposit'].includes(t.type.toLowerCase())).reduce((s, t) => s + t.amount, 0);
  const totalDebits  = transactions.filter((t) => ['debit', 'withdrawal'].includes(t.type.toLowerCase())).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Wallet</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your earnings and transaction history</p>
      </div>

      {/* Balance cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Main balance */}
        <div className="sm:col-span-2 bg-gradient-to-br from-primary-dark via-primary to-[#3daa4a] rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/8 pointer-events-none" />
          <div className="absolute bottom-0 right-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <WalletIcon className="w-4 h-4 text-white/60" />
              <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Available Balance</p>
            </div>
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-1">{balance ? fmt(balance.available, currency) : '—'}</p>
            )}
            {balance?.ledger !== undefined && (
              <p className="text-xs text-white/50 mt-2">Ledger: {fmt(balance.ledger, currency)}</p>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs text-gray-500">Total Earned</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{fmt(totalCredits, currency)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-xs text-gray-500">Total Withdrawn</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{fmt(totalDebits, currency)}</p>
          </div>
        </div>
      </div>

      {/* Action buttons (placeholder) */}
      <div className="flex gap-3 mb-6">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition">
          <ArrowUpRight className="w-4 h-4" /> Withdraw
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition">
          <TrendingUp className="w-4 h-4" /> View Statement
        </button>
      </div>

      {/* Transaction history */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Transaction History</h2>
          <span className="text-xs text-gray-400">{transactions.length} transactions</span>
        </div>

        {txLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <WalletIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const type = (tx.type || '').toLowerCase();
              const status = (tx.status || '').toLowerCase();
              const isCredit = ['credit', 'deposit', 'refund'].includes(type);
              const colorCls = TX_COLORS[type] || 'text-gray-600 bg-gray-50';
              return (
                <div key={tx.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition">
                  {/* Type icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorCls}`}>
                    {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {tx.metadata?.description || tx.metadata?.purpose || type}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {tx.counterparty?.name && <span className="text-xs text-gray-500">{tx.counterparty.name}</span>}
                      {tx.reference && <span className="text-[10px] text-gray-400 font-mono">{tx.reference}</span>}
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(tx.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  {/* Amount + status */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                      {isCredit ? '+' : '-'}{fmt(tx.amount, tx.currency || currency)}
                    </p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[status] || 'bg-gray-100 text-gray-500'}`}>
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
