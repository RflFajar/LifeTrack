import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  ArrowRight, 
  Ruler, 
  Weight, 
  Target, 
  Briefcase, 
  Dumbbell,
  Scale
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Card } from '../components/ui/Card';
import { useProfile } from '../hooks/useProfile';
import { GOAL_OPTIONS, EQUIPMENT_OPTIONS, GENDER_OPTIONS } from '../constants';
import { showToast } from '../context/ToastContext';

interface OnboardingProps {
  user: User;
}

export const Onboarding = ({ user }: OnboardingProps): React.ReactElement => {
  const { saveProfile } = useProfile(user.uid);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male' as 'male' | 'female',
    goal: 'Maintenance',
    job: '',
    budget: '500000',
    equipment: 'Tanpa Alat / Bodyweight',
    targetWeight: ''
  });

  const handleNext = (): void => {
    if (step === 1) {
      if (!profile.height || !profile.weight || !profile.age || !profile.gender) {
        showToast('Mohon lengkapi data fisik Anda', 'error');
        return;
      }
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!profile.goal || !profile.job || !profile.targetWeight) {
      showToast('Mohon lengkapi data profil Anda', 'error');
      return;
    }
    
    await saveProfile({
      height: Number(profile.height),
      weight: Number(profile.weight),
      age: Number(profile.age),
      gender: profile.gender,
      goal: profile.goal,
      job: profile.job,
      budget: Number(profile.budget),
      equipment: profile.equipment,
      targetWeight: Number(profile.targetWeight)
    });
    
    // Page will refresh/redirect due to useProfile inside App.tsx
  };

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-natural-olive text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserIcon size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-natural-ink">Selamat Datang!</h1>
          <p className="text-natural-mute italic">Mari kenali diri Anda lebih jauh untuk hasil yang personal.</p>
        </div>

        <Card className="p-8 shadow-xl border-0">
          <div className="flex justify-between mb-8">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-natural-olive' : 'bg-natural-line'} transition-colors duration-500`} />
            <div className="w-4" />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-natural-olive' : 'bg-natural-line'} transition-colors duration-500`} />
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-serif font-bold text-natural-olive flex items-center gap-2">
                <Ruler className="text-natural-terracotta" /> Data Fisik Umum
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Tinggi Badan (cm)
                  </label>
                  <input 
                    type="number"
                    value={profile.height}
                    onChange={e => setProfile({...profile, height: e.target.value})}
                    placeholder="Misal: 170"
                    className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Berat Badan (kg)
                  </label>
                  <input 
                    type="number"
                    value={profile.weight}
                    onChange={e => setProfile({...profile, weight: e.target.value})}
                    placeholder="Misal: 65"
                    className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Usia
                  </label>
                  <input 
                    type="number"
                    value={profile.age}
                    onChange={e => setProfile({...profile, age: e.target.value})}
                    placeholder="Misal: 25"
                    className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Jenis Kelamin
                  </label>
                  <div className="flex gap-2">
                    {GENDER_OPTIONS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setProfile({...profile, gender: g.id as 'male' | 'female'})}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${
                          profile.gender === g.id 
                            ? 'bg-natural-olive text-white shadow-md' 
                            : 'bg-natural-bg text-natural-mute border border-natural-line'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-serif font-bold text-natural-olive flex items-center gap-2">
                <Target className="text-natural-terracotta" /> Target & Gaya Hidup
              </h2>
              
              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Briefcase size={12} /> Pekerjaan / Aktivitas Harian
                </label>
                <input 
                  type="text"
                  value={profile.job}
                  onChange={e => setProfile({...profile, job: e.target.value})}
                  placeholder="Misal: Guru, Programmer, Mahasiswa"
                  className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Goal Utama
                  </label>
                  <select 
                    value={profile.goal}
                    onChange={e => setProfile({...profile, goal: e.target.value})}
                    className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none"
                  >
                    {GOAL_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    Target BB (kg)
                  </label>
                  <input 
                    type="number"
                    value={profile.targetWeight}
                    onChange={e => setProfile({...profile, targetWeight: e.target.value})}
                    placeholder="Misal: 60"
                    className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <Dumbbell size={12} /> Akses Peralatan Olahraga
                </label>
                <select 
                  value={profile.equipment}
                  onChange={e => setProfile({...profile, equipment: e.target.value})}
                  className="w-full p-3.5 bg-natural-bg border border-natural-line rounded-2xl outline-none"
                >
                  {EQUIPMENT_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-4">
            {step === 2 && (
              <button 
                onClick={() => setStep(1)}
                className="flex-1 py-4 text-natural-mute font-bold rounded-2xl hover:bg-natural-bg transition-all"
              >
                Kembali
              </button>
            )}
            <button 
              onClick={handleNext}
              className="flex-[2] py-4 bg-natural-olive text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-natural-olive/20 hover:opacity-90 transition-all font-serif italic text-lg"
            >
              {step === 1 ? 'Lanjutkan' : 'Buka Dashboard'} <ArrowRight size={20} />
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
