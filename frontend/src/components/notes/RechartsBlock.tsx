'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface ChartDataPoint {
  name: string;
  value?: number;
  [key: string]: any;
}

interface RechartsBlockProps {
  title?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  data: ChartDataPoint[];
  dataKeys?: string[];
}

const COLORS = ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function RechartsBlock({
  title = 'Data Visualization',
  chartType = 'bar',
  data = [],
  dataKeys = ['value']
}: RechartsBlockProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="my-6 p-4 sm:p-5 rounded-3xl bg-[#0b0f19] border border-indigo-500/30 shadow-2xl space-y-3 select-none">
      <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-2.5">
        <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
        <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">{title}</h4>
      </div>

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#4f46e5', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              {dataKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={3}
                  dot={{ r: 4, fill: COLORS[idx % COLORS.length] }}
                />
              ))}
            </LineChart>
          ) : chartType === 'pie' ? (
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#4f46e5', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              <Pie
                data={data}
                dataKey={dataKeys[0] || 'value'}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#4f46e5', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
              {dataKeys.map((key, idx) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={COLORS[idx % COLORS.length]}
                  radius={[6, 6, 0, 0]}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
