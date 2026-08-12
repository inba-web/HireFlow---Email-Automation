import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  MailCheckIcon,
  FileSignatureIcon,
  ShieldCheckIcon,
  ZapIcon,
  LayersIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircle2Icon,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Footer from '../components/footer';
import LenisScroll from '../components/lenis-scroll';
import { AmbientBackground } from '../components/AmbientBackground';
import { GlassButton } from '../components/ui/GlassButton';
import { useUser } from '@clerk/clerk-react';

export function LandingPage() {
  const { isSignedIn } = useUser();
  const features = [
    {
      icon: UsersIcon,
      title: 'Automated Candidate Funnel',
      description: 'Import CSV rosters with instant email formatting, duplicate detection, and automated stage tagging.',
    },
    {
      icon: MailCheckIcon,
      title: 'High-Scale Email Dispatch',
      description: 'Queue-backed asynchronous delivery with concurrency limits, exponential backoff, and delivery logs.',
    },
    {
      icon: FileSignatureIcon,
      title: 'Dynamic PDF Generation',
      description: 'Generate high-resolution Offer Letters, Internship Certificates, and Selection Letters personalized via Puppeteer.',
    },
    {
      icon: LayersIcon,
      title: '7-Step Campaign Wizard',
      description: 'Craft campaigns with candidate selection, template interpolation, and live recipient personalization preview.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise OWASP Security',
      description: 'Clerk identity authentication, RBAC authorization, tamper-proof audit trails, and strict secret protection.',
    },
    {
      icon: ZapIcon,
      title: 'Zero Duplicate Dispatch',
      description: 'Idempotency keys and worker-level locking guarantee zero duplicated emails even on unexpected restarts.',
    },
  ];

  const workflow = [
    {
      step: '01',
      title: 'Import & Filter Candidates',
      desc: 'Upload CSV or sync applicant tracking rosters with intelligent deduplication and instant validation.',
    },
    {
      step: '02',
      title: 'Pick or Create Dynamic Templates',
      desc: 'Insert tags like {{candidateName}}, {{jobRole}}, and {{salary}} into rich HTML templates.',
    },
    {
      step: '03',
      title: 'Personalize & Preview PDFs',
      desc: 'Verify the exact generated PDF and rendered email content for every individual candidate.',
    },
    {
      step: '04',
      title: 'Async Dispatch & Live Tracking',
      desc: 'Trigger BullMQ-powered background queue dispatch with real-time delivery logs and retry diagnostics.',
    },
  ];

  return (
    <>
      <LenisScroll />
      <Navbar />
      <AmbientBackground />

      <main className="px-4 md:px-12 max-w-7xl mx-auto space-y-36 pt-12 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center text-center mt-16">


          <motion.h1
            className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl mt-6 leading-[1.15] text-white"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Automate Candidate Outreach, <br className="hidden sm:block" />
            <span className="text-white">Offer Letters &amp; </span>
            <span className="bg-gradient-to-r from-[#D10A8A] via-[#F26A06] to-[#2E08CF] bg-clip-text text-transparent">
              Campaigns.
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-300 text-base md:text-lg max-w-2xl mt-6 leading-relaxed"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Empower your Talent Acquisition team to import candidates, generate personalized PDF contracts, and execute high-throughput email campaigns with real-time delivery telemetry.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mt-8 w-full sm:w-auto"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {isSignedIn ? (
              <>
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <GlassButton size="lg" variant="gradient" icon={ArrowRightIcon} className="w-full sm:w-auto">
                    Go to Dashboard
                  </GlassButton>
                </Link>
                <Link to="/campaigns/create" className="w-full sm:w-auto">
                  <GlassButton size="lg" variant="glass" className="w-full sm:w-auto">
                    Start Automation
                  </GlassButton>
                </Link>
              </>
            ) : (
              <>
                <Link to="/sign-up" className="w-full sm:w-auto">
                  <GlassButton size="lg" variant="gradient" icon={ArrowRightIcon} className="w-full sm:w-auto">
                    Get Started Free
                  </GlassButton>
                </Link>
                <Link to="/sign-in" className="w-full sm:w-auto">
                  <GlassButton size="lg" variant="glass" className="w-full sm:w-auto">
                    Sign In with Clerk
                  </GlassButton>
                </Link>
              </>
            )}
          </motion.div>

          {/* Quick Metrics Strip */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-4xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {[
              { label: 'Delivery Rate', val: '99.8%' },
              { label: 'PDF Generation', val: '<400ms' },
              { label: 'Zero Duplicates', val: 'Idempotent' },
              { label: 'Security Standard', val: 'OWASP Top 10' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center border-white/15">
                <div className="text-2xl font-bold text-white">{stat.val}</div>
                <div className="text-xs text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="space-y-12 scroll-mt-24">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#D10A8A]">
              Platform Modules
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Engineered for Modern Talent Teams
            </h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto">
              Everything you need to automate repetitive recruitment communications from first outreach to signed offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={idx}
                className="glass rounded-2xl p-6 border-white/15 hover:-translate-y-1 hover:border-white/30 transition-all duration-300 space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
              >
                <div className="size-12 rounded-xl glass bg-white/5 flex items-center justify-center text-white border-white/20 shadow-lg">
                  <feat.icon className="size-6" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feat.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Workflow Steps */}
        <section id="workflow" className="space-y-12 scroll-mt-24">
          <div className="text-center space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#2E08CF]">
              Streamlined Process
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              From Candidate List to Sent Letters in 4 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((w, idx) => (
              <div key={idx} className="glass rounded-2xl p-6 border-white/15 space-y-3 relative overflow-hidden">
                <div className="text-4xl font-extrabold text-white/10">{w.step}</div>
                <h4 className="text-base font-semibold text-white">{w.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="glass rounded-3xl p-8 md:p-14 border border-white/20 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 size-96 bg-[#D10A8A]/30 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Ready to automate your recruitment communications?
            </h2>
            <p className="text-gray-300 text-sm md:text-base">
              Say goodbye to manual document formatting and copy-pasting candidate emails.
            </p>
            <div className="pt-2">
              <Link to={isSignedIn ? "/dashboard" : "/sign-up"}>
                <GlassButton size="lg" variant="gradient" icon={ArrowRightIcon}>
                  {isSignedIn ? "Open Thodar Dashboard" : "Get Started with Thodar"}
                </GlassButton>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
