'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Truck, Target, Eye, Heart, Users, Package, Globe, Award,
  CheckCircle2, ArrowRight, Linkedin, Twitter, Mail
} from 'lucide-react';

const stats = [
  { value: '5,00,000+', label: 'Shipments Delivered' },
  { value: '2,000+', label: 'Happy Clients' },
  { value: '50+', label: 'Cities Covered' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
];

const values = [
  { icon: Target, title: 'Reliability', desc: 'We deliver on our promises — every shipment, every time, on schedule.', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
  { icon: Eye, title: 'Transparency', desc: 'Full visibility into every step of your supply chain with real-time tracking.', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  { icon: Heart, title: 'Customer First', desc: 'Every decision we make is driven by what\'s best for our clients.', color: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
  { icon: Globe, title: 'Innovation', desc: 'Leveraging the latest technology to make logistics smarter and faster.', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
];

const team = [
  { name: 'Lathika Sri R', role: 'CEO & Co-Founder', location: 'Chennai', initials: 'LS', color: 'bg-brand-600' },
  { name: 'Christy R', role: 'CTO & Co-Founder', location: 'Chennai', initials: 'CR', color: 'bg-purple-600' },
];

const milestones = [
  { year: '2019', title: 'Founded', desc: 'Smart Logistics was founded in Mumbai with a vision to modernize Indian logistics.' },
  { year: '2020', title: 'First 100 Clients', desc: 'Reached 100 active clients across Maharashtra and Karnataka.' },
  { year: '2021', title: 'Pan-India Expansion', desc: 'Expanded operations to 25 cities with a fleet of 500+ vehicles.' },
  { year: '2022', title: 'Tech Platform Launch', desc: 'Launched our AI-powered shipment tracking and warehouse management platform.' },
  { year: '2023', title: '1 Lakh Shipments', desc: 'Crossed 1,00,000 successful deliveries with 99.8% on-time rate.' },
  { year: '2024', title: '2000+ Clients', desc: 'Serving 2,000+ businesses across 50+ cities with ₹500 Cr+ in shipment value managed.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Navbar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 px-6 h-16 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Smart Logistics</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</Link>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 font-medium px-4 py-2">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm rounded-lg px-4 py-2">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-950 via-brand-900 to-gray-950 py-24 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-brand-500/30 mb-6">
            <Heart className="w-3.5 h-3.5" /> Our Story
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white mb-6 leading-tight">
            Moving India's Economy,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-400">One Shipment at a Time</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Smart Logistics is India's leading tech-enabled logistics platform, helping businesses of all sizes move goods faster, smarter, and more reliably across the country.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-14 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="text-center"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <p className="text-3xl font-black text-brand-600 dark:text-brand-400">{s.value}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
            initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-5">
              <Target className="w-6 h-6 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Mission</h2>
            <p className="text-gray-500 leading-relaxed">
              To empower Indian businesses with world-class logistics technology — making supply chain management accessible, affordable, and efficient for enterprises and MSMEs alike.
            </p>
          </motion.div>
          <motion.div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-800"
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-xl flex items-center justify-center mb-5">
              <Eye className="w-6 h-6 text-cyan-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Our Vision</h2>
            <p className="text-gray-500 leading-relaxed">
              To become India's most trusted logistics platform by 2030 — connecting every corner of the country with reliable, transparent, and technology-driven delivery solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">What We Stand For</h2>
            <p className="text-gray-500">The values that guide every decision we make.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-4`}>
                  <v.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Our Journey</h2>
            <p className="text-gray-500">From a small startup to India's leading logistics platform.</p>
          </div>
          <div className="relative">
            <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div key={m.year} className="flex gap-6"
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <div className="w-32 flex-shrink-0 flex flex-col items-center gap-2">
                    <span className="font-black text-brand-600 dark:text-brand-400 text-lg">{m.year}</span>
                    <div className="w-4 h-4 bg-brand-600 rounded-full ring-4 ring-brand-100 dark:ring-brand-900/30 z-10" />
                  </div>
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 flex-1 mb-2">
                    <p className="font-bold text-gray-900 dark:text-white mb-1">{m.title}</p>
                    <p className="text-gray-500 text-sm">{m.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Meet the Team</h2>
            <p className="text-gray-500">The people behind Smart Logistics.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {team.map((t, i) => (
              <motion.div key={t.name} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow text-center"
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className={`w-16 h-16 ${t.color} rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4`}>
                  {t.initials}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{t.name}</h3>
                <p className="text-brand-600 dark:text-brand-400 text-sm font-medium mt-0.5">{t.role}</p>
                <p className="text-gray-400 text-xs mt-1 flex items-center justify-center gap-1">
                  <Globe className="w-3 h-3" />{t.location}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-brand-600">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your logistics?</h2>
            <p className="text-brand-100 text-lg mb-8">Join 2,000+ Indian businesses managing their supply chain with Smart Logistics.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 px-8 py-4 rounded-xl font-bold transition-all shadow-xl">
                Get started free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold border border-white/20 transition-all">
                Contact sales <Mail className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold">Smart Logistics</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} Smart Logistics. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
