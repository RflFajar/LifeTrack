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
import { useProfile } from '../hooks/useProfile';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps): React.ReactElement => {
  const navigate = useNavigate();
  const { transactions: allTxs, balance: lifetimeBalance, loading: transactionsLoading } = useTransactions(user.uid, 'all');
  const { profile } = useProfile(user.uid);

  const displayName = profile?.name || user.displayName || 'Pengguna';

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
      <Card className="bg-natural-olive text-white p-6 md:p-8 overflow-hidden relative border-0 shadow-sm rounded-3xl flex flex-col justify-between min-h-[220px]">
        {/* Subtle orange warm fintech radial light glow in the bottom-right corner */}
        <div className="absolute right-[-40px] bottom-[-40px] w-80 h-80 rounded-full bg-gradient-to-br from-[#C26B47]/20 via-[#FFE8D6]/10 to-transparent blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-6">
          <div className="text-sm md:text-base text-white/95 font-medium flex items-center gap-1.5">
            Halo, {displayName}
          </div>
          
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-white/70 tracking-widest">
              Sisa Uang Harian (Kas)
            </p>
            {transactionsLoading ? (
              <Skeleton className="h-12 w-56 bg-white/20" />
            ) : (
              <p className="text-4xl md:text-5xl font-serif font-semibold tracking-tight font-numeric py-0.5">
                {formatCurrency(finalDailyMoney)}
              </p>
            )}
          </div>

          <div className="text-xs md:text-sm text-white/75 font-normal tracking-wide">
            {formatDate(new Date())}
          </div>
        </div>
      </Card>

      {/* Main Stats Triad */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 bg-white dark:bg-dark-card border border-natural-line/45 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-emerald-600 dark:text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-mute font-bold uppercase tracking-widest mb-0.5">Pemasukan Bulan Ini</p>
            {transactionsLoading ? (
              <Skeleton className="h-6 w-28 bg-natural-line" />
            ) : (
              <p className="text-lg font-display font-semibold text-natural-ink dark:text-dark-text font-numeric">{formatCurrency(currentMonthIncome)}</p>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-dark-card border border-natural-line/45 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-600 dark:text-rose-400">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-[10px] text-mute font-bold uppercase tracking-widest mb-0.5">Pengeluaran Bulan Ini</p>
            {transactionsLoading ? (
              <Skeleton className="h-6 w-28 bg-natural-line" />
            ) : (
              <p className="text-lg font-display font-semibold text-natural-ink dark:text-dark-text font-numeric">{formatCurrency(currentMonthSpending)}</p>
            )}
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-dark-card border border-natural-line/45 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow rounded-xl">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-amber-600 dark:text-amber-400">
            <PiggyBank size={20} />
          </div>
          <div>
            <p className="text-[10px] text-mute font-bold uppercase tracking-widest mb-0.5">Brankas Tabungan</p>
            {transactionsLoading ? (
              <Skeleton className="h-6 w-28 bg-natural-line" />
            ) : (
              <p className="text-lg font-display font-semibold text-natural-ink dark:text-dark-text font-numeric">{formatCurrency(totalSavings)}</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Transactions */}
        <Card className="lg:col-span-2 p-5 bg-white dark:bg-dark-card border border-natural-line/40 dark:border-white/5 shadow-sm rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-display font-semibold text-ink dark:text-white">Transaksi Terbaru</h3>
              <p className="text-[10px] text-mute uppercase tracking-widest font-semibold mt-0.5">Pelacakan Arus Kas Riil Anda</p>
            </div>
            <button 
              onClick={() => navigate('/money')}
              className="text-xs text-accent hover:text-natural-terracotta font-semibold flex items-center gap-1 transition-colors group"
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
                    <div className={`p-2.5 rounded-lg ${
                      tx.type === 'income' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                    }`}>
                      {tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                    </div>
                    <div>
                      <p className="font-semibold text-natural-ink dark:text-dark-text text-sm">{tx.description || getCategoryLabel(tx.category)}</p>
                      <p className="text-[10px] text-mute font-semibold uppercase tracking-widest">{getCategoryLabel(tx.category)} • {tx.date}</p>
                    </div>
                  </div>
                  <p className={`font-display font-semibold text-sm font-numeric ${
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
        <Card className="p-6 bg-white dark:bg-dark-card border border-natural-line/45 dark:border-white/5 shadow-sm rounded-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 bg-natural-peach/15 text-natural-terracotta rounded-xl w-fit">
              <Sparkles size={24} />
            </div>
            <h4 className="text-lg font-display font-semibold text-ink dark:text-white tracking-tight">Kecerdasan Keuangan</h4>
            
            {/* Dynamic Tips Rotating / Displaying */}
            <div className="p-4 bg-bg dark:bg-dark-bg-deep border border-line rounded-lg space-y-2">
              <span className="text-[9px] font-bold text-natural-terracotta uppercase tracking-wider block">Tip Hari Ini</span>
              <p className="text-xs text-mute dark:text-mute font-medium leading-relaxed">
                "Batasi pengeluaran makan di luar dan belokkan sisa Rp 10.000 harian Anda langsung ke Brankas Tabungan untuk mempercepat tercapainya goal finansial."
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="space-y-2.5 pt-2">
              <span className="text-[10px] font-bold text-mute uppercase tracking-widest block">Akses Cepat</span>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => navigate('/money')}
                  className="p-2.5 text-center bg-bg dark:bg-dark-bg-deep hover:bg-line border border-line rounded-md text-xs font-semibold text-ink transition-all flex items-center justify-center gap-1"
                >
                  <ArrowUpRight size={13} className="text-emerald-500" /> + Masuk
                </button>
                <button 
                  onClick={() => navigate('/money')}
                  className="p-2.5 text-center bg-bg dark:bg-dark-bg-deep hover:bg-line border border-line rounded-md text-xs font-semibold text-ink transition-all flex items-center justify-center gap-1"
                >
                  <ArrowDownLeft size={13} className="text-rose-500" /> + Keluar
                </button>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => navigate('/money')}
            className="w-full bg-accent hover:bg-accent/95 text-white p-3.5 rounded-md font-semibold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-sm mt-6"
          >
            <Plus size={16} /> Kelola Transaksi Selengkapnya
          </button>
        </Card>
      </div>
    </div>
  );
};
