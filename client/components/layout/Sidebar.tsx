'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Avatar } from '@/components/ui';
import {
  LayoutDashboard, Package, Truck, Users, Warehouse, BarChart3, Settings,
  Bell, FileText, MapPin, ClipboardList, Navigation, ChevronLeft, ChevronRight,
  LogOut, Car, ShoppingBag,
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/shipments', label: 'Shipments', icon: Package },
  { href: '/admin/drivers', label: 'Drivers', icon: Truck },
  { href: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { href: '/admin/warehouse', label: 'Warehouse', icon: Warehouse },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const clientLinks = [
  { href: '/client', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/orders', label: 'My Orders', icon: ShoppingBag },
  { href: '/client/track', label: 'Track Shipment', icon: MapPin },
  { href: '/client/invoices', label: 'Invoices', icon: FileText },
  { href: '/client/notifications', label: 'Notifications', icon: Bell },
];

const driverLinks = [
  { href: '/driver', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/driver/deliveries', label: 'Deliveries', icon: ClipboardList },
  { href: '/driver/route', label: 'Route Tracking', icon: Navigation },
  { href: '/driver/update', label: 'Update Status', icon: Package },
];

const linksByRole: Record<string, typeof adminLinks> = {
  admin: adminLinks,
  client: clientLinks,
  driver: driverLinks,
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const links = linksByRole[user?.role || 'client'] || clientLinks;

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden z-20"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">Smart Logistics</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role} Portal</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-30 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && href !== '/client' && href !== '/driver' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`} title={collapsed ? label : undefined}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="truncate">{label}</motion.span>}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <div className={`flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={user?.name || 'U'} image={user?.profileImage} size="sm" />
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && (
            <button onClick={logout} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 transition-colors" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
