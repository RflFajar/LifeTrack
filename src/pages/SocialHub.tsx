import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Share2, 
  Trophy, 
  Search, 
  Plus, 
  Heart, 
  MessageSquare,
  Activity,
  ChefHat,
  Wallet
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Card } from '../components/ui/Card';
import { watchCollection } from '../services/firestore';
import { SharedItem, Challenge } from '../types';
import { cn } from '../utils/cn';

interface SocialHubProps {
  user: User;
}

export const SocialHub = ({ user }: SocialHubProps): React.ReactElement => {
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges'>('feed');
  const [feed, setFeed] = useState<SharedItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubFeed = watchCollection<SharedItem>('shared_items', (data) => {
      setFeed(data);
      setLoading(false);
    });

    const unsubChallenges = watchCollection<Challenge>('challenges', (data) => {
      setChallenges(data);
    });

    return () => {
      unsubFeed();
      unsubChallenges();
    };
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif font-bold text-natural-ink dark:text-dark-text italic">Social Hub</h2>
        <div className="flex bg-white dark:bg-dark-card p-1 rounded-2xl border border-natural-line/50 dark:border-white/5 shadow-sm">
          <button 
            onClick={() => setActiveTab('feed')}
            aria-label="Tampilkan feed"
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === 'feed' ? "bg-natural-olive text-white shadow-md" : "text-natural-mute"
            )}
          >Feed</button>
          <button 
            onClick={() => setActiveTab('challenges')}
            aria-label="Tampilkan tantangan"
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all",
              activeTab === 'challenges' ? "bg-natural-olive text-white shadow-md" : "text-natural-mute"
            )}
          >Challenges</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-natural-mute w-4 h-4" />
        <input 
          type="text" 
          placeholder="Cari teman atau materi..."
          aria-label="Cari teman atau materi"
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-card border border-natural-line/50 dark:border-white/5 rounded-3xl outline-none shadow-sm focus:ring-1 focus:ring-natural-olive transition-all"
        />
      </div>

      {activeTab === 'feed' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feed.length === 0 && !loading && <EmptyState icon={<Share2 />} title="Feed Kosong" desc="Berbagi materi pertama dengan komunitas!" />}
          {feed.map((item, idx) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="hover:translate-y-[-4px] transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-natural-peach flex items-center justify-center font-bold text-natural-ink">
                    {item.creatorName?.[0] || 'U'}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-natural-ink dark:text-dark-text leading-none">{item.title}</h4>
                    <p className="text-[10px] text-natural-mute mt-1">oleh {item.creatorName}</p>
                  </div>
                  <div className="ml-auto">
                    {item.type === 'workout' && <Activity className="text-natural-terracotta w-4 h-4" />}
                    {item.type === 'recipe' && <ChefHat className="text-natural-olive w-4 h-4" />}
                    {item.type === 'finance' && <Wallet className="text-natural-mute w-4 h-4" />}
                  </div>
                </div>
                
                <div className="p-4 bg-natural-bg dark:bg-white/5 rounded-2xl mb-4 italic text-sm text-natural-mute">
                  Klik untuk melihat detail {item.type}...
                </div>

                <div className="flex items-center gap-4 border-t border-natural-line/50 dark:border-white/5 pt-4">
                  <button 
                    aria-label="Sukai materi"
                    className="flex items-center gap-1.5 text-xs font-bold text-natural-mute hover:text-natural-terracotta transition-colors"
                  >
                    <Heart size={16} /> {item.likes}
                  </button>
                  <button 
                    aria-label="Komentari materi"
                    className="flex items-center gap-1.5 text-xs font-bold text-natural-mute hover:text-natural-olive transition-colors"
                  >
                    <MessageSquare size={16} /> 0
                  </button>
                  <button aria-label="Bagikan materi" className="ml-auto">
                    <Share2 size={16} className="text-natural-mute" />
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.length === 0 && !loading && <EmptyState icon={<Trophy />} title="Tidak Ada Tantangan" desc="Buat tantangan baru untuk bersaing dengan teman!" />}
          {challenges.map((challenge, idx) => (
            <motion.div key={challenge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="border-t-4 border-t-natural-terracotta">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-natural-ink dark:text-dark-text">{challenge.title}</h3>
                    <p className="text-xs text-natural-mute italic">{challenge.description}</p>
                  </div>
                  <div className="p-2 bg-natural-peach rounded-xl">
                    <Trophy className="text-natural-terracotta w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-natural-mute">
                    <span>Progress Grup</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 bg-natural-bg dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-natural-terracotta rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {challenge.participants.slice(0, 3).map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-card bg-natural-mute ring-1 ring-natural-line" />
                    ))}
                    {challenge.participants.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-card bg-natural-bg flex items-center justify-center text-[10px] font-bold text-natural-mute">
                        +{challenge.participants.length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    aria-label="Gabung tantangan"
                    className="px-6 py-2 bg-natural-olive text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
                  >
                    Gabung
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
          
          <button 
            aria-label="Buat tantangan baru"
            className="md:col-span-2 border-2 border-dashed border-natural-line/50 dark:border-white/10 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 text-natural-mute hover:border-natural-olive hover:text-natural-olive transition-all"
          >
            <Plus className="w-8 h-8" />
            <span className="font-serif italic font-bold">Buat Tantangan Kustom</span>
          </button>
        </div>
      )}
    </div>
  );
};

function EmptyState({ icon, title, desc }: { icon: React.ReactElement, title: string, desc: string }): React.ReactElement {
  return (
    <div className="md:col-span-2 p-20 text-center bg-white dark:bg-dark-card rounded-[40px] border border-dashed border-natural-line/50">
      <div className="w-16 h-16 bg-natural-bg dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-natural-mute">
        {React.cloneElement(icon, { size: 32 } as React.Attributes)}
      </div>
      <h3 className="font-serif font-bold text-natural-ink dark:text-dark-text mb-2">{title}</h3>
      <p className="text-xs text-natural-mute italic max-w-xs mx-auto">{desc}</p>
    </div>
  );
}
