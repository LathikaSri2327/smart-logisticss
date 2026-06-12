'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bell, Search, Menu } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useFetch, useApiMutation } from '@/hooks/useApi';
import { Avatar } from '@/components/ui';
import { formatDistanceToNow } from '@/utils/helpers';

export default function Navbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const { data, refetch } = useFetch<any>('/notifications');
  const { mutate } = useApiMutation();

  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  const markAll = () => mutate('patch', '/notifications', {}, () => refetch());

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" onClick={onMobileMenuToggle}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-72">
          <Search className="w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search shipments, orders..." className="bg-transparent text-sm outline-none w-full text-gray-700 dark:text-gray-300 placeholder-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600" />}
        </button>

        <div className="relative">
          <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-96 card shadow-xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                  {unread > 0 && <button onClick={markAll} className="text-xs text-brand-600 hover:text-brand-700 font-medium">Mark all read</button>}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {notifications.length ? notifications.slice(0, 10).map((n: any) => (
                    <div key={n.id} className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!n.readStatus ? 'bg-brand-50/50 dark:bg-brand-950/20' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.readStatus ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(n.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  )) : <div className="p-8 text-center text-gray-400 text-sm">No notifications</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800 ml-1">
          <Avatar name={user?.name || 'U'} image={user?.profileImage} size="sm" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize leading-tight">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
