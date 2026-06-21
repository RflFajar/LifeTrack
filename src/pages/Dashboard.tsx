import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  ChevronRight, 
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Plus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps): React.ReactElement => {
  const navigate = useNavigate();
  const { transactions: allTxs, balance: lifetimeBalance, loading: transactionsLoading } = useTransactions(user.uid, 'all');

  // Calculate finance metrics
  const { totalSavings, totalPureExpenses, dailyMoney } = useMemo(() => {
    let savingsBalance = 0;
    let pureExpenses = 0;
    let pureIncomes = 0;
    
    allTxs.forEach(tx => {
      if (tx.category === 'tabungan') {
        if (tx.type === 'expense') {
          savingsBalance += tx.amount; // Menabung
        } else {
          savingsBalance -= tx.amount; // Mengambil tabungan
        }
      } else {
        if (tx.type === 'expense') {
          pureExpenses += tx.amount; 
        } else {
          pureIncomes += tx.amount;
        }
      }
    });

    return {
      totalSavings: savingsBalance,
      totalPureExpenses: pureExpenses,
      dailyMoney: pureIncomes - pureExpenses
    };
  }, [allTxs]);

  // For overall balance (all income - all expense)
  const finalDailyMoney = useMemo(() => lifetimeBalance.income - lifetimeBalance.expense, [lifetimeBalance]);

  // Monthly spending
  const currentMonthSpending = useMemo(() => {
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    return allTxs.reduce((acc, tx) => {
      if (tx.type === 'expense' && tx.category !== 'tabungan' && tx.date.startsWith(currentMonthStr)) {
        return acc + tx.amount;
      }
      return acc;
    }, 0);
  }, [allTxs]);

  // Monthly income
  const currentMonthIncome = useMemo(() => {
    const currentMonthStr = format(new Date(), 'yyyy-MM');
    return allTxs.reduce((acc, tx) => {
      if (tx.type === 'income' && tx.category !== 'tabungan' && tx.date.startsWith(currentMonthStr)) {
        return acc + tx.amount;
      }
      return acc;
    }, 0);
  }, [allTxs]);

  // Latest 5 transactions
  const latestTransactions = useMemo(() => {
    return allTxs.slice(0, 5);
  }, [allTxs]);

  const getCategoryLabel = (category: string): string => {
    const mapping: Record<string, string> = {
      'gaji': 'Gaji / Kerja',
      'orang_tua': 'Dari Orang Tua',
      'ambil_tabungan': 'Ambil dari Tabungan',
      'bonus': 'Bonus / Komisi',
      'investasi': 'Investasi',
      'tabungan': 'Tabungan',
      'makanan': 'Makanan & Minuman',
      'belanja': 'Belanja/Kebutuhan',
      'kost': 'Kost / Sewa/Cicilan',
      'transportasi': 'Transportasi',
      'hiburan': 'Hiburan/Lifestyle',
      'lainnya': 'Lainnya'
    };
    return mapping[category.toLowerCase()] || category;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Top Banner Card */}
      <Card className="bg-natural-olive text-white p-8 overflow-hidden relative border-0 shadow-lg shadow-natural-olive/20 rounded-[40px]">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-20" />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="text-sm font-serif italic opacity-90 mb-1">Status Keuangan</h2>
            <p className="text-3xl font-serif font-bold tracking-tight mb-2">{formatDate(new Date())}</p>
            <p className="text-xs text-white/75 bg-white/10 px-3 py-1.5 rounded-xl inline-block backdrop-blur-sm border border-white/5 italic">
              Aplikasi telah disesuaikan khusus untuk memantau keuangan harian Anda secara maksimal.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-[28px] p-6 border border-white/10 text-center md:text-left">
            <p className="text-[10px] uppercase font-bold opacity-75 mb-1.5 tracking-widest flex items-center justify-center md:justify-start gap-1.5">
              <Wallet size={12} /> Sisa Uang Harian (Kas)
            </p>
            {transactionsLoading ? (
              <Skeleton className="h-10 w-44 bg-white/20 mx-auto md:mx-0" />
            ) : (
              <p className="text-3xl font-serif font-bold tracking-tight">{formatCurrency(finalDailyMoney)}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Main Stats Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white dark:bg-dark-card border border-natural-line/40 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-[32px]">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest mb-0.5">Pemasukan Bulan Ini</p>
            {transactionsLoading ? (
              <Skeleton className="h-6 w-28 bg-natural-line" />
            ) : (
              <p className="text-xl font-serif font-bold text-natural-ink dark:text-dark-text italic">{formatCurrency(currentMonthIncome)}</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-dark-card border border-natural-line/40 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-[32px]">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 rounded-2xl text-rose-600 dark:text-rose-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest mb-0.5">Pengeluaran Bulan Ini</p>
            {transactionsLoading ? (
              <Skeleton className="h-6 w-28 bg-natural-line" />
            ) : (
              <p className="text-xl font-serif font-bold text-natural-ink dark:text-dark-text italic">{formatCurrency(currentMonthSpending)}</p>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-white dark:bg-dark-card border border-natural-line/40 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-[32px]">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl text-amber-600 dark:text-amber-400">
            <PiggyBank size={24} />
          </div>
          <div>
            <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest mb-0.5">Brankas Tabungan</p>
            {transactionsLoading ? (
              <Skeleton className="h-6 w-28 bg-natural-line" />
            ) : (
              <p className="text-xl font-serif font-bold text-natural-ink dark:text-dark-text italic">{formatCurrency(totalSavings)}</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions */}
        <Card className="lg:col-span-2 p-6.5 bg-white dark:bg-dark-card border border-natural-line/40 dark:border-white/5 shadow-sm rounded-[36px] flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-serif font-bold text-natural-ink dark:text-dark-text italic">Transaksi Terbaru</h3>
              <p className="text-[10px] text-natural-mute uppercase tracking-widest font-bold mt-0.5">Pelacakan Arus Kas Riil Anda</p>
            </div>
            <button 
              onClick={() => navigate('/money')}
              className="text-xs text-natural-olive hover:text-natural-terracotta font-semibold flex items-center gap-1 transition-colors group"
            >
              Kelola Transaksi <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {transactionsLoading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 border-b border-natural-line/20">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : latestTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-natural-line/50 rounded-2xl h-48 bg-natural-bg/30">
                <p className="text-natural-mute font-serif italic">Belum ada transaksi tercatat.</p>
                <button 
                  onClick={() => navigate('/money')}
                  className="mt-3 text-xs bg-natural-olive text-white px-4 py-2 rounded-xl scale-95 hover:scale-100 transition-transform font-bold"
                >
                  Tambah Transaksi Pertama
                </button>
              </div>
            ) : (
              latestTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex justify-between items-center p-3.5 hover:bg-natural-bg dark:hover:bg-dark-bg-deep rounded-2xl transition-all border border-transparent hover:border-natural-line/40 dark:hover:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${
                      tx.type === 'income' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-natural-ink dark:text-dark-text text-sm">{tx.description || getCategoryLabel(tx.category)}</p>
                      <p className="text-[10px] text-natural-mute font-semibold uppercase tracking-widest">{getCategoryLabel(tx.category)} • {tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-serif font-semibold text-sm ${
                    tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Column: Dynamic Financial Context card */}
        <Card className="p-6 bg-white dark:bg-dark-card border border-natural-line/40 dark:border-white/5 shadow-sm rounded-[36px] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-natural-peach/10 text-natural-terracotta rounded-2xl w-fit">
              <Wallet size={24} />
            </div>
            <h4 className="text-xl font-serif font-bold text-natural-ink dark:text-dark-text italic">Panduan Penggunaan</h4>
            <p className="text-xs text-natural-mute leading-relaxed">
              Selamat datang di <strong>LifeTrack Keuangan</strong>. Aplikasi Anda sekarang telah dioptimalkan secara ketat untuk kebutuhan finansial saja. 
            </p>
            <ul className="text-xs text-natural-ink dark:text-dark-text space-y-2 list-disc pl-4">
              <li>Kelola transaksi pengeluaran dan pemasukan harian Anda secara teratur.</li>
              <li>Sistem tabungan kini dipisahkan untuk menjaga integritas dana harian Anda.</li>
              <li>Gunakan menu navigasi <strong>Keuangan</strong> di sebelah kiri untuk laporan visual grafis yang mendalam.</li>
            </ul>
          </div>
          
          <button 
            onClick={() => navigate('/money')}
            className="w-full bg-natural-olive hover:bg-natural-olive/95 text-white p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-natural-olive/10 mt-6"
          >
            <Plus size={16} /> Catat / Kelola Transaksi
          </button>
        </Card>
      </div>
    </div>
  );
};
