'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Input, Avatar } from '@/components/ui';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', company: user?.company || '', address: user?.address || '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/auth/profile', form);
      toast.success('Profile updated');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="lg:w-48 flex-shrink-0">
          <nav className="card p-2 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${tab === id ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <motion.div className="card p-6" key={tab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            {tab === 'profile' && (
              <div className="space-y-6">
                <h2 className="font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <div className="flex items-center gap-4">
                  <Avatar name={user?.name || 'U'} size="lg" />
                  <div>
                    <Button variant="secondary" size="sm">Change Photo</Button>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  <Input label="Email" value={user?.email || ''} disabled className="opacity-60" />
                  <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 0100" />
                  <Input label="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company name" />
                </div>
                <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Your address" />
                <Button icon={<Save className="w-4 h-4" />} loading={loading} onClick={handleSave}>Save Changes</Button>
              </div>
            )}
            {tab === 'notifications' && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                {['Shipment status updates', 'New client registrations', 'Low warehouse stock alerts', 'Driver location updates', 'Payment notifications', 'System alerts'].map((item) => (
                  <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    <button className="relative w-10 h-5 bg-brand-600 rounded-full transition-colors">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {tab === 'appearance' && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Appearance</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['Light', 'Dark'].map((mode) => (
                    <button key={mode} onClick={() => { if ((mode === 'Dark') !== isDark) toggleTheme(); }}
                      className={`p-4 rounded-xl border-2 transition-colors ${(mode === 'Dark') === isDark ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className={`w-full h-16 rounded-lg mb-2 ${mode === 'Dark' ? 'bg-gray-900' : 'bg-white border border-gray-200'}`} />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{mode} Mode</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {tab === 'security' && (
              <div className="space-y-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">Security</h2>
                <div className="space-y-4">
                  <Input label="Current Password" type="password" placeholder="••••••••" />
                  <Input label="New Password" type="password" placeholder="••••••••" />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                  <Button icon={<Save className="w-4 h-4" />}>Update Password</Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
