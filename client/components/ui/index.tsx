'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { ShipmentStatus, Priority, PaymentStatus, VehicleStatus, InventoryStatus } from '@/types';

// ─── Button ─────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
export const Button = ({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }: ButtonProps) => {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = { primary: 'bg-brand-600 hover:bg-brand-700 text-white', secondary: 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300', danger: 'bg-red-600 hover:bg-red-700 text-white', ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400' };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ─── Input ──────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}
export const Input = ({ label, error, icon, className = '', ...props }: InputProps) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
      <input className={`input ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`} {...props} />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Select ─────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; }
export const Select = ({ label, error, children, className = '', ...props }: SelectProps) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <select className={`input ${error ? 'border-red-500' : ''} ${className}`} {...props}>{children}</select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// ─── Badge ──────────────────────────────────────────────
const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Packed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  'In Transit': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  'Customs Clearance': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  'Out for Delivery': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'In Use': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  Normal: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  'Low Stock': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Overstocked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  Refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  Low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  Urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  client: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  driver: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export const Badge = ({ label, dot = false }: { label: string; dot?: boolean }) => (
  <span className={`badge ${statusColors[label] || 'bg-gray-100 text-gray-800'}`}>
    {dot && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1" />}
    {label}
  </span>
);

// ─── Modal ──────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl'; }
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div className={`relative card w-full ${sizes[size]} max-h-[90vh] overflow-y-auto z-10`} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Skeleton ───────────────────────────────────────────
export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />
);

export const SkeletonCard = () => (
  <div className="card p-6 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

// ─── Empty State ────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);

// ─── Stat Card ──────────────────────────────────────────
interface StatCardProps { title: string; value: string | number; change?: string; positive?: boolean; icon: React.ReactNode; color: string; }
export const StatCard = ({ title, value, change, positive, icon, color }: StatCardProps) => (
  <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      {change && <span className={`text-xs font-medium px-2 py-1 rounded-full ${positive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{change}</span>}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{typeof value === 'number' && value > 999 ? value.toLocaleString() : value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
  </motion.div>
);

// ─── Table ──────────────────────────────────────────────
interface TableProps { headers: string[]; children: React.ReactNode; loading?: boolean; }
export const Table = ({ headers, children, loading }: TableProps) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-800">
          {headers.map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>)}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {loading ? Array.from({ length: 5 }).map((_, i) => (
          <tr key={i}>{headers.map((h) => <td key={h} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>)}</tr>
        )) : children}
      </tbody>
    </table>
  </div>
);

// ─── Search Bar ─────────────────────────────────────────
import { Search } from 'lucide-react';
export const SearchBar = ({ value, onChange, placeholder = 'Search...' }: { value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-10 w-full" />
  </div>
);

// ─── Avatar ─────────────────────────────────────────────
export const Avatar = ({ name, image, size = 'md' }: { name: string; image?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  return image
    ? <img src={image} alt={name} className={`${sizes[size]} rounded-full object-cover`} />
    : <div className={`${sizes[size]} rounded-full bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold`}>{initials}</div>;
};

// ─── Pagination ─────────────────────────────────────────
export const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800">
      <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
      <div className="flex gap-1">
        <Button variant="secondary" size="sm" disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)}>Prev</Button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button key={p} onClick={() => onPageChange(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === currentPage ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{p}</button>
        ))}
        <Button variant="secondary" size="sm" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>Next</Button>
      </div>
    </div>
  );
};
