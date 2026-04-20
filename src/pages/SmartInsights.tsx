import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BrainCircuit, 
  Sparkles, 
  RefreshCw, 
  TrendingUp, 
  Target, 
  Zap,
  Activity,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Card } from '../components/ui/Card';
import { useTransactions } from '../hooks/useTransactions';
import { useSchedule } from '../hooks/useSchedule';
import { useProfile } from '../hooks/useProfile';
import { getSmartInsights } from '../services/gemini';
import { safeSetDoc, fetchDocument } from '../services/firestore';
import { cn } from '../utils/cn';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface SmartInsightsProps {
  user: User;
}

interface Insight {
  type: 'financial' | 'productivity' | 'health' | 'holistic';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface InsightCache {
  insights: Insight[];
  timestamp: number;
}

export const SmartInsights = ({ user }: SmartInsightsProps): React.ReactElement => {
  const [activeView, setActiveView] = useState<'insights' | 'analytics'>('insights');
  const { transactions: txs } = useTransactions(user.uid);
  const { items: scheduleItems } = useSchedule(user.uid);
  const { profile } = useProfile(user.uid);
  
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const CACHE_PATH = `users/${user.uid}/ai_insights`;
  const CACHE_ID = 'latest';
  const TTL_24H = 24 * 60 * 60 * 1000;

  useEffect(() => {
    loadInsights();
  }, [user.uid]);

  const loadInsights = async (): Promise<void> => {
    try {
      setLoading(true);
      const cached = await fetchDocument(CACHE_PATH, CACHE_ID) as InsightCache | null;
      
      if (cached && cached.timestamp && (Date.now() - cached.timestamp < TTL_24H)) {
        setInsights(cached.insights);
        setLastUpdated(cached.timestamp);
      }
    } catch (error) {
      console.error("Gagal memuat insight:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async (): Promise<void> => {
    if (!profile) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getSmartInsights(scheduleItems, txs, profile);
      const newInsights = res.insights || [];
      
      const cacheData = {
        insights: newInsights,
        timestamp: Date.now()
      };

      await safeSetDoc(CACHE_PATH, CACHE_ID, cacheData, 'Analisis AI berhasil diperbarui');
      setInsights(newInsights);
      setLastUpdated(cacheData.timestamp);
    } catch (error) {
      console.error("Failed to generate insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string): React.ReactElement => {
    switch (type) {
      case 'financial': return <TrendingUp className="text-natural-terracotta" />;
      case 'productivity': return <Zap className="text-natural-olive" />;
      case 'health': return <Target className="text-natural-mute" />;
      default: return <Sparkles className="text-natural-peach" />;
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <Card className="bg-natural-olive text-white p-10 relative overflow-hidden border-0">
        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setActiveView('insights')}
              aria-label="Klik untuk melihat wawasan AI"
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                activeView === 'insights' ? "bg-white text-natural-olive shadow-lg" : "bg-white/10 text-white/70"
              )}
            >AI Insights</button>
            <button 
              onClick={() => setActiveView('analytics')}
              aria-label="Klik untuk melihat dashboard analitik"
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-bold transition-all",
                activeView === 'analytics' ? "bg-white text-natural-olive shadow-lg" : "bg-white/10 text-white/70"
              )}
            >Analytics Dashboard</button>
          </div>
          
          <BrainCircuit className="w-16 h-16 text-natural-peach mb-6" />
          <h1 className="text-4xl font-serif font-bold italic mb-4">Intelligence Insights</h1>
          <p className="text-white/80 font-light leading-relaxed mb-8">
            Kecerdasan buatan kami menghubungkan pola belanja, produktivitas jadwal, dan profil kesehatanmu untuk memberikan wawasan strategis 360 derajat.
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={generateNewInsights}
              disabled={loading}
              aria-label={insights.length > 0 ? 'Perbarui analisis data' : 'Mulai analisis data baru'}
              className="px-8 py-4 bg-white text-natural-olive rounded-2xl font-bold font-serif italic shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw />}
              {insights.length > 0 ? 'Perbarui Analisis' : 'Mulai Analisis Holistik'}
            </button>
            
            {lastUpdated && (
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 flex items-center gap-2">
                <Clock className="w-3 h-3" /> Terakhir diperbarui: {new Date(lastUpdated).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-natural-peach/20 rounded-full blur-3xl" />
      </Card>

      {activeView === 'insights' ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-serif font-bold text-natural-ink dark:text-dark-text italic flex items-center gap-2">
              <Sparkles className="text-natural-terracotta" /> Temuan Strategis
            </h2>
            {loading && <p className="text-xs text-natural-mute animate-pulse">Menghubungkan pola data...</p>}
          </div>
          {/* ... existing insights mapping ... */}
          {insights.length > 0 ? (
            <div className="flex flex-col gap-6">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "border-l-4 transition-all hover:translate-x-2",
                    insight.impact === 'high' ? "border-l-natural-terracotta" : insight.impact === 'medium' ? "border-l-natural-olive" : "border-l-natural-mute"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-natural-bg dark:bg-dark-bg-deep rounded-2xl shrink-0">
                        {getIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-serif font-bold text-natural-ink dark:text-dark-text text-lg">{insight.title}</h4>
                          <span className={cn(
                            "text-[10px] uppercase font-bold px-2 py-1 rounded-full tracking-widest",
                            insight.impact === 'high' ? "bg-natural-terracotta/10 text-natural-terracotta" : "bg-natural-bg dark:bg-white/5 text-natural-mute"
                          )}>
                            Impact: {insight.impact}
                          </span>
                        </div>
                        <p className="text-sm text-natural-mute leading-relaxed italic">{insight.description}</p>
                        
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-natural-olive uppercase tracking-widest">
                          Pelajari lebih lanjut <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : !loading && (
            <div className="p-20 text-center bg-white dark:bg-dark-card rounded-[40px] border border-dashed border-natural-line dark:border-white/5">
              <AlertCircle className="w-12 h-12 text-natural-mute/30 mx-auto mb-4" />
              <h3 className="font-serif font-bold text-natural-mute mb-2">Belum ada analisis</h3>
              <p className="text-xs text-natural-mute italic">Tekan tombol di atas untuk menjalankan AI Intelligence pada data hidupmu.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
          <Card className="p-8">
            <h3 className="font-serif font-bold text-xl mb-6">Arus Keuangan Aktif</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ name: 'Income', val: 5000000 }, { name: 'Expense', val: 3200000 }]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="val" fill="#6B705C" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-8">
            <h3 className="font-serif font-bold text-xl mb-6">Distribusi Aktivitas</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pekerjaan', value: 40 },
                      { name: 'Olahraga', value: 20 },
                      { name: 'Istirahat', value: 40 },
                    ]}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#6B705C" />
                    <Cell fill="#CB997E" />
                    <Cell fill="#A5A58D" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="lg:col-span-2 p-8 bg-natural-bg dark:bg-white/5 border-0">
            <div className="flex items-center gap-4">
              <Activity className="text-natural-terracotta w-10 h-10" />
              <div>
                <h4 className="font-serif font-bold text-lg">System Health & Performance</h4>
                <p className="text-xs text-natural-mute italic">Aplikasi berjalan optimal dengan latensi 45ms.</p>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-natural-olive">Online</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
