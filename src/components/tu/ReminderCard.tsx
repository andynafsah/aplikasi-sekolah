import React, { useState } from 'react';
import { Bell, Clock, Send, Calendar, CheckCircle } from 'lucide-react';
import axios from 'axios';

interface ReminderCardProps {
  key?: any;
  reminder: any;
  onRefresh?: () => void;
}

export default function ReminderCard({ reminder, onRefresh }: ReminderCardProps) {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(reminder.is_sent);

  const handleSendNow = async () => {
    setIsSending(true);
    try {
      const token = localStorage.getItem('erp_token');
      const res = await axios.post('/api/action?action=documentReminder', {
        sub_action: 'send_now',
        reminder_id: reminder.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setIsSent(true);
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Error triggering manual alert send', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`border p-4.5 rounded-xl shadow-sm space-y-3 transition ${
      isSent 
        ? 'bg-slate-50 border-slate-200 opacity-80' 
        : 'bg-amber-50/40 border-amber-200 animate-pulse-slow'
    }`}>
      
      {/* Top Section */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-1.5">
          <Bell className={`h-4.5 w-4.5 ${isSent ? 'text-slate-400' : 'text-amber-600 animate-bounce-slow'}`} />
          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-snug">
            {reminder.reminder_title}
          </h4>
        </div>
        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
          isSent 
            ? 'bg-slate-100 text-slate-600 border-slate-200' 
            : 'bg-amber-100 text-amber-800 border-amber-200'
        }`}>
          {isSent ? 'TERKIRIM' : 'AKTIF'}
        </span>
      </div>

      <p className="text-[10px] text-slate-600 leading-relaxed">
        {reminder.reminder_message}
      </p>

      {/* Meta indicators */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
        <div className="flex items-center gap-3 text-[9px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Remind: {reminder.reminder_date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Siklus: {reminder.frequency}</span>
          </div>
        </div>

        {!isSent ? (
          <button
            type="button"
            onClick={handleSendNow}
            disabled={isSending}
            className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-2.5 py-1 rounded transition flex items-center gap-1 cursor-pointer"
          >
            {isSending ? (
              <div className="h-3 w-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="h-2.5 w-2.5" />
            )}
            Uji Notifikasi
          </button>
        ) : (
          <div className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
            <CheckCircle className="h-3 w-3 text-emerald-600" />
            Terkirim via WA/Email
          </div>
        )}
      </div>

    </div>
  );
}
