'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Play, 
  ChevronRight, 
  Globe, 
  Cpu, 
  Award,
  Layers,
  Flame,
  Check
} from 'lucide-react';

// Dynamic imports to avoid SSR issues
const ThreeCanvas = dynamic(() => import('@/components/ThreeCanvas'), { ssr: false });
const DashboardLayout = dynamic(() => import('@/components/dashboard/layout'), { ssr: false });
const DashboardPage = dynamic(() => import('@/components/dashboard/page'), { ssr: false });

export default function RootPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(Boolean(token));
  }, []);

  // Show loading skeleton while checking auth state on client
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-indigo-300">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 animate-pulse" /> Loading ScholarOS...
        </div>
      </div>
    );
  }

  // If user is authenticated, render the main Study Cockpit / Dashboard
  if (isAuthenticated) {
    return (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  // Otherwise, render the public Landing Page
  return <LandingPage />;
}

function LandingPage() {
  const [lang, setLang] = useState<'en' | 'ta' | 'tanglish'>('tanglish');
  const [promptInput, setPromptInput] = useState('How to prepare for Data Structures exam in 5 days?');
  const [aiResponse, setAiResponse] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // 3D Card Flip Interactive Demo state
  const [cardFlipped, setCardFlipped] = useState(false);
  const [sm2Quality, setSm2Quality] = useState<number | null>(null);

  const handleSimulateAI = () => {
    setIsSimulating(true);
    setAiResponse('');
    
    let sample = '';
    if (lang === 'tanglish') {
      sample = "Machi don't worry! Data Structures exam-kku 5-days plan irukku:\n1. Day 1-2: Binary Trees & Graph Traversal concepts complete pannu.\n2. Day 3: Dynamic Programming table patterns practice pannu.\n3. Day 4-5: ScholarOS SM-2 Flashcards review pannu to lock 90+ marks!";
    } else if (lang === 'ta') {
      sample = "கவலைப்பட வேண்டாம்! தரவு அமைப்புகள் தேர்வுக்கு 5 நாள் திட்டம்:\n1. நாள் 1-2: மரங்கள் மற்றும் வரைபடங்கள் தலைப்புகளை படிக்கவும்.\n2. நாள் 3: டைனமிக் புரோகிராமிங் பயிற்சிகள் செய்யவும்.\n3. நாள் 4-5: ScholarOS SM-2 கார்டுகளை நினைவுகூரவும்!";
    } else {
      sample = "Here is your 5-Day Data Structures Mastery Plan:\n1. Days 1-2: Focus on Binary Search Trees and Graph Traversal algorithms.\n2. Day 3: Master Dynamic Programming memoization patterns.\n3. Days 4-5: Run ScholarOS SM-2 Spaced Repetition flashcards to solidify 90%+ recall!";
    }

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < sample.length) {
        setAiResponse((prev) => prev + sample[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 20);
  };

  return (
    <div className="relative min-h-screen bg-[#070709] text-white overflow-hidden selection:bg-purple-500 selection:text-white font-sans">
      {/* Interactive 60fps 3D Canvas WebGL Backdrop */}
      <ThreeCanvas />

      {/* Radial Gradient Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-[140px] pointer-events-none z-0 gpu-accelerated" />
      <div className="absolute top-[40%] right-[-200px] w-[600px] h-[600px] bg-purple-600/15 blur-[160px] pointer-events-none z-0 gpu-accelerated" />

      {/* Navigation Header */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0d0d12] rounded-[14px] flex items-center justify-center">
              <Brain className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-gray-200 to-indigo-300 bg-clip-text text-transparent">
            Scholar<span className="text-indigo-400">OS</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-gray-400 backdrop-blur-md bg-white/[0.03] border border-white/10 px-6 py-2.5 rounded-full shadow-2xl">
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#ai-engine" className="hover:text-white transition-colors duration-200">AI Engine</a>
          <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-xs font-semibold text-gray-300 hover:text-white px-4 py-2 transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            href="/onboarding"
            className="relative group overflow-hidden rounded-xl p-px font-semibold text-xs transition shadow-lg shadow-indigo-600/30 hover:shadow-purple-600/50 hover:scale-105 duration-300"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:opacity-90 transition opacity-80" />
            <span className="relative block px-5 py-2.5 bg-[#0b0b10] rounded-[11px] text-white transition group-hover:bg-transparent">
              Launch Cockpit →
            </span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium backdrop-blur-lg shadow-inner"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Powered by Groq Llama 3.3 70B & SM-2 Spaced Repetition</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
        >
          Master Any Subject with{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ScholarOS
          </span>
          <br />
          <span className="text-3xl md:text-5xl text-gray-300 font-bold">
            Your 3D AI Academic Operating System
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="max-w-2xl mx-auto text-base md:text-lg text-gray-400 leading-relaxed font-normal"
        >
          Automate study schedules, predict exam scores before test day, eliminate attendance risks, and master concepts 10x faster with AI spaced repetition.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link
            href="/onboarding"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 group transition-all duration-300 hover:scale-105 transform-gpu"
          >
            Start Free Academic Onboarding <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#ai-engine"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/15 bg-white/[0.03] hover:bg-white/[0.08] text-white font-semibold text-sm backdrop-blur-md flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 transform-gpu"
          >
            <Play className="w-4 h-4 text-purple-400 fill-purple-400" /> Watch Interactive Demo
          </a>
        </motion.div>

        {/* Live Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-12"
        >
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md text-center space-y-1 hover:border-indigo-500/40 transition-all duration-300 transform-gpu hover:scale-105">
            <h3 className="text-2xl md:text-3xl font-black text-indigo-400">99.2%</h3>
            <p className="text-xs text-gray-400">Exam Prediction Accuracy</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md text-center space-y-1 hover:border-purple-500/40 transition-all duration-300 transform-gpu hover:scale-105">
            <h3 className="text-2xl md:text-3xl font-black text-purple-400">10x</h3>
            <p className="text-xs text-gray-400">Faster Concept Recall</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md text-center space-y-1 hover:border-pink-500/40 transition-all duration-300 transform-gpu hover:scale-105">
            <h3 className="text-2xl md:text-3xl font-black text-pink-400">54,000+</h3>
            <p className="text-xs text-gray-400">Study Hours Optimized</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md text-center space-y-1 hover:border-emerald-500/40 transition-all duration-300 transform-gpu hover:scale-105">
            <h3 className="text-2xl md:text-3xl font-black text-emerald-400">100% Free</h3>
            <p className="text-xs text-gray-400">Cloud Memory Database</p>
          </div>
        </motion.div>
      </section>

      {/* 3D Glassmorphic Feature Grid with Scroll Reveal */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center space-y-3"
        >
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Built for Excellence</span>
          <h2 className="text-3xl md:text-5xl font-black">Supercharge Your Learning Engine</h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Everything you need for top grades in school, college, or competitive exams.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Attendance Cockpit */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden group transform-gpu transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Attendance Cockpit</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Smart safety margin calculation. Know exactly how many classes you can miss while staying safely above 75%.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Data Structures</span>
                <span className="text-emerald-400 font-bold">84% (Safe)</span>
              </div>
              <p className="text-[11px] text-gray-400">💡 Predictor: You can miss <strong className="text-emerald-300">3</strong> more classes.</p>
            </div>
          </motion.div>

          {/* Card 2: AI Exam Score Predictor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden group transform-gpu transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">AI Study Schedule Planner</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Generates personalized daily study blocks based on syllabus units, exam dates, and registered subject workloads.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Goal Progress</span>
                <span className="text-indigo-400 font-bold">4 / 5 Blocks Done</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-indigo-500 h-1.5 rounded-full w-[80%]" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Document & PDF Vault */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
            whileHover={{ y: -6, scale: 1.02 }}
            className="p-8 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 relative overflow-hidden group transform-gpu transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">OCR & PDF Intelligence</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Scan hand-written lecture notes or upload textbooks. Scholar AI indexes every page for instant semantic search.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <span className="text-purple-300 font-mono text-[11px]">⚡ Vector Indexing Active</span>
              <p className="text-[11px] text-gray-400">Search 400+ pages of handwritten notes in 0.2s.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Interactive AI Terminal Demo */}
      <section id="ai-engine" className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center space-y-3"
        >
          <span className="text-xs font-bold text-pink-400 uppercase tracking-widest">Interactive Playground</span>
          <h2 className="text-3xl md:text-5xl font-black">Experience Scholar AI Live</h2>
          <p className="text-sm text-gray-400">Test how Scholar AI responds in English, Tamil, or Tanglish.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-[#0b0a12] border border-white/15 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-xl"
        >
          {/* Language Selector */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Globe className="w-4 h-4 text-indigo-400" /> Preferred Language:
            </div>
            <div className="flex gap-2">
              {(['en', 'ta', 'tanglish'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200 ${
                    lang === l
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'English' : l === 'ta' ? 'Tamil' : 'Tanglish'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Prompt Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors duration-200"
              placeholder="Ask Scholar AI anything about your studies..."
            />
            <button
              onClick={handleSimulateAI}
              disabled={isSimulating}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all duration-200 flex items-center gap-2 transform-gpu hover:scale-105"
            >
              <Sparkles className="w-4 h-4" /> {isSimulating ? 'Thinking...' : 'Ask AI'}
            </button>
          </div>

          {/* AI Response Output Console */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-5 min-h-[120px] font-mono text-xs text-indigo-200 leading-relaxed whitespace-pre-line">
            {aiResponse || <span className="text-gray-600">Click &quot;Ask AI&quot; above to simulate response...</span>}
          </div>
        </motion.div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="relative z-10 max-w-5xl mx-auto px-6 py-20 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center space-y-3"
        >
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Accessible for Everyone</span>
          <h2 className="text-3xl md:text-5xl font-black">Simple, Student-Friendly Pricing</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6 flex flex-col justify-between transform-gpu hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Scholar Free</h3>
              <p className="text-xs text-gray-400">Everything you need for everyday academic success.</p>
              <div className="text-4xl font-black">₹0 <span className="text-xs font-normal text-gray-400">/ forever</span></div>
              <ul className="space-y-2 text-xs text-gray-300 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Attendance Cockpit & Predictor</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> SM-2 Spaced Repetition Flashcards</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Groq Llama 3.3 70B AI Companion</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Cloud Database & Storage</li>
              </ul>
            </div>
            <Link
              href="/onboarding"
              className="w-full py-3 rounded-xl border border-white/20 text-center font-bold text-xs hover:bg-white/10 transition-colors duration-200"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Pro Tier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
            className="p-8 rounded-3xl bg-gradient-to-b from-indigo-900/40 via-purple-900/20 to-black border border-indigo-500/50 space-y-6 flex flex-col justify-between relative shadow-2xl transform-gpu hover:scale-[1.02] transition-transform duration-300"
          >
            <span className="absolute top-4 right-4 bg-indigo-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</span>
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-indigo-300">Scholar Pro</h3>
              <p className="text-xs text-gray-400">Advanced AI features for competitive exam candidates.</p>
              <div className="text-4xl font-black text-white">₹199 <span className="text-xs font-normal text-gray-400">/ month</span></div>
              <ul className="space-y-2 text-xs text-gray-300 pt-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Everything in Free Plan</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Unlimited Hand-Written Document OCR</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Compiled Markdown & AI Notes Generator</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Priority Groq Llama 3.3 70B API Speed</li>
              </ul>
            </div>
            <Link
              href="/onboarding"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs text-center shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              Start 14-Day Free Trial
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-400" />
          <span>© 2026 ScholarOS. Powered by Groq Llama 3.3 70B.</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing</a>
          <Link href="/login" className="hover:text-white transition-colors duration-200">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
