'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck } from 'lucide-react';

const plans = [
  { name: 'Starter', price: 4099, desc: 'For small businesses getting started', features: ['Up to 500 shipments/month', '2 admin users', 'Basic analytics', 'Email support', 'Client portal'], highlight: false },
  { name: 'Professional', price: 12499, desc: 'For growing logistics companies', features: ['Up to 5,000 shipments/month', '10 admin users', 'Advanced analytics & AI insights', 'Priority support', 'Client & driver portals', 'Warehouse management', 'QR code generation'], highlight: true },
  { name: 'Enterprise', price: 41499, desc: 'For large-scale operations', features: ['Unlimited shipments', 'Unlimited users', 'Full analytics suite', 'Dedicated support', 'All portals', 'Full warehouse management', 'Custom integrations', 'SLA guarantee'], highlight: false },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center"><Truck className="w-4 h-4 text-white" /></div>
          <span className="font-bold text-gray-900 dark:text-white">Smart Logistics</span>
        </Link>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 font-medium px-4 py-2">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm rounded-lg">Get started</Link>
        </div>
      </nav>
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Simple, transparent pricing</h1>
          <p className="text-gray-500 text-lg">Choose the plan that fits your operation. Upgrade or downgrade anytime.</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} className={`rounded-2xl p-6 border-2 ${plan.highlight ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              {plan.highlight && <div className="bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">Most Popular</div>}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{plan.desc}</p>
              <div className="mb-6"><span className="text-4xl font-black text-gray-900 dark:text-white">₹{plan.price.toLocaleString('en-IN')}</span><span className="text-gray-500">/mo</span></div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`block text-center py-3 rounded-xl font-semibold transition-all ${plan.highlight ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-600/30' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                Get started
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
