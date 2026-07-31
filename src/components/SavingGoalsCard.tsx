import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Calendar, 
  CheckCircle,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Trophy,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useSavingGoals } from '../hooks/useSavingGoals';
import { formatCurrency } from '../utils/formatters';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { showToast } from '../context/ToastContext';
import { safeAddDoc } from '../services/firestore';
import { Timestamp } from 'firebase/firestore';
import { cn } from '../utils/cn';

interface SavingGoalsCardProps {
  userId: string;
}

export const SavingGoalsCard = ({ userId }: SavingGoalsCardProps) => {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useSavingGoals(userId);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Impian');

  // Fast current amount quick deposit states
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositValue, setDepositValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const activeGoals = useMemo(() => goals.filter(g => !g.isCompleted && g.status !== 'completed'), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.isCompleted || g.status === 'completed'), [goals]);

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setCategory('Impian');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul tujuan tabungan tidak boleh kosong', 'warning');
      return;
    }
    const targetVal = parseFloat(targetAmount);
    if (isNaN(targetVal) || targetVal <= 0) {
      showToast('Target dana harus lebih besar dari 0', 'warning');
      return;
    }
    const currentVal = parseFloat(currentAmount) || 0;
    if (currentVal < 0) {
      showToast('Kumpulan dana awal tidak boleh negatif', 'warning');
      return;
    }

    const goalId = await addGoal({
      title,
      targetAmount: targetVal,
      currentAmount: currentVal,
      category,
      deadline: deadline || undefined,
      description: '',
      isCompleted: false,
      status: 'active'
    });

    if (goalId) {
      resetForm();
    }
  };

  const handleQuickAddFunds = async (goal: any) => {
    const depositAmt = parseFloat(depositValue);
    if (isNaN(depositAmt) || depositAmt <= 0) {
      showToast('Masukkan jumlah tabungan tambahan yang valid', 'warning');
      return;
    }

    const txId = await safeAddDoc(`users/${userId}/transactions`, {
      type: 'expense',
      amount: depositAmt,
      category: 'tabungan',
      date: new Date().toISOString().split('T')[0],
      description: `Menabung untuk: ${goal.title}`,
      goalId: goal.id,
      userId,
      createdAt: Timestamp.now()
    }, `Berhasil menabung ${formatCurrency(depositAmt)} untuk ${goal.title}`);

    if (txId) {
      setDepositGoalId(null);
      setDepositValue('');
    }
  };

  const handleCompleteGoal = async (goal: any) => {
    const success = await updateGoal(goal.id, {
      isCompleted: true,
      status: 'completed',
      completedAt: new Date().toISOString().split('T')[0]
    });
    if (success) {
      showToast(`🎉 Selamat! Goal "${goal.title}" telah diselesaikan & disimpan di Goal Selesai!`, 'success');
      setActiveTab('completed');
    }
  };

  const handleReopenGoal = async (goal: any) => {
    const success = await updateGoal(goal.id, {
      isCompleted: false,
      status: 'active'
    });
    if (success) {
      showToast(`Goal "${goal.title}" dipindahkan kembali ke Goal Aktif`, 'info');
      setActiveTab('active');
    }
  };

  const handleStartEdit = (goal: any) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setCategory(goal.category || 'Impian');
    setDeadline(goal.deadline || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const targetVal = parseFloat(targetAmount);
    if (isNaN(targetVal) || targetVal <= 0) {
      showToast('Target dana harus lebih besar dari 0', 'warning');
      return;
    }
    const currentVal = parseFloat(currentAmount) || 0;

    const success = await updateGoal(editingId, {
      title,
      targetAmount: targetVal,
      currentAmount: Math.min(currentVal, targetVal),
      category,
      deadline: deadline || undefined
    });

    if (success) {
      resetForm();
    }
  };

  const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

  return (
    <Card className="bg-natural-bg/50 border border-natural-line/80 dark:bg-dark-card/20 dark:border-white/5 rounded-[32px] p-4 sm:p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-natural-line/30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'active' 
                ? "bg-natural-olive text-white shadow-sm" 
                : "bg-natural-bg dark:bg-dark-card/40 text-natural-mute hover:bg-natural-line/40"
            )}
          >
            <Target size={13} />
            <span>Goal Aktif</span>
            <span className={cn(
              "px-1.5 py-0.2 rounded-full text-[9px] font-black",
              activeTab === 'active' ? "bg-white/20 text-white" : "bg-natural-line/60 text-natural-ink"
            )}>
              {activeGoals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
              activeTab === 'completed' 
                ? "bg-emerald-600 text-white shadow-sm" 
                : "bg-natural-bg dark:bg-dark-card/40 text-natural-mute hover:bg-natural-line/40"
            )}
          >
            <Trophy size={13} />
            <span>Goal Selesai</span>
            {completedGoals.length > 0 && (
              <span className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-black",
                activeTab === 'completed' ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
              )}>
                {completedGoals.length}
              </span>
            )}
          </button>
        </div>

        {!isAdding && !editingId && activeTab === 'active' && (
          <button 
            id="add-saving-goal-btn"
            onClick={() => setIsAdding(true)}
            className="text-[10px] font-bold text-natural-olive border border-natural-olive/30 px-3 py-1 rounded-full hover:bg-natural-olive hover:text-white transition-all uppercase tracking-widest flex items-center gap-1 shrink-0 self-start sm:self-auto"
          >
            <Plus size={10} /> Tambah Goal
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {(isAdding || editingId) ? (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={editingId ? handleSaveEdit : handleAddGoal}
            className="bg-white dark:bg-dark-card border border-natural-line/60 dark:border-white/5 rounded-3xl p-5 space-y-4 mb-4"
          >
            <div className="flex justify-between items-center border-b border-natural-line/30 pb-2">
              <h4 className="font-serif italic font-bold text-natural-olive text-sm">
                {editingId ? 'Edit Goal Tabungan' : 'Buat Goal Tabungan Baru'}
              </h4>
              <button type="button" onClick={resetForm} className="text-natural-mute hover:text-natural-terracotta transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Nama Impian / Goal</label>
                <input 
                  type="text" 
                  value={title} 
                  required
                  onChange={e => setTitle(e.target.value)}
                  className="w-full mt-1 p-3 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-xl outline-none text-xs"
                  placeholder="Contoh: Beli Laptop Baru, Liburan ke Bali"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Kategori</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full mt-1 p-3 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-xl outline-none text-xs text-natural-ink dark:text-dark-text"
                  >
                    <option value="Impian">Impian/Tujuan</option>
                    <option value="Investasi">Investasi</option>
                    <option value="Dana Darurat">Dana Darurat</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Kendaraan">Kendaraan</option>
                    <option value="Travel">Travel/Liburan</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Tenggat Waktu</label>
                  <input 
                    type="date" 
                    value={deadline} 
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full mt-1 p-3 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-xl outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Target Dana (Rp)</label>
                  <input 
                    type="number" 
                    value={targetAmount} 
                    required
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full mt-1 p-3 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-xl outline-none text-xs font-bold"
                    placeholder="Contoh: 15000000"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Tabungan Awal (Rp)</label>
                  <input 
                    type="number" 
                    value={currentAmount} 
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full mt-1 p-3 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-xl outline-none text-xs font-bold"
                    placeholder="Contoh: 1000000"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                type="submit" 
                className="flex-1 py-3 text-xs font-bold"
              >
                {editingId ? 'Simpan Perubahan' : 'Masukkan Goal'}
              </Button>
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-3 bg-natural-bg text-natural-mute hover:bg-natural-terracotta/20 hover:text-natural-terracotta rounded-2xl text-xs font-bold transition-all border border-natural-line/40"
              >
                Batal
              </button>
            </div>
          </motion.form>
        ) : null}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-4 py-4">
          <div className="h-20 bg-white dark:bg-dark-card border rounded-2xl animate-pulse" />
          <div className="h-20 bg-white dark:bg-dark-card border rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-4">
          {displayedGoals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const isReached = goal.currentAmount >= goal.targetAmount || goal.isCompleted || goal.status === 'completed';

            let compactRemaining = formatCurrency(remaining);
            if (remaining >= 1_000_000) {
              compactRemaining = `Rp ${((remaining) / 1_000_000).toFixed(1).replace('.0', '')} jt`;
            } else if (remaining >= 1_000) {
              compactRemaining = `Rp ${((remaining) / 1_000).toFixed(1).replace('.0', '')} rb`;
            }

            return (
              <motion.div 
                layout
                key={goal.id} 
                id={`goal-${goal.id}`}
                className={cn(
                  "border rounded-3xl p-4 sm:p-6 relative overflow-hidden group shadow-sm transition-all duration-300",
                  goal.isCompleted || goal.status === 'completed'
                    ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-800/40"
                    : "bg-white dark:bg-dark-card border-natural-line/45 dark:border-white/5 hover:shadow-md"
                )}
              >
                {isReached && (
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white px-3 py-1 rounded-bl-2xl flex items-center gap-1 text-[9px] font-black uppercase tracking-widest shadow-sm">
                    <CheckCircle2 size={11} /> {goal.isCompleted ? 'Selesai & Disimpan' : 'Tercapai!'}
                  </div>
                )}

                {/* Edit & Delete actions on hover/focus */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {confirmDeleteId === goal.id ? (
                    <div className="flex items-center gap-1 animate-in zoom-in-95 duration-200 bg-white/90 dark:bg-dark-card/90 p-1 rounded-lg shadow-sm">
                      <button 
                        onClick={async () => {
                          await deleteGoal(goal.id);
                          setConfirmDeleteId(null);
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-md transition-colors"
                      >
                        Hapus
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(null)}
                        className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-bold px-2 py-1 rounded-md"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm p-1 rounded-lg border border-natural-line/40 flex gap-0.5">
                      {!goal.isCompleted && (
                        <button 
                          onClick={() => handleStartEdit(goal)}
                          className="p-1 text-natural-mute hover:text-natural-olive rounded-md"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      <button 
                        onClick={() => setConfirmDeleteId(goal.id)}
                        className="p-1 text-natural-mute hover:text-red-500 rounded-md"
                        title="Hapus"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-2.5 flex items-center gap-2">
                  <span className="inline-block text-[11px] bg-natural-peach/30 dark:bg-natural-peach/5 text-natural-terracotta dark:text-natural-terracotta px-3 py-0.5 rounded-full font-medium">
                    {goal.category || 'Impian'}
                  </span>
                  {goal.completedAt && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold italic">
                      • Diselesaikan {goal.completedAt}
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-semibold text-natural-ink dark:text-dark-text text-xl mb-3.5 tracking-tight flex items-center gap-2">
                  {goal.title}
                  {goal.isCompleted && <Trophy size={18} className="text-amber-500" />}
                </h4>

                <div className="space-y-3">
                  {/* Amount detail matching Terkumpul Rp 12.000.000 on left, / 15.000.000 on far right */}
                  <div className="flex flex-wrap gap-x-2 gap-y-1 justify-between items-baseline text-xs sm:text-sm font-numeric text-natural-mute">
                    <span className="truncate max-w-[160px] sm:max-w-none">
                      {goal.isCompleted ? 'Target Tercapai ' : 'Terkumpul '} 
                      <strong className="text-natural-ink dark:text-white font-medium font-serif">
                        {formatCurrency(goal.targetAmount)}
                      </strong>
                    </span>
                    <span className="text-[10px] sm:text-xs text-natural-mute/70">
                      / {goal.targetAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="h-2 w-full bg-[#E8E2D6]/40 dark:bg-dark-bg-deep rounded-full overflow-hidden">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${percent}%` }}
                       className={cn("h-full transition-all duration-1000", goal.isCompleted ? "bg-emerald-600" : "bg-natural-olive")}
                    />
                  </div>

                  {/* Divider line style */}
                  <div className="border-t border-natural-line/30 pt-3 flex flex-wrap gap-x-2 gap-y-2.5 justify-between items-center text-[11px] sm:text-xs">
                    <span className="text-natural-olive dark:text-emerald-400 font-semibold tracking-wide flex flex-wrap items-center gap-0.5">
                      <span>{percent.toFixed(0)}% tercapai</span>
                      {!isReached && (
                        <>
                          <span className="text-natural-mute/40 mx-1">&#183;</span>
                          <span className="text-natural-mute font-normal">sisa {compactRemaining}</span>
                        </>
                      )}
                    </span>

                    {!goal.isCompleted && (
                      <div className="flex justify-end shrink-0">
                        {depositGoalId === goal.id ? (
                          <div className="flex gap-1 items-center animate-in slide-in-from-right-3 duration-250">
                            <input 
                              type="number" 
                              value={depositValue}
                              onChange={e => setDepositValue(e.target.value)}
                              placeholder="Fulus (Rp)" 
                              className="w-24 p-1 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 rounded-md outline-none text-xs font-semibold text-center font-numeric text-natural-ink dark:text-white"
                              autoFocus
                            />
                            <button 
                              onClick={() => handleQuickAddFunds(goal)}
                              className="bg-natural-olive hover:bg-natural-olive/95 text-white text-[11px] px-2 py-1 rounded-md font-semibold cursor-pointer"
                            >
                              Sip
                            </button>
                            <button 
                              onClick={() => setDepositGoalId(null)}
                              className="bg-natural-line text-natural-mute text-[11px] px-1.5 py-1 rounded-md mb-0 cursor-pointer"
                            >
                              x
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setDepositGoalId(goal.id);
                              setDepositValue('');
                            }}
                            className="font-semibold text-natural-olive hover:text-natural-terracotta transition-colors flex items-center gap-1 text-sm group/btn cursor-pointer"
                          >
                            <span className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform font-serif">↗</span> Tabung
                          </button>
                        )}
                      </div>
                    )}

                    {goal.isCompleted && (
                      <button
                        onClick={() => handleReopenGoal(goal)}
                        className="text-[10px] font-bold text-natural-mute hover:text-natural-olive flex items-center gap-1 transition-colors cursor-pointer"
                        title="Pindahkan kembali ke Goal Aktif"
                      >
                        <RotateCcw size={11} /> Buka Kembali Goal
                      </button>
                    )}
                  </div>

                  {/* Completion Action Button for Active Goals that reached 100% */}
                  {!goal.isCompleted && isReached && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <button
                        onClick={() => handleCompleteGoal(goal)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                      >
                        <Trophy size={15} />
                        <span>Klaim & Selesaikan Goal Ini 🎉</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {displayedGoals.length === 0 && (
            <div className="text-center py-8 border border-dashed border-natural-line dark:border-white/5 rounded-3xl p-6 bg-natural-bg/30">
              {activeTab === 'active' ? (
                <>
                  <Target className="w-10 h-10 text-natural-line mx-auto mb-2 opacity-30" />
                  <p className="text-xs text-natural-mute italic">Belum ada tujuan tabungan aktif.</p>
                  <p className="text-[10px] text-natural-mute italic mt-1">Gunakan tombol "+ Tambah Goal" di atas untuk mencatat target impian Anda!</p>
                </>
              ) : (
                <>
                  <Trophy className="w-10 h-10 text-amber-500/40 mx-auto mb-2" />
                  <p className="text-xs text-natural-mute italic">Belum ada goal yang diselesaikan.</p>
                  <p className="text-[10px] text-natural-mute italic mt-1">Saat goal aktif Anda mencapai 100%, klik "Klaim & Selesaikan Goal" untuk menyimpannya di sini!</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
