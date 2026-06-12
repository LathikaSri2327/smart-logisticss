'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, Package, BarChart3, Shield, Zap, Globe, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const features = [
  { icon: Package, title: 'Real-time Tracking', desc: 'Track every shipment with live GPS updates and instant status notifications.', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'Gain insights with comprehensive dashboards, reports, and revenue forecasting.', color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade security with JWT authentication and role-based access control.', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { icon: Globe, title: 'Multi-Portal Access', desc: 'Separate portals for Admins, Clients, and Drivers with tailored experiences.', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  { icon: Zap, title: 'AI-Powered Insights', desc: 'Smart delay prediction, route optimization, and demand forecasting.', color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30' },
  { icon: Truck, title: 'Fleet Management', desc: 'Manage your entire vehicle fleet, driver assignments, and maintenance.', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
];

const stats = [
  { label: 'Shipments Tracked', value: '500K+' },
  { label: 'Active Clients', value: '2,000+' },
  { label: 'Countries', value: '50+' },
  { label: 'Uptime', value: '99.9%' },
];

export default function HomePage() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Smart Logistics</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/about" className="hover:text-gray-900 dark:hover:text-white transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              {isDark ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">Sign in</Link>
            <Link href="/signup" className="btn-primary text-sm px-4 py-2 rounded-lg">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-brand-900 to-gray-950 pt-24 pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-brand-500/30 mb-6">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              Enterprise Logistics Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
              Smart Logistics &<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">Shipment Tracking</span>
            </h1>
            <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
              The all-in-one platform for manufacturing and export companies to manage shipments, warehouses, and logistics in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40">
                Start free trial <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-base border border-white/20 transition-all backdrop-blur-sm">
                View demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} className="text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{s.value}</p>
                <p className="text-gray-500 text-sm mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to manage logistics</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Built for enterprise teams that need reliability, speed, and real-time visibility.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-brand-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to transform your logistics?</h2>
            <p className="text-brand-100 text-lg mb-8">Join 2,000+ companies managing their supply chain with Smart Logistics.</p>
            <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-xl">
              Get started free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Smart Logistics</span>
            </div>
            <p className="text-sm">© {new Date().getFullYear()} Smart Logistics & Shipment Tracking. All rights reserved.</p>
            <div className="flex gap-4 text-sm">
              <Link href="/about" className="hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
