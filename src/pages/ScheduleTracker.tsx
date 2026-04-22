import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Repeat, 
  Bell, 
  Edit2, 
  X,
  CheckCircle2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { format, parseISO, isAfter, subMinutes, isSameDay, addDays, isBefore, startOfDay, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { Card } from '../components/ui/Card';
import { useSchedule } from '../hooks/useSchedule';
import { ACTIVITY_TYPES } from '../constants';
import { validateScheduleItem } from '../utils/validators';
import { showToast } from '../context/ToastContext';
import { ScheduleItem } from '../types';
import { exportToICal, syncWithGoogleCalendar } from '../services/externalSync';
import { Button } from '../components/ui/Button';
import { Share2, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../utils/cn';

interface ScheduleTrackerProps {
  user: User;
}

export const ScheduleTracker = ({ user }: ScheduleTrackerProps): React.ReactElement => {
  const { items, addItem, updateItem, deleteItem } = useSchedule(user.uid);
  const [viewDate, setViewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState('Pekerjaan');
  const [recurrence, setRecurrence] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');
  const [reminder, setReminder] = useState<number>(15);

  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);

  const isItemVisibleOnDate = (item: ScheduleItem, targetDateStr: string) => {
    const targetDate = startOfDay(parseISO(targetDateStr));
    const itemDate = startOfDay(parseISO(item.date));

    // If target date is before start date, item is not visible
    if (isBefore(targetDate, itemDate)) return false;

    switch (item.recurrence) {
      case 'none':
        return isSameDay(targetDate, itemDate);
      case 'daily':
        return true; // Any day after or same as start date
      case 'weekly':
        return differenceInDays(targetDate, itemDate) % 7 === 0;
      case 'monthly':
        return targetDate.getDate() === itemDate.getDate();
      default:
        return isSameDay(targetDate, itemDate);
    }
  };

  const filteredItemsByDate = React.useMemo(() => {
    return items.filter(item => isItemVisibleOnDate(item, viewDate))
                .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [items, viewDate]);

  const toggleComplete = async (item: ScheduleItem) => {
    const completedDates = item.completedDates || [];
    const isCompleted = completedDates.includes(viewDate);
    
    let newCompletedDates;
    if (isCompleted) {
      newCompletedDates = completedDates.filter(d => d !== viewDate);
    } else {
      newCompletedDates = [...completedDates, viewDate];
    }
    
    await updateItem(item.id, { completedDates: newCompletedDates });
    
    if (!isCompleted) {
      showToast(`Yeay! "${item.title}" selesai untuk hari ini!`, 'success');
    }
  };

  // Notification logic
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = format(now, 'yyyy-MM-dd');
      
      items.forEach(item => {
        if (!item.reminderMinutes || !isItemVisibleOnDate(item, todayStr)) return;
        
        // Use today's date but the item's startTime for recurring items
        const scheduleDate = parseISO(`${todayStr}T${item.startTime}`);
        const reminderTime = subMinutes(scheduleDate, item.reminderMinutes);
        
        const diff = now.getTime() - reminderTime.getTime();
        if (diff >= 0 && diff < 60000) {
          if (Notification.permission === 'granted') {
            new Notification(`Pengingat Agenda: ${item.title}`, {
              body: `Agenda "${item.title}" akan dimulai pukul ${item.startTime}.`,
              icon: '/logo.png'
            });
          }
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [items]);

  const handleAdd = async (): Promise<void> => {
    const error = validateScheduleItem({ title, startTime, endTime, date, activityType: type });
    if (error) {
      showToast(error, 'error');
      return;
    }
    await addItem({ 
      title, 
      startTime, 
      endTime, 
      date, 
      activityType: type,
      recurrence,
      reminderMinutes: reminder
    });
    resetForm();
  };

  const handleUpdate = async (): Promise<void> => {
    if (!editingItem) return;
    const error = validateScheduleItem({ 
      title: editingItem.title, 
      startTime: editingItem.startTime, 
      endTime: editingItem.endTime, 
      date: editingItem.date, 
      activityType: editingItem.activityType 
    });
    
    if (error) {
      showToast(error, 'error');
      return;
    }

    await updateItem(editingItem.id, {
      title: editingItem.title,
      startTime: editingItem.startTime,
      endTime: editingItem.endTime,
      date: editingItem.date,
      activityType: editingItem.activityType,
      recurrence: editingItem.recurrence,
      reminderMinutes: editingItem.reminderMinutes
    });
    setEditingItem(null);
  };

  const resetForm = (): void => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setRecurrence('none');
    setReminder(15);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="md:col-span-1 h-fit sticky top-8">
        <h3 className="text-xl font-serif italic text-natural-olive mb-6 flex items-center gap-2">
          <Plus className="text-natural-terracotta" /> Tambah Agenda
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Nama Kegiatan</label>
            <input 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl focus:ring-1 focus:ring-natural-olive outline-none text-sm"
              placeholder="Misal: Meeting Client"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Mulai</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)}
                className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Selesai (Opsional)</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)}
                className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Tanggal</label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Jenis</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value)}
                className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl outline-none text-sm"
              >
                {ACTIVITY_TYPES.map(opt => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Pengulangan</label>
              <select 
                value={recurrence} 
                onChange={e => setRecurrence(e.target.value as any)}
                className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl outline-none text-sm"
              >
                <option value="none">Sekali</option>
                <option value="daily">Harian</option>
                <option value="weekly">Mingguan</option>
                <option value="monthly">Bulanan</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Pengingat (Menit Sebelum)</label>
            <select 
              value={reminder} 
              onChange={e => setReminder(Number(e.target.value))}
              className="w-full mt-1 p-3 bg-natural-bg border border-natural-line rounded-xl outline-none text-sm"
            >
              <option value={0}>Tanpa Pengingat</option>
              <option value={5}>5 Menit</option>
              <option value={15}>15 Menit</option>
              <option value={30}>30 Menit</option>
              <option value={60}>1 Jam</option>
            </select>
          </div>

          <button 
            onClick={handleAdd}
            className="w-full bg-natural-terracotta text-white p-4 rounded-xl font-bold hover:opacity-90 transition-all font-serif italic"
          >
            Simpan Agenda
          </button>
        </div>
      </Card>

      <div className="md:col-span-2 space-y-6">
        <div className="bg-white dark:bg-dark-card p-4 rounded-[32px] border border-natural-line/50 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setViewDate(format(addDays(parseISO(viewDate), -1), 'yyyy-MM-dd'))}
              className="p-2 hover:bg-natural-bg rounded-full transition-colors text-natural-olive"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="text-center">
              <h4 className="font-serif font-bold text-natural-ink">
                {isSameDay(parseISO(viewDate), new Date()) ? 'Hari Ini' : format(parseISO(viewDate), 'dd MMMM yyyy')}
              </h4>
              <p className="text-[10px] text-natural-mute font-bold uppercase tracking-widest">
                {format(parseISO(viewDate), 'EEEE')}
              </p>
            </div>
            <button 
              onClick={() => setViewDate(format(addDays(parseISO(viewDate), 1), 'yyyy-MM-dd'))}
              className="p-2 hover:bg-natural-bg rounded-full transition-colors text-natural-olive"
            >
              <ChevronRight size={20} />
            </button>
            {!isSameDay(parseISO(viewDate), new Date()) && (
              <button 
                onClick={() => setViewDate(format(new Date(), 'yyyy-MM-dd'))}
                className="ml-2 text-[9px] font-bold text-natural-olive hover:underline uppercase tracking-widest"
              >
                Hari Ini
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => exportToICal(items)} aria-label="Ekspor ke iCal">
              <Download size={14} className="mr-2" /> iCal
            </Button>
            <Button variant="outline" size="sm" onClick={() => syncWithGoogleCalendar(items)} aria-label="Sinkronisasi Google Calendar">
              <RefreshCw size={14} className="mr-2" /> Sync
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-serif italic text-natural-olive dark:text-dark-text">Jadwal Agenda</h3>
          {Notification.permission !== 'granted' && (
            <button 
              onClick={() => Notification.requestPermission()}
              className="text-[10px] font-bold text-natural-terracotta bg-natural-peach/30 px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest"
            >
              <Bell size={10} /> Aktifkan Notifikasi
            </button>
          )}
        </div>

        {filteredItemsByDate.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-natural-line/50">
            <Calendar className="w-12 h-12 text-natural-line mx-auto mb-4" />
            <p className="text-natural-mute font-serif italic">Tidak ada agenda untuk tanggal ini.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItemsByDate.map(item => {
              const isCompleted = item.completedDates?.includes(viewDate);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id} 
                  className={cn(
                    "bg-white p-6 rounded-[32px] shadow-sm border border-natural-line/30 flex items-center justify-between group hover:shadow-md transition-all",
                    isCompleted && "opacity-60 grayscale-[0.5]"
                  )}
                >
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => toggleComplete(item)}
                      className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        isCompleted 
                          ? "bg-natural-olive border-natural-olive text-white" 
                          : "border-natural-line hover:border-natural-olive"
                      )}
                    >
                      {isCompleted && <CheckCircle2 size={14} />}
                    </button>
                    <div className={cn(
                      "w-1 h-10 rounded-full",
                      item.activityType === 'Pekerjaan' ? 'bg-natural-olive' : 
                      item.activityType === 'Kesehatan' ? 'bg-natural-terracotta' : 'bg-natural-mute'
                    )} />
                    <div>
                      <h4 className={cn(
                        "font-serif font-bold text-natural-ink text-lg",
                        isCompleted && "line-through text-natural-mute"
                      )}>{item.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                      <p className="text-[11px] text-natural-mute flex items-center gap-1.5 font-bold uppercase tracking-tight">
                        <Clock size={12} className="text-natural-olive" />
                        {item.startTime} {item.endTime ? `— ${item.endTime}` : ''}
                      </p>
                      <span className="text-natural-line text-[10px]">•</span>
                      <p className="text-[11px] text-natural-mute font-bold uppercase tracking-tight">
                        {format(parseISO(viewDate), 'dd MMM yyyy')}
                      </p>
                      {item.recurrence && item.recurrence !== 'none' && (
                        <>
                          <span className="text-natural-line text-[10px]">•</span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter border border-blue-100">
                            <Repeat size={10} /> Rutin {item.recurrence === 'daily' ? 'Tiap Hari' : item.recurrence === 'weekly' ? 'Tiap Minggu' : 'Tiap Bulan'}
                          </span>
                        </>
                      )}
                      <span className="bg-natural-peach text-natural-terracotta px-2 py-0.5 rounded-full uppercase text-[9px] font-bold tracking-tighter mix-blend-multiply">
                        {item.activityType}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      showToast('Fitur berbagi materi segera hadir di Social Hub!', 'info');
                    }}
                    aria-label="Bagikan materi"
                    className="p-2.5 bg-natural-bg dark:bg-white/5 text-natural-mute hover:text-natural-terracotta rounded-full transition-colors"
                  >
                    <Share2 size={18} />
                  </button>
                  <button 
                    onClick={() => setEditingItem(item)}
                    aria-label="Edit agenda"
                    className="p-2.5 bg-natural-bg text-natural-mute hover:text-natural-olive rounded-full transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    aria-label="Hapus agenda"
                    className="p-2.5 bg-natural-bg text-natural-mute hover:text-natural-terracotta rounded-full transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-serif italic text-natural-olive font-bold">Edit Agenda</h3>
                  <button 
                    onClick={() => setEditingItem(null)} 
                    aria-label="Tutup modal"
                    className="p-2 hover:bg-natural-bg rounded-full transition-colors text-natural-mute"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Nama Kegiatan</label>
                    <input 
                      value={editingItem.title} 
                      onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full mt-1 p-4 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm placeholder:text-natural-mute/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Mulai</label>
                      <input 
                        type="time" 
                        value={editingItem.startTime} 
                        onChange={e => setEditingItem({...editingItem, startTime: e.target.value})}
                        className="w-full mt-1 p-4 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Selesai</label>
                      <input 
                        type="time" 
                        value={editingItem.endTime || ''} 
                        onChange={e => setEditingItem({...editingItem, endTime: e.target.value})}
                        className="w-full mt-1 p-4 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Tanggal</label>
                    <input 
                      type="date" 
                      value={editingItem.date} 
                      onChange={e => setEditingItem({...editingItem, date: e.target.value})}
                      className="w-full mt-1 p-4 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Pengulangan</label>
                      <select 
                        value={editingItem.recurrence || 'none'} 
                        onChange={e => setEditingItem({...editingItem, recurrence: e.target.value as any})}
                        className="w-full mt-1 p-4 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                      >
                        <option value="none">Sekali</option>
                        <option value="daily">Harian</option>
                        <option value="weekly">Mingguan</option>
                        <option value="monthly">Bulanan</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-natural-mute uppercase tracking-widest">Pengingat</label>
                      <select 
                        value={editingItem.reminderMinutes || 0} 
                        onChange={e => setEditingItem({...editingItem, reminderMinutes: Number(e.target.value)})}
                        className="w-full mt-1 p-4 bg-natural-bg border border-natural-line rounded-2xl outline-none text-sm"
                      >
                        <option value={0}>Tanpa Pengingat</option>
                        <option value={5}>5 Menit</option>
                        <option value={15}>15 Menit</option>
                        <option value={30}>30 Menit</option>
                        <option value={60}>1 Jam</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleUpdate}
                    className="w-full bg-natural-olive text-white p-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all font-serif italic text-lg"
                  >
                    <CheckCircle2 /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
