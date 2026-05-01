import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  BrainCircuit, 
  RefreshCw, 
  Sparkles,
  X,
  Search,
  Filter,
  PieChart,
  Wallet,
  Utensils,
  Car,
  Gamepad2,
  Receipt,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  ChevronDown, 
  AlertTriangle, 
  Target,
  Briefcase,
  Heart,
  ArrowUpRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, subMonths, isWithinInterval } from 'date-fns';
import { Card } from '../components/ui/Card';
import { CategorySelect } from '../components/ui/CategorySelect';
import { useTransactions } from '../hooks/useTransactions';
import { useBudgets } from '../hooks/useBudgets';
import { formatCurrency } from '../utils/formatters';
import { getFinancialAdvice } from '../services/gemini';
import { cn } from '../utils/cn';
import { validateTransaction } from '../utils/validators';
import { showToast } from '../context/ToastContext';
import { Transaction } from '../types';
import { TRANSACTION_CATEGORIES, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants';
import { exportToCSV } from '../utils/export';
import { Button } from '../components/ui/Button';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';
import { LucideIcon } from 'lucide-react';

// Charts
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { BalanceTrendChart } from '../components/charts/BalanceTrendChart';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Gamepad2,
  Receipt,
  HeartPulse,
  GraduationCap,
  Wallet,
  MoreHorizontal,
  Briefcase,
  Heart,
  Sparkles,
  ArrowUpRight
};

import { useProfile } from '../hooks/useProfile';
import { useAuthContext } from '../context/AuthContext';

interface MoneyTrackerProps {
  user: User;
}

export const MoneyTracker = ({ user }: MoneyTrackerProps): React.ReactElement => {
  const { profile } = useProfile(user.uid);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customRange, setCustomRange] = useState({ 
    start: format(new Date(), 'yyyy-MM-01'), 
    end: format(new Date(), 'yyyy-MM-dd') 
  });

  const { 
    transactions: allTxs, 
    balance: lifetimeBalance, 
    addTransaction, 
    deleteTransaction, 
    updateTransaction,
    loading: transactionsLoading
  } = useTransactions(user.uid, 'all');

  // Filter transactions for the current view period
  const txs = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    if (period === 'weekly') {
      start = startOfWeek(now);
      end = endOfWeek(now);
    } else if (period === 'monthly') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else if (period === 'yearly') {
      start = startOfYear(now);
      end = endOfYear(now);
    } else {
      start = parseISO(customRange.start);
      end = parseISO(customRange.end);
    }

    return allTxs.filter(tx => {
      const txDate = parseISO(tx.date);
      return txDate >= start && txDate <= end;
    });
  }, [allTxs, period, customRange]);

  // Data specifically for 6-month charts
  const chartTxs = useMemo(() => {
    const now = new Date();
    const start = subMonths(startOfMonth(now), 5);
    return allTxs.filter(tx => parseISO(tx.date) >= start);
  }, [allTxs]);

  // Budget management
  const currentMonthKey = format(new Date(), 'yyyy-MM');
  const { budgets, setCategoryBudget } = useBudgets(user.uid, currentMonthKey);

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('makanan');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Handler for type switch
  const handleTypeSwitch = (newType: 'income' | 'expense') => {
    setType(newType);
    if (newType === 'income') {
      setCat('gaji');
    } else {
      setCat('makanan');
    }
  };

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [advice, setAdvice] = useState<string[]>([]);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  const getCategoryIcon = (catId: string): React.ReactElement => {
    const config = TRANSACTION_CATEGORIES.find(c => c.id === catId);
    if (!config) return <MoreHorizontal size={18} />;
    const Icon = CATEGORY_ICONS[config.icon] || MoreHorizontal;
    return <Icon size={18} />;
  };

  const getCategoryLabel = (catId: string): string => {
    return TRANSACTION_CATEGORIES.find(c => c.id === catId)?.label || catId;
  };

  const filteredTxs = useMemo(() => {
    return txs.filter(tx => {
      const label = getCategoryLabel(tx.category).toLowerCase();
      const matchesSearch = 
        label.includes(searchTerm.toLowerCase()) || 
        tx.amount.toString().includes(searchTerm);
      const matchesCat = filterCat === 'all' || tx.category === filterCat;
      return matchesSearch && matchesCat;
    });
  }, [txs, searchTerm, filterCat]);

  const spendingPerCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    txs.forEach(tx => {
      if (tx.type === 'expense') {
        const catId = tx.category.toLowerCase();
        totals[catId] = (totals[catId] || 0) + tx.amount;
      }
    });
    return totals;
  }, [txs]);

  const handleAddTx = async (): Promise<void> => {
    const error = validateTransaction({ type, amount: parseFloat(amount), category: cat });
    if (error) {
      showToast(error, 'error');
      return;
    }
    setTxLoading(true);
    await addTransaction(type, parseFloat(amount), cat, date, description);
    setAmount('');
    setDescription('');
    setTxLoading(false);
  };

  const handleExport = (): void => {
    const csvData = txs.map(t => ({
      Tanggal: t.date,
      Tipe: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: getCategoryLabel(t.category),
      Jumlah: t.amount
    }));
    exportToCSV(csvData, `Transaksi_${period}`);
  };

  const [txLoading, setTxLoading] = useState(false);

  const { totalSavings, totalPureExpenses, dailyMoney } = useMemo(() => {
    let savingsBalance = 0;
    let pureExpenses = 0;
    let pureIncomes = 0;
    
    // Calculate lifetime savings and balance
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

  // For the "Sisa Uang Harian" card, we show the actual balance (all income - all expense)
  const finalDailyMoney = useMemo(() => lifetimeBalance.income - lifetimeBalance.expense, [lifetimeBalance]);

  // For the "Total Belanja" card, maybe it's better to show the expenditure of the SELECTED PERIOD?
  // Let's keep it as expenditures of the current period to maintain context.
  const currentPeriodSpending = useMemo(() => {
    return txs.reduce((acc, tx) => (tx.type === 'expense' && tx.category !== 'tabungan') ? acc + tx.amount : acc, 0);
  }, [txs]);

  if (transactionsLoading) {
    return (
      <div className="space-y-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-24 rounded-[32px]" />
          <Skeleton className="h-24 rounded-[32px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const handleUpdate = async (): Promise<void> => {
    if (!editingId) return;
    const error = validateTransaction({ 
      type: editData.type || 'expense', 
      amount: editData.amount, 
      category: editData.category 
    });
    if (error) {
      showToast(error, 'error');
      return;
    }
    await updateTransaction(editingId, editData);
    setEditingId(null);
  };

  const handleDelete = async (id: string): Promise<void> => {
    await deleteTransaction(id);
    setConfirmDeleteId(null);
  };

  const getAdvice = async (): Promise<void> => {
    if (!profile) {
      showToast('Profil pengguna tidak ditemukan', 'error');
      return;
    }
    setLoadingAdvice(true);
    const res = await getFinancialAdvice(txs, profile);
    setAdvice(res.tips);
    setLoadingAdvice(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-serif font-bold text-natural-ink dark:text-dark-text italic">Money Tracker</h2>
          <Button variant="outline" size="sm" onClick={handleExport} aria-label="Ekspor data transaksi ke CSV">Ekspor CSV</Button>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-dark-card p-2 rounded-2xl border border-natural-line/50 dark:border-white/5 shadow-sm overflow-x-auto no-scrollbar">
          {(['weekly', 'monthly', 'yearly', 'custom'] as const).map(p => (
            <button 
              key={p}
              onClick={() => setPeriod(p)}
              aria-label={`Lihat transaksi ${p}`}
              className={cn(
                "px-4 py-1.5 rounded-xl text-[10px] font-bold transition-all capitalize whitespace-nowrap",
                period === p ? "bg-natural-olive text-white shadow-sm" : "text-natural-mute hover:bg-natural-bg"
              )}
            >
              {p === 'weekly' ? 'Mingguan' : p === 'monthly' ? 'Bulanan' : p === 'yearly' ? 'Tahunan' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {period === 'custom' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-natural-line/50 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-natural-mute uppercase">Mulai</label>
            <input 
              type="date" 
              value={customRange.start} 
              onChange={e => setCustomRange({...customRange, start: e.target.value})}
              className="p-2 bg-natural-bg rounded-xl text-xs outline-none border border-natural-line"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold text-natural-mute uppercase">Sampai</label>
            <input 
              type="date" 
              value={customRange.end} 
              onChange={e => setCustomRange({...customRange, end: e.target.value})}
              className="p-2 bg-natural-bg rounded-xl text-xs outline-none border border-natural-line"
            />
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-6 border-l-4 border-l-natural-olive relative overflow-hidden bg-natural-olive/5">
          <div className="w-14 h-14 bg-white dark:bg-dark-card rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <Wallet className="text-natural-olive" />
          </div>
          <div>
            <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest">Sisa Uang Harian</p>
            <p className="text-2xl font-serif font-bold text-natural-ink dark:text-dark-text italic">{formatCurrency(finalDailyMoney)}</p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-natural-olive/10 rounded-full" />
        </Card>

        <Card className="flex items-center gap-6 border-l-4 border-l-natural-terracotta relative overflow-hidden">
          <div className="w-14 h-14 bg-natural-peach/30 rounded-2xl flex items-center justify-center shrink-0">
            <TrendingDown className="text-natural-terracotta" />
          </div>
          <div>
            <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest">Belanja {period === 'weekly' ? 'Mingguan' : period === 'monthly' ? 'Bulanan' : period === 'yearly' ? 'Tahunan' : 'Custom'}</p>
            <p className="text-2xl font-serif font-bold text-natural-ink dark:text-dark-text italic">{formatCurrency(currentPeriodSpending)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-6 border-l-4 border-l-blue-500 relative overflow-hidden bg-blue-50">
          <div className="w-14 h-14 bg-white dark:bg-dark-card rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <Target className="text-blue-500" />
          </div>
          <div>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Dana Tabungan</p>
            <p className="text-2xl font-serif font-bold text-blue-900 italic">{formatCurrency(totalSavings)}</p>
          </div>
          <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-blue-500/10 rounded-full" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form & Budget Planning */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-fit">
            <h3 className="text-lg font-serif italic text-natural-olive font-bold mb-6 flex items-center gap-2">
              <Plus size={20} className="text-natural-terracotta" /> Catat Transaksi
            </h3>
            
            <div className="flex gap-2 p-1 bg-natural-bg rounded-2xl mb-6 border border-natural-line">
              <button 
                onClick={() => handleTypeSwitch('expense')}
                className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-all", type === 'expense' ? "bg-white shadow text-natural-ink" : "text-natural-mute")}
              >Pengeluaran</button>
              <button 
                onClick={() => handleTypeSwitch('income')}
                className={cn("flex-1 py-2.5 rounded-xl text-xs font-bold transition-all", type === 'income' ? "bg-white shadow text-natural-ink" : "text-natural-mute")}
              >Pemasukan</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Jumlah (Rp)</label>
                <input 
                  type="number" 
                  value={amount} onChange={e => setAmount(e.target.value)}
                  className="w-full mt-1 p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm font-serif italic"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Kategori</label>
                <CategorySelect 
                  value={cat} 
                  onChange={setCat}
                  type={type}
                  className="mt-1"
                />
              </div>

              <AnimatePresence>
                {(cat === 'lainnya' || description.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Deskripsi / Catatan</label>
                    <input 
                      type="text" 
                      value={description} onChange={e => setDescription(e.target.value)}
                      className="w-full mt-1 p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                      placeholder={type === 'income' ? "Contoh: Bonus proyek web" : "Contoh: Beli kado ulang tahun"}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Tanggal</label>
                <input 
                  type="date" 
                  value={date} onChange={e => setDate(e.target.value)}
                  className="w-full mt-1 p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                />
              </div>

              <Button 
                onClick={handleAddTx}
                loading={txLoading}
                className="w-full py-4 font-serif italic text-lg"
              >
                Simpan Transaksi
              </Button>
            </div>
          </Card>

          <Card className="bg-natural-bg border-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif italic text-natural-ink font-bold flex items-center gap-2">
                <Target size={20} className="text-natural-terracotta" /> Budget Control
              </h3>
              <button 
                onClick={() => setShowBudgetModal(true)}
                aria-label="Atur anggaran bulanan"
                className="text-[10px] font-bold text-natural-olive border border-natural-olive/30 px-3 py-1 rounded-full hover:bg-natural-olive hover:text-white transition-all uppercase tracking-widest"
              >Atur Budget</button>
            </div>

            <div className="space-y-5">
              {EXPENSE_CATEGORIES.map(category => {
                const limit = budgets[category.id] || 0;
                if (limit === 0) return null;
                const spent = spendingPerCategory[category.id] || 0;
                const percent = Math.min((spent / limit) * 100, 100);
                const isOver = spent > limit;
                const isNear = spent > limit * 0.8;

                return (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-tight">
                      <span className="flex items-center gap-2 text-natural-ink">
                        {getCategoryIcon(category.id)}
                        {category.label}
                      </span>
                      <span className={cn(isOver ? "text-red-500" : isNear ? "text-natural-terracotta" : "text-natural-mute")}>
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-natural-line/50">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        className={cn(
                          "h-full transition-all duration-1000",
                          isOver ? "bg-red-500" : isNear ? "bg-natural-terracotta" : "bg-natural-olive"
                        )}
                      />
                    </div>
                    {isOver && (
                      <p className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                        <AlertTriangle size={10} /> Melebihi anggaran sebesar {formatCurrency(spent - limit)}
                      </p>
                    )}
                  </div>
                );
              })}
              {Object.keys(budgets).length === 0 && (
                <div className="text-center py-6">
                  <PieChart className="w-10 h-10 text-natural-line mx-auto mb-2 opacity-30" />
                  <p className="text-[11px] text-natural-mute italic">Belum ada anggaran yang disetel.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Charts & Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h3 className="font-serif italic text-natural-olive font-bold mb-6 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} /> Pemasukan vs Pengeluaran (6 Bln)
              </h3>
              <IncomeExpenseChart transactions={chartTxs} />
            </Card>
            <Card>
              <h3 className="font-serif italic text-natural-olive font-bold mb-6 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <PieChart size={14} /> Distribusi Pengeluaran
              </h3>
              <CategoryPieChart transactions={txs} />
            </Card>
            <Card className="md:col-span-2">
              <h3 className="font-serif italic text-natural-olive font-bold mb-6 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} /> Tren Saldo (6 Bln terakhir)
              </h3>
              <BalanceTrendChart transactions={chartTxs} />
            </Card>
          </div>

          {/* AI Insights Card */}
          <Card className="bg-natural-olive text-white border-0 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-serif italic flex items-center gap-2">
                  <BrainCircuit className="text-natural-peach" /> Finance Intelligence
                </h3>
                <button 
                  onClick={getAdvice} 
                  disabled={loadingAdvice}
                  className="text-[10px] bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl flex items-center gap-2 transition-colors uppercase font-bold tracking-widest"
                >
                  {loadingAdvice ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-natural-peach" />}
                  Dapatkan Saran
                </button>
              </div>
              {advice.length > 0 ? (
                <ul className="space-y-3">
                  {advice.map((t, i) => (
                    <motion.li 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="flex items-start gap-4 text-[13px] text-white/90 leading-relaxed font-light bg-white/5 p-3 rounded-2xl"
                    >
                      <Sparkles className="w-4 h-4 text-natural-peach shrink-0 mt-0.5" />
                      {t}
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-white/70 italic font-light">Ketuk tombol di atas untuk mendapatkan analsis keuangan berbasis pengeluaran periode ini.</p>
              )}
            </div>
            <div className="absolute -right-20 -bottom-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
          </Card>

          {/* Activity List with Filter & Search */}
          <Card className="p-0 overflow-hidden border-natural-line/50">
            <div className="p-6 border-b border-natural-line flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-serif italic text-natural-ink font-bold text-lg">Daftar Transaksi</h3>
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-mute" size={14} />
                  <input 
                    type="text" 
                    placeholder="Cari..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-natural-bg border border-natural-line rounded-xl text-xs outline-none focus:ring-1 focus:ring-natural-olive w-32 md:w-48"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-natural-mute" size={14} />
                  <select 
                    value={filterCat}
                    onChange={e => setFilterCat(e.target.value)}
                    className="pl-9 pr-6 py-2 bg-natural-bg border border-natural-line rounded-xl text-xs outline-none appearance-none cursor-pointer"
                  >
                    <option value="all">Semua</option>
                    {TRANSACTION_CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>{category.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto no-scrollbar">
              {filteredTxs.length === 0 ? (
                <div className="p-20 text-center">
                  <Search className="w-12 h-12 text-natural-line mx-auto mb-4 opacity-30" />
                  <p className="text-natural-mute font-serif italic text-sm">Tidak ada transaksi yang cocok dengan filter atau pencarian.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {filteredTxs.map(tx => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={tx.id} 
                      className="p-5 border-b border-natural-line/30 flex items-center justify-between hover:bg-natural-bg/30 transition-colors group"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm relative",
                          tx.category === 'tabungan' ? "bg-blue-100 text-blue-600 ring-4 ring-blue-50" : 
                          tx.type === 'income' ? "bg-natural-olive/10 text-natural-olive" : "bg-natural-terracotta/10 text-natural-terracotta"
                        )}>
                          {getCategoryIcon(tx.category)}
                          {tx.category === 'tabungan' && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                              <Target size={8} className="text-white" />
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {editingId === tx.id ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <CategorySelect 
                                value={editData.category || ''} 
                                onChange={v => setEditData({...editData, category: v})}
                                className="min-w-[140px]"
                              />
                              <input 
                                type="number" 
                                value={editData.amount || ''} 
                                onChange={e => setEditData({...editData, amount: parseFloat(e.target.value)})}
                                className="bg-white border rounded-xl px-3 py-1.5 text-xs w-24 outline-none"
                              />
                              <div className="flex gap-1">
                                <button onClick={handleUpdate} className="bg-natural-olive text-white p-1.5 rounded-lg"><RefreshCw size={14} /></button>
                                <button onClick={() => setEditingId(null)} className="bg-red-500 text-white p-1.5 rounded-lg"><X size={14} /></button>
                              </div>
                            </div>
                          ) : (
                            <div onClick={() => { setEditingId(tx.id); setEditData(tx); }} className="cursor-pointer group">
                              <div className="flex items-center gap-2">
                                <p className="font-serif font-bold text-natural-ink truncate group-hover:text-natural-olive transition-colors">
                                  {tx.description && tx.category === 'lainnya' ? tx.description : getCategoryLabel(tx.category)}
                                </p>
                                {tx.category === 'tabungan' && (
                                  <span className="text-[8px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-black tracking-tighter uppercase">Savings</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                {tx.description && tx.category !== 'lainnya' && (
                                  <span className="text-[10px] text-natural-mute italic">{tx.description}</span>
                                )}
                                <span className={cn(
                                  "text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest",
                                  tx.category === 'tabungan' ? "bg-blue-100 text-blue-600" :
                                  tx.type === 'income' ? "bg-natural-olive/10 text-natural-olive" : "bg-natural-terracotta/10 text-natural-terracotta"
                                )}>
                                  {tx.category === 'tabungan' ? 'Tabungan' : tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                                </span>
                                <span className="text-[10px] text-natural-mute font-bold uppercase tracking-tight">{format(parseISO(tx.date), 'dd MMM yyyy')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className={cn("font-serif font-bold text-lg italic", tx.type === 'income' ? "text-natural-olive" : "text-natural-terracotta")}>
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </p>
                        </div>
                        
                        {confirmDeleteId === tx.id ? (
                          <div className="flex items-center gap-2 animate-in zoom-in duration-200">
                            <button 
                              onClick={() => handleDelete(tx.id)}
                              className="bg-red-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm hover:bg-red-600 transition-colors"
                            >Hapus</button>
                            <button 
                              onClick={() => setConfirmDeleteId(null)}
                              className="bg-natural-bg text-natural-mute px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-natural-line transition-colors"
                            >Batal</button>
                          </div>
                        ) : (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => { setEditingId(tx.id); setEditData(tx); }}
                              className="p-2 bg-natural-bg text-natural-mute hover:text-natural-olive rounded-full transition-colors"
                            >
                              <RefreshCw size={16} />
                            </button>
                            <button 
                              onClick={() => setConfirmDeleteId(tx.id)}
                              className="p-2 bg-natural-bg text-natural-mute hover:text-red-500 rounded-full transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Budget Modal */}
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-natural-line flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-serif italic text-natural-olive font-bold">Atur Anggaran</h3>
                  <p className="text-xs text-natural-mute italic mt-1">Periode: {format(new Date(), 'MMMM yyyy')}</p>
                </div>
                <button onClick={() => setShowBudgetModal(false)} className="p-2 hover:bg-natural-bg rounded-full transition-colors text-natural-mute">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-6 flex-1 no-scrollbar">
                {EXPENSE_CATEGORIES.map(category => (
                  <div key={category.id} className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-natural-bg rounded-xl text-natural-olive">
                        {getCategoryIcon(category.id)}
                      </div>
                      <span className="font-bold text-natural-ink text-sm">{category.label}</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-mute text-xs font-bold font-serif">Rp</span>
                      <input 
                        type="number"
                        placeholder="Limit Anggaran"
                        defaultValue={budgets[category.id] || ''}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val)) setCategoryBudget(category.id, val);
                          else if (e.target.value === '') setCategoryBudget(category.id, 0);
                        }}
                        className="w-full pl-10 pr-4 py-3 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm font-serif italic focus:ring-1 focus:ring-natural-olive"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 bg-natural-bg border-t border-natural-line">
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="w-full bg-natural-olive text-white py-4 rounded-2xl font-bold font-serif italic text-lg shadow-xl shadow-natural-olive/20"
                >Selesai Pengaturan</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
