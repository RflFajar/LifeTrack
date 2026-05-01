import React from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  Wallet, 
  Dumbbell, 
  BrainCircuit, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { format } from 'date-fns';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { useSchedule } from '../hooks/useSchedule';
import { useTransactions } from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

export const Dashboard = ({ user }: DashboardProps): React.ReactElement => {
  const navigate = useNavigate();
  const { items: scheduleItems, loading: scheduleLoading } = useSchedule(user.uid);
  const { balance: lifetimeBalance, loading: transactionsLoading } = useTransactions(user.uid, 'all');
  
  const todayItems = scheduleItems.filter(i => i.date === format(new Date(), 'yyyy-MM-dd'));
  const isLoading = scheduleLoading || transactionsLoading;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
      <Card className="md:col-span-2 bg-natural-olive text-white p-8 overflow-hidden relative border-0 shadow-lg shadow-natural-olive/20">
        <Sparkles className="absolute top-4 right-4 w-12 h-12 opacity-20" />
        <div className="relative z-10">
          <h2 className="text-lg font-serif italic opacity-90 mb-1">Status Hari Ini</h2>
          <p className="text-4xl font-serif font-bold mb-6">{formatDate(new Date())}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] uppercase font-bold opacity-70 mb-1 tracking-wider">Rencana Kegiatan</p>
              {isLoading ? <Skeleton className="h-8 w-20 bg-white/20" /> : <p className="text-2xl font-bold">{todayItems.length} Agenda</p>}
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] uppercase font-bold opacity-70 mb-1 tracking-wider">Total Saldo</p>
              {isLoading ? <Skeleton className="h-8 w-32 bg-white/20" /> : <p className="text-2xl font-bold">{formatCurrency(lifetimeBalance.income - lifetimeBalance.expense)}</p>}
            </div>
          </div>
        </div>
      </Card>

      <QuickAction 
        icon={<Calendar className="text-natural-terracotta" />} 
        title="Jadwal Harian" 
        desc="Kelola agenda harianmu" 
        onClick={() => navigate('/schedule')}
      />
      <QuickAction 
        icon={<Wallet className="text-natural-olive" />} 
        title="Keuangan" 
        desc="Pantau arus kas" 
        onClick={() => navigate('/money')}
      />
      <QuickAction 
        icon={<Dumbbell className="text-natural-mute" />} 
        title="Fitness & Diet" 
        desc="Rekomendasi AI" 
        onClick={() => navigate('/health')}
      />
      <QuickAction 
        icon={<BrainCircuit className="text-natural-ink" />} 
        title="Wawasan Pintar" 
        desc="Analisis data hidupmu" 
        onClick={() => navigate('/insights')}
      />
    </div>
  );
};

function QuickAction({ icon, title, desc, onClick }: { icon: React.ReactElement, title: string, desc: string, onClick: () => void }): React.ReactElement {
  return (
    <button 
      onClick={onClick}
      aria-label={`Buka ${title}`}
      className="bg-white p-6 rounded-[32px] shadow-sm border border-natural-line/50 flex items-start gap-4 hover:shadow-md transition-all group text-left"
    >
      <div className="p-3 bg-natural-bg rounded-2xl group-hover:bg-white transition-colors">
        {React.cloneElement(icon, { size: 28 } as React.SVGProps<SVGSVGElement> & { size: number })}
      </div>
      <div>
        <h3 className="font-serif font-bold text-natural-ink">{title}</h3>
        <p className="text-[11px] text-natural-mute italic">{desc}</p>
      </div>
      <ChevronRight className="ml-auto text-natural-mute/50 group-hover:text-natural-mute" />
    </button>
  );
}
