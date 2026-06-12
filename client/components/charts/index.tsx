'use client';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { MonthlyData, StatusBreakdown } from '@/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const tooltipStyle = { contentStyle: { backgroundColor: 'var(--tooltip-bg, #fff)', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '12px' } };

// ─── Monthly Shipments Area Chart ──────────────────────
export const ShipmentsAreaChart = ({ data }: { data: MonthlyData[] }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-800" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Legend />
        <Area type="monotone" dataKey="shipments" stroke="#3b82f6" fill="url(#shipGrad)" strokeWidth={2} dot={false} name="Shipments" />
        <Area type="monotone" dataKey="delivered" stroke="#10b981" fill="url(#delGrad)" strokeWidth={2} dot={false} name="Delivered" />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── Revenue Bar Chart ──────────────────────────────────
export const RevenueBarChart = ({ data }: { data: MonthlyData[] }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" className="dark:stroke-gray-800" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip {...tooltipStyle} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']} />
        <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

// ─── Status Pie Chart ───────────────────────────────────
export const StatusPieChart = ({ data }: { data: StatusBreakdown[] }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="count">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tooltipStyle} formatter={(v: number, n: string, p: any) => [v, p.payload.status]} />
        <Legend iconType="circle" iconSize={8} formatter={(value, entry: any) => entry.payload.status} />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

// ─── Revenue by Type ────────────────────────────────────
export const RevenueByTypeChart = ({ data }: { data: StatusBreakdown[] }) => (
  <div className="h-72">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 60 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" className="dark:stroke-gray-800" />
        <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="status" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip {...tooltipStyle} />
        <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Shipments">
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);
