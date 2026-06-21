import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Calendar, 
  CheckCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useSavingGoals } from '../hooks/useSavingGoals';
import { formatCurrency } from '../utils/formatters';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { showToast } from '../context/ToastContext';
import { safeAddDoc } from '../services/firestore';
import { Timestamp } from 'firebase/firestore';

interface SavingGoalsCardProps {
  userId: string;
}

export const SavingGoalsCard = ({ userId }: SavingGoalsCardProps) => {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useSavingGoals(userId);
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
      description: ''
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

  return (
    <Card className="bg-natural-bg/40 border-0 dark:bg-dark-card/30 p-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-serif italic text-natural-ink dark:text-dark-text font-bold flex items-center gap-2">
          <Target size={20} className="text-natural-terracotta" /> Goal Tabungan
        </h3>
        {!isAdding && !editingId && (
          <button 
            id="add-saving-goal-btn"
            onClick={() => setIsAdding(true)}
            className="text-[10px] font-bold text-natural-olive border border-natural-olive/30 px-3 py-1 rounded-full hover:bg-natural-olive hover:text-white transition-all uppercase tracking-widest flex items-center gap-1"
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
                  placeholder="Contoh: Beli iPhone 18, Liburan ke Bali"
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
          {goals.map(goal => {
            const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const remaining = goal.targetAmount - goal.currentAmount;
            const isCompleted = goal.currentAmount >= goal.targetAmount;

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
                className="bg-white dark:bg-dark-card border border-natural-line/45 dark:border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300"
              >
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-natural-olive text-white px-3 py-1 rounded-bl-2xl flex items-center gap-1 text-[9px] font-black uppercase tracking-widest shadow-sm">
                    <CheckCircle size={10} /> Tercapai!
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
                      <button 
                        onClick={() => handleStartEdit(goal)}
                        className="p-1 text-natural-mute hover:text-natural-olive rounded-md"
                        title="Edit"
                      >
                        <Edit2 size={13} />
                      </button>
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

                <div className="mb-2.5">
                  <span className="inline-block text-[11px] bg-natural-peach/30 dark:bg-natural-peach/5 text-natural-terracotta dark:text-natural-terracotta px-3 py-0.5 rounded-full font-medium">
                    {goal.category || 'Impian'}
                  </span>
                </div>

                <h4 className="font-serif font-semibold text-natural-ink dark:text-dark-text text-xl mb-3.5 tracking-tight">
                  {goal.title}
                </h4>

                <div className="space-y-3">
                  {/* Amount detail matching Terkumpul Rp 12.000.000 on left, / 15.000.000 on far right */}
                  <div className="flex justify-between items-baseline text-sm font-numeric text-natural-mute">
                    <span>
                      Terkumpul <strong className="text-natural-ink dark:text-white font-medium font-serif">{formatCurrency(goal.currentAmount)}</strong>
                    </span>
                    <span className="text-xs text-natural-mute/70">
                      / {goal.targetAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="h-2 w-full bg-[#E8E2D6]/40 dark:bg-dark-bg-deep rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className="h-full transition-all duration-1000 bg-natural-olive"
                    />
                  </div>

                  {/* Divider line style */}
                  <div className="border-t border-natural-line/30 pt-3 flex justify-between items-center text-xs">
                    <span className="text-natural-olive dark:text-emerald-400 font-semibold tracking-wide">
                      {percent.toFixed(0)}% tercapai 
                      {!isCompleted && (
                        <>
                          <span className="text-natural-mute/40 mx-1.5">&#183;</span>
                          <span className="text-natural-mute font-normal">sisa {compactRemaining}</span>
                        </>
                      )}
                    </span>

                    {!isCompleted && (
                      <div className="flex justify-end">
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
                              className="bg-natural-olive hover:bg-natural-olive/95 text-white text-[11px] px-2 py-1 rounded-md font-semibold"
                            >
                              Sip
                            </button>
                            <button 
                              onClick={() => setDepositGoalId(null)}
                              className="bg-natural-line text-natural-mute text-[11px] px-1.5 py-1 rounded-md mb-0"
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
                            className="font-semibold text-natural-olive hover:text-natural-terracotta transition-colors flex items-center gap-1 text-sm group/btn"
                          >
                            <span className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform">↗</span> Tabung
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {goals.length === 0 && (
            <div className="text-center py-6 border border-dashed border-natural-line dark:border-white/5 rounded-3xl p-6">
              <Target className="w-10 h-10 text-natural-line mx-auto mb-2 opacity-30" />
              <p className="text-xs text-natural-mute italic">Belum ada tujuan tabungan.</p>
              <p className="text-[10px] text-natural-mute italic mt-1">Gunakan tombol "Tambah Goal" di atas untuk mencatat target impian Anda!</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
