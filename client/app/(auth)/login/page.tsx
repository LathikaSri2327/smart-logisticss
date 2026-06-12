'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input } from '@/components/ui';
import { api } from '@/lib/api';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const data: any = await api.post('/auth/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      router.replace(`/${data.user.role}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="card p-8 shadow-2xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-600/30">
          <Truck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to Smart Logistics</p>
      </div>

      <div className="bg-brand-50 dark:bg-brand-950/30 rounded-xl p-3 mb-6 text-xs text-brand-700 dark:text-brand-400 space-y-1">
        <p className="font-semibold mb-1">Demo accounts:</p>
        <p>Admin: admin@logistics.com / password123</p>
        <p>Client: alice@techcorp.com / password123</p>
        <p>Driver: david@logistics.com / password123</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@company.com" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} icon={<Mail className="w-4 h-4" />} required />
        <Input label="Password" type="password" placeholder="••••••••" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} icon={<Lock className="w-4 h-4" />} required />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-brand-600" />
            <span className="text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 font-medium">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full justify-center" size="lg" icon={<ArrowRight className="w-4 h-4" />}>
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-semibold">Sign up</Link>
      </p>
    </motion.div>
  );
}
