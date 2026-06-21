import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Mail, 
  Briefcase, 
  Phone, 
  Calendar, 
  Smile, 
  Save, 
  Check, 
  Camera,
  Coins,
  ShieldCheck,
  ArrowRight,
  X
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { useProfile } from '../hooks/useProfile';
import { useSavingGoals } from '../hooks/useSavingGoals';
import { showToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatCurrency } from '../utils/formatters';

interface ProfileProps {
  user: FirebaseUser;
  onClose?: () => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", // female 1
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", // male 1
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", // female 2
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80", // male 2
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", // female 3
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80", // female 4
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80", // male 3
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"  // male 4
];

export const Profile = ({ user, onClose }: ProfileProps): React.ReactElement => {
  const { profile, loading: profileLoading, saveProfile } = useProfile(user.uid);
  const { goals } = useSavingGoals(user.uid);
  const [formData, setFormData] = useState({
    name: user.displayName || '',
    email: user.email || '',
    phone: '',
    bio: 'Petualang finansial yang produktif.',
    job: '',
    budget: 1000000,
    photoURL: user.photoURL || PRESET_AVATARS[0],
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    height: 170,
    weight: 70
  });

  const [saving, setSaving] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [customPhotoInput, setCustomPhotoInput] = useState('');

  // Sync profile data to local state once loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user.displayName || '',
        email: profile.email || user.email || '',
        phone: profile.phone || '',
        bio: profile.bio || 'Petualang finansial yang produktif.',
        job: profile.job || '',
        budget: profile.budget || 1000000,
        photoURL: profile.photoURL || user.photoURL || PRESET_AVATARS[0],
        birthDate: profile.birthDate || '',
        gender: profile.gender || 'male',
        height: profile.height || 170,
        weight: profile.weight || 70
      });
    }
  }, [profile, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Nama lengkap wajib diisi', 'warning');
      return;
    }
    setSaving(true);
    try {
      await saveProfile({
        ...profile,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        job: formData.job,
        budget: Number(formData.budget),
        photoURL: formData.photoURL,
        birthDate: formData.birthDate,
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight)
      });
      showToast('Profil berhasil disimpan!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal memperbarui profil', 'error');
    } finally {
      setSaving(false);
    }
  };

  const selectAvatar = (url: string) => {
    setFormData(prev => ({ ...prev, photoURL: url }));
    setShowAvatarSelector(false);
  };

  const handleCustomPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPhotoInput.trim().startsWith('http://') || customPhotoInput.trim().startsWith('https://')) {
      setFormData(prev => ({ ...prev, photoURL: customPhotoInput.trim() }));
      setCustomPhotoInput('');
      setShowAvatarSelector(false);
      showToast('Foto profil kustom berhasil diterapkan', 'success');
    } else {
      showToast('Masukkan URL foto (http/https) yang valid', 'warning');
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-white dark:bg-dark-card rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-96 bg-white dark:bg-dark-card rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const completedGoalsCount = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12 relative text-natural-ink">
      {onClose && (
        <div className="flex justify-between items-center bg-white dark:bg-dark-card border border-natural-line/80 dark:border-white/5 p-4 rounded-3xl mb-1 shadow-sm">
          <div className="flex items-center gap-2">
            <User className="text-natural-olive" size={20} />
            <span className="font-serif italic font-bold text-natural-ink dark:text-dark-text text-sm">Pengaturan Profil Pengguna</span>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex items-center gap-1.5 px-4 py-2 bg-natural-bg dark:bg-dark-bg-deep hover:bg-natural-terracotta/20 hover:text-natural-terracotta text-natural-mute rounded-xl text-xs font-bold transition-all border border-natural-line/40 dark:border-white/5"
          >
            <X size={14} /> Tutup
          </button>
        </div>
      )}

      {/* Profile Banner Card */}
      <Card className="bg-gradient-to-br from-natural-olive/20 to-natural-peach/35 relative overflow-hidden border-0 rounded-[40px] p-8 md:p-10 shadow-lg shadow-natural-olive/5 flex flex-col md:flex-row items-center gap-8">
        <div className="relative shrink-0 group">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer relative" onClick={() => setShowAvatarSelector(true)}>
            {formData.photoURL.trim() ? (
              <img 
                referrerPolicy="no-referrer"
                src={formData.photoURL} 
                alt="Profile" 
                className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" 
              />
            ) : (
              <User size={48} className="text-natural-mute m-auto h-full w-full p-6 bg-natural-peach/40" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white w-6 h-6" />
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowAvatarSelector(true)}
            className="absolute bottom-1 right-1 p-2 bg-natural-olive text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all outline-none border border-white"
          >
            <Camera size={14} />
          </button>
        </div>

        <div className="text-center md:text-left space-y-2 flex-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
            <h2 className="text-2xl md:text-3xl font-serif font-black text-natural-ink">{formData.name || 'Pengguna LifeTrack'}</h2>
            <span className="bg-natural-terracotta text-white font-serif italic text-xs font-bold px-3 py-1 rounded-full w-fit mx-auto md:mx-0 shadow-sm shadow-natural-terracotta/20">
              {formData.job || 'Pegiat Hidup'}
            </span>
          </div>
          <p className="text-sm text-natural-mute max-w-lg italic font-medium">"{formData.bio}"</p>
          
          <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
            <div className="bg-white/80 dark:bg-dark-card/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-natural-line/40 text-xs font-serif italic font-bold text-natural-olive flex items-center gap-1.5 shadow-sm">
              <Coins size={14} className="text-natural-terracotta" /> Budget: {formatCurrency(formData.budget)}
            </div>
            <div className="bg-white/80 dark:bg-dark-card/50 backdrop-blur-sm px-4 py-2 rounded-2xl border border-natural-line/40 text-xs font-serif italic font-bold text-natural-olive flex items-center gap-1.5 shadow-sm">
              <ShieldCheck size={14} className="text-blue-500" /> Goal Tercapai: {completedGoalsCount} / {goals.length}
            </div>
          </div>
        </div>

        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
        <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-natural-peach/10 rounded-full blur-3xl pointer-events-none" />
      </Card>

      {/* Preset Avatar Selection Modal */}
      <AnimatePresence>
        {showAvatarSelector && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-dark-card rounded-[32px] p-6 max-w-lg w-full shadow-2xl border border-natural-line/50 dark:border-white/5"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif italic font-bold text-natural-olive text-lg">Pilih Foto Profil</h3>
                <button onClick={() => setShowAvatarSelector(false)} className="text-natural-mute hover:text-natural-terracotta transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold text-natural-mute uppercase tracking-widest mb-3">Preset Karakter</p>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button 
                      key={idx}
                      onClick={() => selectAvatar(url)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${formData.photoURL === url ? 'border-natural-olive scale-105 shadow-md shadow-natural-olive/10' : 'border-transparent hover:border-slate-200'}`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                      {formData.photoURL === url && (
                        <div className="absolute inset-0 bg-natural-olive/20 flex items-center justify-center">
                          <div className="bg-natural-olive text-white p-1 rounded-full"><Check size={8} strokeWidth={4} /></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCustomPhotoSubmit} className="border-t border-natural-line/40 pt-4">
                <p className="text-[10px] font-bold text-natural-mute uppercase tracking-widest mb-2">Atau Gunakan URL Gambar Lain</p>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={customPhotoInput}
                    onChange={e => setCustomPhotoInput(e.target.value)}
                    placeholder="https://contoh.com/gambar-saya.jpg"
                    className="flex-1 p-3 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line rounded-xl text-xs outline-none focus:ring-1 focus:ring-natural-olive"
                  />
                  <button 
                    type="submit"
                    className="bg-natural-olive text-white text-xs px-4 py-3 rounded-xl font-bold font-serif hover:opacity-95 transition-opacity"
                  >
                    Terapkan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Data Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 space-y-6">
            <div className="border-b border-natural-line/40 pb-4">
              <h3 className="text-xl font-serif font-bold text-natural-olive italic flex items-center gap-2">
                <Smile className="text-natural-terracotta" /> Biodata Pribadi
              </h3>
              <p className="text-[10px] text-natural-mute font-medium mt-0.5">Lengkapi identitas harian Anda untuk personalisasi LifeTrack.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Nama Lengkap</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-mute" />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3.5 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-medium text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Alamat Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-mute" />
                  <input 
                    type="email" 
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-100 dark:bg-dark-bg-deep/50 border border-natural-line/60 rounded-2xl cursor-not-allowed text-natural-mute outline-none font-medium text-sm transition-all"
                    title="Email dipasangkan dari akun Google Anda"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Nomor Telepon</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-mute" />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-4 py-3.5 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-medium text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Tanggal Lahir</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-mute" />
                  <input 
                    type="date" 
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-medium text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Jenis Kelamin</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`p-3 rounded-2xl text-xs font-serif font-bold italic transition-all ${formData.gender === 'male' ? 'bg-natural-olive text-white shadow-sm' : 'bg-natural-bg dark:bg-dark-bg-deep text-natural-mute border border-natural-line/60 dark:border-white/5'}`}
                  >
                    Laki-Laki
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                    className={`p-3 rounded-2xl text-xs font-serif font-bold italic transition-all ${formData.gender === 'female' ? 'bg-natural-olive text-white shadow-sm' : 'bg-natural-bg dark:bg-dark-bg-deep text-natural-mute border border-natural-line/60 dark:border-white/5'}`}
                  >
                    Perempuan
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Pekerjaan / Aktivitas</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-natural-mute" />
                  <input 
                    type="text" 
                    value={formData.job}
                    onChange={e => setFormData({ ...formData, job: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-medium text-sm transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-natural-mute uppercase tracking-wider mb-1.5 block">Bio Singkat</label>
              <textarea 
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Deskripsikan diri atau impian hidup Anda..."
                className="w-full p-4 bg-natural-bg dark:bg-dark-bg-deep border border-natural-line/60 dark:border-white/5 rounded-2xl outline-none focus:ring-1 focus:ring-natural-olive font-medium text-sm transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-natural-line/30">
              <Button 
                type="submit"
                disabled={saving}
                className="px-8 py-4 font-serif italic text-md flex items-center gap-2"
              >
                {saving ? 'Menyimpan...' : (
                  <>
                    <Save size={18} /> Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Financial Constraints */}
        <div className="space-y-6">
          {/* Card Financial Constraints (Monthly Budget Limit) */}
          <Card className="p-6 md:p-8 space-y-6 bg-paper border border-line dark:border-line-strong rounded-xl shadow-sm">
            <div className="border-b border-line dark:border-line-strong pb-4">
              <h3 className="text-md font-display font-semibold text-accent flex items-center gap-2">
                <Coins size={18} /> Sasaran Anggaran
              </h3>
              <p className="text-[11px] text-mute font-medium mt-0.5">Batas perencanaan belanja harian & bulanan Anda.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-mute uppercase tracking-widest block mb-1.5">
                  Batas Anggaran Bulanan (Rp)
                </label>
                <input 
                  type="number" 
                  value={formData.budget}
                  onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                  className="w-full p-3.5 bg-bg dark:bg-bg border border-line rounded-md outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent font-display font-semibold text-xs text-ink"
                />
              </div>

              <div className="p-4 bg-natural-peach/10 dark:bg-natural-peach/5 rounded-md">
                <p className="text-[10px] font-bold text-accent-2 uppercase tracking-[0.1em] mb-1">Rekomendasi Tabungan Harian</p>
                <p className="text-xs text-mute font-medium leading-relaxed">
                  Dengan pagu anggaran bulanan sebesar <strong>{formatCurrency(formData.budget)}</strong>, batasi pengeluaran non-primer harian Anda di bawah <strong>{formatCurrency(formData.budget / 30)}</strong> demi tercapainya tujuan tabungan harian yang sehat.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
};
