import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, 
  Utensils, 
  RefreshCw, 
  Sparkles,
  Save,
  X,
  BrainCircuit,
  TrendingUp,
  Scale
} from 'lucide-react';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { StatLabel } from '../components/ui/StatLabel';
import { NutritionStat } from '../components/ui/NutritionStat';
import { useProfile } from '../hooks/useProfile';
import { useWorkoutPlan } from '../hooks/useWorkoutPlan';
import { useMealPlan } from '../hooks/useMealPlan';
import { useDailyProgress } from '../hooks/useDailyProgress';
import { useWeightHistory } from '../hooks/useWeightHistory';
import { 
  GOAL_OPTIONS, 
  EQUIPMENT_OPTIONS, 
  GENDER_OPTIONS,
  INITIAL_MEAL_FORM 
} from '../constants';
import { formatCurrency, getBMICategory, calculateBMR } from '../utils/formatters';
import { validateProfile } from '../utils/validators';
import { showToast } from '../context/ToastContext';
import { UserProfile } from '../types';
import { cn } from '../utils/cn';

interface HealthTrackerProps {
  user: User;
}

export const HealthTracker = ({ user }: HealthTrackerProps): React.ReactElement => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const { profile, saveProfile, bmi, loading: profileLoading } = useProfile(user.uid);
  const { plans: workoutPlans, generatePlan: generateWorkoutPlan, loading: workoutLoading } = useWorkoutPlan(user.uid, profile);
  const { mealPlan, generatePlan: generateMealPlan, loading: mealLoading } = useMealPlan(user.uid, profile);
  const { loggedMeals, totals, targets, addMeal, removeMeal } = useDailyProgress(user.uid, mealPlan, today);
  const { history: weightHistory, addWeight } = useWeightHistory(user.uid);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [mealForm, setMealForm] = useState(INITIAL_MEAL_FORM);
  const [showFullWorkout, setShowFullWorkout] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSaveProfile = async (): Promise<void> => {
    const error = validateProfile(formData as UserProfile);
    if (error) {
      showToast(error, 'error');
      return;
    }
    await saveProfile(formData as UserProfile);
    if (formData.weight) {
      await addWeight(Number(formData.weight), today);
    }
    setIsEditing(false);
  };

  const handleLogRecommendedMeal = async (meal: { name: string; calories: number; protein: number; carbohydrates: number }): Promise<void> => {
    await addMeal({ 
      name: meal.name, 
      calories: meal.calories, 
      protein: meal.protein, 
      carbs: meal.carbohydrates 
    });
  };

  const handleManualMealAdd = async (): Promise<void> => {
    if (!mealForm.name) return;
    await addMeal(mealForm);
    setMealForm(INITIAL_MEAL_FORM);
  };

  const generateRecommendations = async (): Promise<void> => {
    await Promise.all([generateWorkoutPlan(), generateMealPlan()]);
  };

  const aiLoading = workoutLoading || mealLoading;
  const bmr = profile ? calculateBMR(profile.gender, profile.weight, profile.height, profile.age) : 0;

  const chartData = [...weightHistory]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => ({
      date: format(new Date(entry.date), 'dd/MM'),
      weight: entry.weight
    }));

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-2 border-natural-line bg-natural-bg/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif italic font-bold text-natural-olive">Profil Sehat</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                aria-label="Edit profil kesehatan"
                className="text-white font-bold text-[10px] bg-natural-terracotta px-3 py-1.5 rounded-full shadow-sm hover:opacity-90 uppercase tracking-widest"
              >Edit</button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Tinggi (cm)" value={formData.height} onChange={v => setFormData({...formData, height: parseInt(v)})} type="number" />
                <Input label="Berat (kg)" value={formData.weight} onChange={v => setFormData({...formData, weight: parseInt(v)})} type="number" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Usia" value={formData.age || ''} onChange={v => setFormData({...formData, age: parseInt(v)})} type="number" />
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Gender</label>
                  <div className="flex gap-2 mt-1">
                    {GENDER_OPTIONS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setFormData({...formData, gender: g.id as 'male' | 'female'})}
                        className={cn(
                          "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all",
                          formData.gender === g.id 
                            ? "bg-natural-olive text-white shadow-sm" 
                            : "bg-white text-natural-mute border border-natural-line"
                        )}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Input label="Target BB (kg)" value={formData.targetWeight || ''} onChange={v => setFormData({...formData, targetWeight: parseInt(v)})} type="number" />
              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Tujuan</label>
                  <select 
                    value={formData.goal} 
                    onChange={e => setFormData({...formData, goal: e.target.value})}
                    className="w-full mt-1 p-2 bg-white border border-natural-line rounded-lg outline-none text-sm"
                  >
                    {GOAL_OPTIONS.map(opt => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
              </div>
              <Input label="Pekerjaan" value={formData.job} onChange={v => setFormData({...formData, job: v})} />
              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Peralatan Workout</label>
                <select 
                  value={formData.equipment} 
                  onChange={e => setFormData({...formData, equipment: e.target.value})}
                  className="w-full mt-1 p-2 bg-white border border-natural-line rounded-lg outline-none text-sm"
                >
                  {EQUIPMENT_OPTIONS.map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <Input label="Budget Makan (Bln)" value={formData.budget} onChange={v => setFormData({...formData, budget: parseInt(v)})} type="number" />
              <button 
                onClick={handleSaveProfile}
                className="w-full p-4 bg-natural-olive text-white rounded-xl font-bold flex items-center justify-center gap-2 font-serif italic"
              >
                <Save size={18} /> Simpan Profil
              </button>
            </div>
          ) : profile && (
            <div className="space-y-6">
              <div className="flex items-end gap-3 px-2">
                <p className="text-5xl font-serif font-black text-natural-olive italic leading-none">{bmi}</p>
                <div className="mb-1">
                  <p className="text-[10px] font-bold text-natural-mute uppercase tracking-widest leading-none mb-1">BMI Skor</p>
                  <p className="inline-block text-[10px] font-bold text-natural-ink italic px-2 py-0.5 bg-natural-peach rounded-full border border-natural-terracotta/20">
                    {getBMICategory(bmi)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatLabel label="Tujuan" value={profile.goal} />
                <StatLabel label="Target BB" value={`${profile.targetWeight || '-'} kg`} />
                <StatLabel label="Pekerjaan" value={profile.job} />
                <StatLabel label="Peralatan" value={profile.equipment || 'Gym'} />
                <StatLabel label="TB / BB" value={`${profile.height} / ${profile.weight}`} />
                <StatLabel label="Budget" value={formatCurrency(profile.budget)} />
                <StatLabel label="Gender" value={profile.gender === 'male' ? 'Laki-laki' : 'Perempuan'} />
                <StatLabel label="BMR (Basal)" value={`${bmr} kkal`} />
              </div>
              <button 
                onClick={generateRecommendations}
                disabled={aiLoading}
                aria-label="Dapatkan rekomendasi kesehatan dari AI"
                className="w-full p-4 bg-natural-olive text-white rounded-[24px] font-serif font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all border border-black/5"
              >
                {aiLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-natural-peach" />}
                Rekomendasi AI Terkini
              </button>
            </div>
          )}
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 border-0 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-serif italic font-bold text-natural-ink">Progress Berat Badan</h3>
                <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest">30 hari terakhir</p>
              </div>
              <Scale className="text-natural-terracotta/40" size={32} />
            </div>
            
            <div className="h-[200px] w-full mb-6">
              {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#BC6C25" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#BC6C25" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#8D99AE', fontSize: 10, fontWeight: 'bold'}}
                    />
                    <YAxis 
                      hide
                      domain={['dataMin - 1', 'dataMax + 1']}
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-natural-ink text-white p-2 rounded-lg text-[10px] font-bold">
                              {payload[0].value} kg
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#BC6C25" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#weightGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-natural-mute border-2 border-dashed border-natural-line rounded-3xl">
                  <TrendingUp size={32} className="opacity-20 mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Data belum cukup</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Log berat baru (kg)"
                value={newWeight}
                onChange={e => setNewWeight(e.target.value)}
                className="flex-1 p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none text-xs font-bold"
              />
              <button 
                onClick={async () => {
                  if (!newWeight) return;
                  await addWeight(Number(newWeight), today);
                  setNewWeight('');
                }}
                className="bg-natural-terracotta text-white px-6 rounded-2xl font-bold text-xs shadow-md shadow-natural-terracotta/20"
              >
                Simpan
              </button>
            </div>
          </Card>

          {workoutPlans.length === 0 && !mealPlan ? (
            <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-natural-line h-full flex flex-col items-center justify-center">
              <BrainCircuit className="w-16 h-16 text-natural-peach/40 mb-6" />
              <h3 className="text-xl font-serif italic text-natural-ink mb-2">Program Belum Tersedia</h3>
              <p className="text-natural-mute max-w-xs text-sm">Ketuk tombol Rekomendasi AI di sebelah kiri untuk meracik program harianmu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="space-y-4">
                <h3 className="text-lg font-serif italic text-natural-olive flex items-center gap-2 ml-2">
                  <Dumbbell className="text-natural-olive" /> Workout Plan
                </h3>
                <div className="space-y-3">
                  {workoutPlans.length > 0 && (
                    <div className="bg-natural-olive rounded-[32px] p-6 text-white shadow-md">
                      {workoutPlans.slice(0, 1).map((plan, i: number) => (
                        <div key={i}>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{plan.day}</p>
                          <div className="space-y-3">
                            {plan.exercises.slice(0, 4).map((ex, j: number) => (
                              <div key={j} className="flex items-center justify-between text-xs border-b border-white/10 pb-2 last:border-0 last:pb-0">
                                <span className="font-medium opacity-90">{ex.name}</span>
                                <span className="text-natural-peach font-mono italic">{ex.sets}x{ex.reps}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => setShowFullWorkout(true)}
                        className="w-full text-center text-[10px] mt-4 italic opacity-50 hover:opacity-100 transition-opacity uppercase tracking-widest"
                      >
                        Lihat rincian lengkap »
                      </button>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-serif italic text-natural-terracotta flex items-center gap-2 ml-2">
                  <Utensils className="text-natural-terracotta" /> Catat Makan & Nutrisi
                </h3>
                <div className="space-y-3">
                  <div className="bg-natural-peach rounded-[32px] p-6 border border-natural-terracotta/10 shadow-sm flex flex-col h-full">
                       <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] font-black uppercase tracking-widest text-natural-mute">Progress Nutrisi Harian</span>
                          <span className="text-[9px] bg-white px-2 py-0.5 rounded-full text-natural-terracotta font-bold border border-natural-terracotta/10 uppercase">
                            {totals.calories} / {targets.calories} kkal
                          </span>
                        </div>
                        <div className="w-full bg-white/40 h-1.5 rounded-full overflow-hidden border border-natural-terracotta/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totals.calories / targets.calories) * 100, 100)}%` }}
                            className="h-full bg-natural-terracotta"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mb-6">
                        <NutritionStat label="Protein" value={`${totals.protein} / ${targets.protein}g`} target={targets.protein} current={totals.protein} color="bg-natural-olive" />
                        <NutritionStat label="Kalori" value={`${totals.calories} / ${targets.calories}`} target={targets.calories} current={totals.calories} color="bg-natural-terracotta" />
                        <NutritionStat label="Karbo" value={`${totals.carbs} / ${targets.carbs}g`} target={targets.carbs} current={totals.carbs} color="bg-natural-mute" />
                      </div>
 
                      {mealPlan?.meals && (
                        <div className="mb-4 bg-white/30 p-4 rounded-2xl border border-natural-terracotta/5">
                          <p className="text-[10px] font-bold text-natural-mute uppercase mb-3 tracking-wide flex items-center justify-between">
                            Rekomendasi Menu AI
                            <Sparkles size={10} className="text-natural-terracotta" />
                          </p>
                          <div className="space-y-2 max-h-[100px] overflow-y-auto scrollbar-hide">
                            {mealPlan.meals.map((meal, idx: number) => {
                              const isAlreadyLogged = loggedMeals.some(lm => lm.name === meal.name);
                              return (
                                <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-white/50 rounded-xl border border-natural-line/10">
                                  <div className="flex-1">
                                    <p className="text-[11px] font-serif italic text-natural-ink leading-tight">{meal.name}</p>
                                    <p className="text-[8px] text-natural-mute font-bold uppercase">{meal.calories}kcal • P: {meal.protein}g</p>
                                  </div>
                                  <button 
                                    onClick={() => handleLogRecommendedMeal(meal)}
                                    disabled={isAlreadyLogged}
                                    className={cn(
                                      "px-3 py-1 rounded-lg text-[9px] font-bold transition-all",
                                      isAlreadyLogged 
                                        ? "bg-natural-olive/20 text-natural-olive opacity-50" 
                                        : "bg-natural-terracotta text-white hover:opacity-90"
                                    )}
                                  >
                                    {isAlreadyLogged ? 'Logged' : 'Catat'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="space-y-3 bg-white/40 p-4 rounded-2xl border border-natural-terracotta/5 mb-4">
                        <p className="text-[10px] font-bold text-natural-mute uppercase tracking-wide">Input Makan Baru</p>
                        <div className="grid grid-cols-1 gap-2">
                          <input 
                            placeholder="Makan apa? (misal: Sate Ayam)" 
                            className="w-full p-2 bg-white rounded-lg text-sm italic placeholder:opacity-50 outline-none border border-natural-line/30"
                            value={mealForm.name}
                            onChange={e => setMealForm({...mealForm, name: e.target.value})}
                          />
                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-natural-mute uppercase ml-1">Cal</label>
                              <input type="number" value={mealForm.calories || ''} onChange={e => setMealForm({...mealForm, calories: parseInt(e.target.value) || 0})} className="w-full p-2 bg-white rounded-lg text-xs outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-natural-mute uppercase ml-1">Prot</label>
                              <input type="number" value={mealForm.protein || ''} onChange={e => setMealForm({...mealForm, protein: parseInt(e.target.value) || 0})} className="w-full p-2 bg-white rounded-lg text-xs outline-none" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-bold text-natural-mute uppercase ml-1">Carb</label>
                              <input type="number" value={mealForm.carbs || ''} onChange={e => setMealForm({...mealForm, carbs: parseInt(e.target.value) || 0})} className="w-full p-2 bg-white rounded-lg text-xs outline-none" />
                            </div>
                          </div>
                          <button 
                            onClick={handleManualMealAdd}
                            className="w-full py-2 bg-natural-terracotta text-white rounded-xl text-xs font-serif italic font-bold hover:opacity-90"
                          >
                            Tambah Catatan Makan
                          </button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[120px] scrollbar-hide">
                        <p className="text-[10px] font-bold text-natural-mute uppercase mb-2 tracking-wide">Riwayat Makan Hari Ini</p>
                        <div className="space-y-2">
                          {loggedMeals.length === 0 ? (
                            <p className="text-[10px] text-natural-mute italic text-center py-4">Belum ada makanan yang dicatat.</p>
                          ) : (
                            loggedMeals.map((meal: LoggedMeal) => (
                              <div 
                                key={meal.id}
                                className="bg-white/60 border border-natural-line/20 p-2 rounded-xl flex items-center justify-between group"
                              >
                                <div>
                                  <p className="text-xs font-serif italic text-natural-ink">{meal.name}</p>
                                  <p className="text-[9px] text-natural-mute font-bold uppercase">{meal.calories}kcal • P: {meal.protein}g • C: {meal.carbs}g</p>
                                </div>
                                <button 
                                  onClick={() => removeMeal(meal)}
                                  className="text-natural-terracotta opacity-0 group-hover:opacity-100 p-1 hover:bg-natural-terracotta/10 rounded-lg transition-all"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Full Workout Modal */}
        <AnimatePresence>
          {showFullWorkout && workoutPlans.length > 0 && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFullWorkout(false)}
                className="absolute inset-0 bg-natural-ink/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-natural-bg w-full max-w-2xl rounded-[32px] shadow-2xl p-8 overflow-hidden max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-serif font-bold italic text-natural-olive">Full Workout Plan</h2>
                  <button 
                    onClick={() => setShowFullWorkout(false)}
                    className="p-2 hover:bg-natural-line rounded-full transition-colors"
                  >
                    <X />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="space-y-6">
                    {workoutPlans.map((plan, i: number) => (
                      <div key={i} className="bg-white rounded-2xl p-5 border border-natural-line/50">
                        <p className="text-sm font-black text-natural-olive uppercase tracking-[0.2em] mb-4 border-b border-natural-line pb-2">
                          {plan.day}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {plan.exercises.map((ex, j: number) => (
                            <div key={j} className="p-3 bg-natural-bg/30 rounded-xl">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-sm font-bold text-natural-ink italic">{ex.name}</h4>
                                <span className="text-[10px] font-mono text-natural-terracotta bg-white px-2 py-0.5 rounded-full border border-natural-terracotta/10 font-bold">{ex.sets}x{ex.reps}</span>
                              </div>
                              {ex.notes && <p className="text-[10px] text-natural-mute italic">{ex.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
