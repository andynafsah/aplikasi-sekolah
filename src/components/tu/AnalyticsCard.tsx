import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { BarChart3, TrendingUp, Inbox, CheckCircle, Clock } from 'lucide-react';

interface AnalyticsCardProps {
  analyticsData: any;
}

export default function AnalyticsCard({ analyticsData }: AnalyticsCardProps) {
  if (!analyticsData) return null;

  const COLORS = ['#e11d48', '#d97706', '#3b82f6', '#10b981', '#6b7280'];

  return (
    <div className="space-y-6">
      
      {/* Visual Analytics Widgets Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Trend Area Chart */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
              Volume Pertumbuhan Agenda Surat (6 Bulan Terakhir)
            </h4>
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-150 px-2 py-0.5 rounded font-mono font-bold">
              REALTIME REFECTH
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.letterGrowth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                <YAxis style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="Incoming" name="Surat Masuk" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="Outgoing" name="Surat Keluar" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorOut)" />
                <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-indigo-600" />
              Status Distribusi Disposisi Surat Masuk
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">
              KPI SUMMARY
            </span>
          </div>

          <div className="h-56 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.dispositionStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analyticsData.dispositionStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 w-full">
              {analyticsData.dispositionStatus.map((item: any, idx: number) => (
                <div key={item.name} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <strong className="text-slate-800 font-mono">{item.value} Berkas</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
