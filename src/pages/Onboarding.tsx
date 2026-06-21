import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  ArrowRight, 
  Briefcase, 
  Wallet
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
  const [profile, setProfile] = useState({
    job: '',
    budget: '1000000'
  });

  const handleSubmit = async (): Promise<void> => {
    if (!profile.job) {
      showToast('Mohon masukkan pekerjaan atau aktivitas Anda', 'error');
      return;
    }
    if (!profile.budget || Number(profile.budget) <= 0) {
      showToast('Mohon masukkan batas anggaran bulanan yang valid', 'error');
      return;
    }
    
    // Background satisfy the user profile constraints of Security Rules, while providing purely financial fields to user
    await saveProfile({
      height: 170,
      weight: 70,
      age: 25,
      gender: 'male',
      goal: 'Maintenance',
      job: profile.job,
      budget: Number(profile.budget),
      equipment: 'Tanpa Alat / Bodyweight',
      targetWeight: 70
    });
  };

  return (
    <div className="min-h-screen bg-natural-bg flex items-center justify-center p-6 animate-in fade-in duration-500">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-natural-olive text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-natural-olive/20">
            <UserIcon size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-natural-ink">Selamat Datang!</h1>
          <p className="text-natural-mute italic">Mari siapkan data keuangan Anda untuk memulai pelacakan.</p>
        </div>

        <Card className="p-8 shadow-xl border-0 rounded-[36px]">
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-bold text-natural-olive flex items-center gap-2">
              <Wallet className="text-natural-terracotta" /> Profil Finansial Anda
            </h2>
            
            <div>
              <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <Briefcase size={12} className="text-natural-olive" /> Pekerjaan / Aktivitas Harian
              </label>
              <input 
                type="text"
                value={profile.job}
                onChange={e => setProfile({...profile, job: e.target.value})}
                placeholder="Misal: Karyawan, Mahasiswa, Freelancer"
                className="w-full p-4 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-medium text-sm transition-all"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <Wallet size={12} className="text-natural-olive" /> Batas Anggaran Bulanan (Rp)
              </label>
              <input 
                type="number"
                value={profile.budget}
                onChange={e => setProfile({...profile, budget: e.target.value})}
                placeholder="Misal: 2000000"
                className="w-full p-4 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-serif text-sm transition-all font-bold text-natural-ink dark:text-dark-text"
              />
              <p className="text-[10px] text-natural-mute italic mt-1.5">Batas pengeluaran bulanan yang direncanakan untuk belanja harian Anda.</p>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={handleSubmit}
              className="w-full py-4 bg-natural-olive hover:bg-natural-olive/95 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-natural-olive/20 hover:scale-[1.01] active:scale-[0.99] transition-all font-serif italic text-lg"
            >
              Mulai Gunakan <ArrowRight size={20} />
            </button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
