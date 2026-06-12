'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, Mail, Lock, User, Phone, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button, Input, Select } from '@/components/ui';
import { api } from '@/lib/api';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', phone: '', company: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Please fill required fields');
    setLoading(true);
    try {
      const data: any = await api.post('/auth/register', form);
      login(data.token, data.user);
      toast.success('Account created successfully!');
      router.replace(`/${data.user.role}`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <motion.div className="card p-8 shadow-2xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center mb-4">
          <Truck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create account</h1>
        <p className="text-gray-500 text-sm mt-1">Join Smart Logistics today</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Full name" placeholder="John Doe" value={form.name} onChange={set('name')} icon={<User className="w-4 h-4" />} required />
          <Input label="Phone" type="tel" placeholder="+1 555 0100" value={form.phone} onChange={set('phone')} icon={<Phone className="w-4 h-4" />} />
        </div>
        <Input label="Email address" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} icon={<Mail className="w-4 h-4" />} required />
        <Input label="Company" placeholder="Your company" value={form.company} onChange={set('company')} icon={<Building2 className="w-4 h-4" />} />
        <Input label="Password" type="password" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} icon={<Lock className="w-4 h-4" />} required />
        <Select label="Account type" value={form.role} onChange={set('role')}>
          <option value="client">Client</option>
          <option value="driver">Driver</option>
        </Select>
        <Button type="submit" loading={loading} className="w-full justify-center" size="lg">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-semibold">Sign in</Link>
      </p>
    </motion.div>
  );
}
