'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
  };

  return (
    <motion.div className="card p-8 shadow-2xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
      {sent ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">We sent password reset instructions to <strong>{email}</strong></p>
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium text-sm">Back to sign in</Link>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
            <p className="text-gray-500 text-sm mt-1">Enter your email and we&apos;ll send you reset instructions.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email address" type="email" placeholder="you@company.com" value={email}
              onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
            <Button type="submit" className="w-full justify-center" size="lg">Send reset link</Button>
          </form>
          <div className="mt-6">
            <Link href="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <ArrowLeft className="w-4 h-4" /> Back to sign in
            </Link>
          </div>
        </>
      )}
    </motion.div>
  );
}
