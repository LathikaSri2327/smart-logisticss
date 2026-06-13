'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, Mail, Phone, MapPin, Clock, Send, MessageSquare, HeadphonesIcon, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

const offices = [
  {
    city: 'Mumbai',
    type: 'Head Office',
    address: '100 Industrial Blvd, Andheri East, Mumbai - 400069',
    phone: '+91 98765 00100',
    email: 'mumbai@smartlogistics.com',
    hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
  },
  {
    city: 'Delhi',
    type: 'Regional Office',
    address: '200 Logistics Park, Dwarka, New Delhi - 110075',
    phone: '+91 98765 00200',
    email: 'delhi@smartlogistics.com',
    hours: 'Mon–Sat: 9:00 AM – 6:00 PM',
  },
  {
    city: 'Bangalore',
    type: 'Tech Hub',
    address: '300 IT Corridor, Whitefield, Bangalore - 560066',
    phone: '+91 98765 00300',
    email: 'bangalore@smartlogistics.com',
    hours: 'Mon–Fri: 9:00 AM – 7:00 PM',
  },
];

const contacts = [
  { icon: HeadphonesIcon, label: 'Customer Support', value: '+91 1800 123 4567', sub: 'Toll-free · 24/7', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
  { icon: Truck, label: 'Shipment Tracking', value: '+91 98765 11111', sub: 'Mon–Sat 8AM–8PM', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
  { icon: Building2, label: 'Corporate Sales', value: '+91 98765 22222', sub: 'Mon–Fri 9AM–6PM', color: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
  { icon: Mail, label: 'Email Us', value: 'support@smartlogistics.com', sub: 'Reply within 24 hours', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill all required fields');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    setLoading(false);
  };

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
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 font-medium px-4 py-2">Sign in</Link>
          <Link href="/signup" className="btn-primary text-sm rounded-lg px-4 py-2">Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-950 via-brand-900 to-gray-950 py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full border border-brand-500/30 mb-6">
            <MessageSquare className="w-3.5 h-3.5" /> Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">We're here to help</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Reach out to our team for support, sales, or any logistics queries. We respond within 24 hours.</p>
        </motion.div>
      </section>

      {/* Contact Cards */}
      <section className="py-16 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contacts.map((c, i) => (
            <motion.div key={c.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{c.label}</p>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Form + Offices */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Send us a message</h2>
            <p className="text-gray-500 text-sm mb-6">Fill out the form and our team will get back to you shortly.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                  <input type="text" placeholder="Lathika Sri" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input w-full" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input w-full" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input type="tel" placeholder="+91 98765 XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                  <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input w-full">
                    <option value="">Select topic</option>
                    <option>Shipment Tracking</option>
                    <option>Pricing & Plans</option>
                    <option>Technical Support</option>
                    <option>Driver Registration</option>
                    <option>Warehouse Inquiry</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                <textarea rows={5} placeholder="Describe your query in detail..." value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input w-full resize-none" required />
              </div>
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>

          {/* Offices */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Our Offices</h2>
            <p className="text-gray-500 text-sm mb-6">Visit us at any of our offices across India.</p>
            <div className="space-y-4">
              {offices.map((o, i) => (
                <motion.div key={o.city} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 dark:text-white">{o.city}</h3>
                    <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">{o.type}</span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />{o.address}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />{o.phone}</p>
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0 text-gray-400" />{o.email}</p>
                    <p className="flex items-center gap-2"><Clock className="w-4 h-4 flex-shrink-0 text-gray-400" />{o.hours}</p>
                  </div>
                </motion.div>
              ))}
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
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
