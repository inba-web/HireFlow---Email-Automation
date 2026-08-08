import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { SparklesIcon, ArrowLeftIcon } from 'lucide-react';
import { GlassButton } from '../components/ui/GlassButton';

export function AuthPage({ mode = 'sign-in' }) {
  const isPublishableKeySet = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY && !import.meta.env.VITE_CLERK_PUBLISHABLE_KEY.includes('placeholder'));

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glow orbs */}
      <div className="fixed inset-0 overflow-hidden -z-20 pointer-events-none">
        <div className="absolute rounded-full top-1/4 left-1/3 -translate-x-1/2 size-120 bg-[#D10A8A]/30 blur-[130px]" />
        <div className="absolute rounded-full bottom-1/4 right-1/3 -translate-x-1/2 size-120 bg-[#2E08CF]/30 blur-[130px]" />
      </div>

      <div className="mb-6 flex flex-col items-center gap-2">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="size-10 rounded-xl glass bg-gradient-to-tr from-[#D10A8A] to-[#2E08CF] flex items-center justify-center shadow-lg group-hover:scale-105 transition duration-300">
            <SparklesIcon className="size-5 text-white" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">HireFlow</span>
        </Link>
        <p className="text-xs text-gray-400">Recruitment Email & Document Automation Platform</p>
      </div>

      <div className="w-full max-w-md glass p-6 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-2xl">
        {isPublishableKeySet ? (
          mode === 'sign-in' ? (
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none p-0',
                  headerTitle: 'text-white font-bold',
                  headerSubtitle: 'text-gray-400',
                  formButtonPrimary: 'bg-white text-black hover:bg-gray-200 font-medium rounded-full',
                  formFieldInput: 'glass bg-white/5 border border-white/20 text-white rounded-xl',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                }
              }}
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              signInUrl="/sign-in"
              forceRedirectUrl="/dashboard"
              appearance={{
                elements: {
                  card: 'bg-transparent shadow-none p-0',
                  headerTitle: 'text-white font-bold',
                  headerSubtitle: 'text-gray-400',
                  formButtonPrimary: 'bg-white text-black hover:bg-gray-200 font-medium rounded-full',
                  formFieldInput: 'glass bg-white/5 border border-white/20 text-white rounded-xl',
                  footerActionLink: 'text-indigo-400 hover:text-indigo-300',
                }
              }}
            />
          )
        ) : (
          <div className="space-y-5 text-center py-4">
            <div className="size-12 rounded-2xl glass mx-auto flex items-center justify-center text-amber-400 border border-amber-400/30">
              <SparklesIcon className="size-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Clerk Identity Configured</h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Add your <code className="text-indigo-300">VITE_CLERK_PUBLISHABLE_KEY</code> in <code className="text-gray-200">client/.env</code> to activate live cloud authentication.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/dashboard">
                <GlassButton variant="gradient" className="w-full">
                  Enter Dashboard (Dev Workspace)
                </GlassButton>
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition">
          <ArrowLeftIcon className="size-3.5" /> Back to Landing Page
        </Link>
      </div>
    </div>
  );
}
