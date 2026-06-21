import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, 
  ArrowRight, 
  Briefcase, 
  Wallet,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Card } from '../components/ui/Card';
import { useProfile } from '../hooks/useProfile';
import { showToast } from '../context/ToastContext';

interface OnboardingProps {
  user: User;
}

export const Onboarding = ({ user }: OnboardingProps): React.ReactElement => {
  const { saveProfile } = useProfile(user.uid);
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    job: '',
    budget: '1000000',
    name: user.displayName || '',
  });

  // Category trackers (new step 2 from Section 6.1)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'makanan', 'transportasi', 'belanja'
  ]);

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!profile.name.trim()) {
        showToast('Mohon masukkan nama panggilan Anda', 'warning');
        return;
      }
      if (!profile.job.trim()) {
        showToast('Mohon masukkan pekerjaan atau aktivitas Anda', 'warning');
        return;
      }
      setStep(2);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!profile.budget || Number(profile.budget) <= 0) {
      showToast('Mohon masukkan batas anggaran bulanan yang valid', 'error');
      return;
    }
    if (selectedCategories.length === 0) {
      showToast('Pilih setidaknya satu kategori untuk dilacak!', 'warning');
      return;
    }
    
    // Honest profile payload without dummy health data
    await saveProfile({
      job: profile.job,
      budget: Number(profile.budget),
      name: profile.name,
      photoURL: user.photoURL || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80`,
      email: user.email || '',
      bio: 'Petualang finansial yang produktif.',
    });
  };

  const CATEGORY_OPTIONS = [
    { id: 'makanan', name: 'Makanan & Minuman', emoji: '🍴' },
    { id: 'transportasi', name: 'Transportasi', emoji: '🚗' },
    { id: 'belanja', name: 'Belanja & Belanjaan', emoji: '🛍️' },
    { id: 'hiburan', name: 'Hiburan', emoji: '🎮' },
    { id: 'gaji', name: 'Gaji / Pemasukan', emoji: '💼' },
    { id: 'tabungan', name: 'Tabungan', emoji: '🐷' },
    { id: 'lainnya', name: 'Lain-Lain', emoji: '📦' }
  ];

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-main flex items-center justify-center p-6 transition-colors duration-300">
      <div className="max-w-md w-full">
        {/* Step Indicator Header */}
        <div className="mb-6">
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-accent' : 'bg-line dark:bg-line-strong'}`}></div>
            <div className={`flex-1 h-1.5 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-accent' : 'bg-line dark:bg-line-strong'}`}></div>
          </div>
          
          <div className="text-center">
            <div className="w-14 h-14 bg-accent text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-accent/10">
              <Compass size={28} />
            </div>
            <h1 className="text-2xl font-display font-semibold text-ink dark:text-white tracking-tight">
              Selamat datang di LifeTrack
            </h1>
            <p className="text-xs text-mute dark:text-mute font-medium mt-1">
              {step === 1 ? 'Langkah 1: Siapkan Profil Anda' : 'Langkah 2: Tentukan Batas & Fokus Anggaran'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 bg-paper border border-line dark:border-line-strong shadow-sm rounded-xl">
                <div className="space-y-5">
                  <h2 className="text-lg font-display font-semibold text-accent flex items-center gap-2">
                    <UserIcon size={18} /> Profil Pribadi Anda
                  </h2>
                  
                  <div>
                    <label className="text-[10px] font-bold text-mute uppercase tracking-widest block mb-1.5">
                      Nama Panggilan Anda
                    </label>
                    <input 
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      placeholder="Misal: Rizky, Sarah"
                      className="w-full p-3.5 bg-bg dark:bg-bg border border-line dark:border-line rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent font-medium text-xs transition-all text-ink dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-mute uppercase tracking-widest block mb-1.5">
                      Pekerjaan / Aktivitas Harian
                    </label>
                    <input 
                      type="text"
                      value={profile.job}
                      onChange={e => setProfile({...profile, job: e.target.value})}
                      placeholder="Misal: Karyawan, Mahasiswa, Freelancer"
                      className="w-full p-3.5 bg-bg dark:bg-bg border border-line dark:border-line rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent font-medium text-xs transition-all text-ink dark:text-white"
                    />
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <button 
                    onClick={handleNextStep}
                    className="w-full py-3 bg-accent hover:bg-accent/90 text-white rounded-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                  >
                    Lanjutkan <ArrowRight size={14} />
                  </button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-6 md:p-8 bg-paper border border-line dark:border-line-strong shadow-sm rounded-xl">
                <div className="space-y-5">
                  <h2 className="text-lg font-display font-semibold text-accent flex items-center gap-2">
                    <Wallet size={18} /> Fokus & Batas Anggaran
                  </h2>
                  
                  <div>
                    <label className="text-[10px] font-bold text-mute uppercase tracking-widest block mb-1.5">
                      Batas Anggaran Bulanan (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-mute">Rp</span>
                      <input 
                        type="number"
                        value={profile.budget}
                        onChange={e => setProfile({...profile, budget: e.target.value})}
                        className="w-full pl-9 pr-3.5 py-3.5 bg-bg dark:bg-bg border border-line dark:border-line rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent font-display font-semibold text-xs transition-all text-ink dark:text-white font-numeric tracking-tight"
                      />
                    </div>
                    <p className="text-[10px] text-mute italic mt-1.5">Batas pengeluaran terencana Anda per bulan harian.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-mute uppercase tracking-widest block mb-2.5">
                      Pilih Kategori Utama untuk Dilacak (Opsional)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map(cat => {
                        const isSelected = selectedCategories.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                              isSelected
                                ? 'bg-accent border-accent text-white'
                                : 'bg-bg dark:bg-bg border-line dark:border-line text-ink-2 hover:bg-line'
                            }`}
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.name}</span>
                            {isSelected && <CheckCircle2 size={11} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-2 flex gap-3">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 border border-line dark:border-line text-ink-2 hover:bg-bg rounded-md font-semibold text-xs transition-all"
                  >
                    Kembali
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white rounded-md font-semibold flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] active:scale-[0.99] transition-all text-xs"
                  >
                    Mulai Gunakan <ArrowRight size={14} />
                  </button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
