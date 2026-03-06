import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-dark via-primary to-[#34913a]">
      {/* Nav */}
      <nav className="px-5 sm:px-8 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-1.5 text-white font-semibold text-[15px] tracking-tight">
          <Heart className="w-5 h-5 fill-white" />
          Canoe Health
        </Link>
        <Link to="/signup" className="text-xs font-medium bg-white text-primary-dark px-4 py-1.5 rounded-md hover:bg-white/90 transition">
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-8">
        <div className="max-w-5xl mx-auto w-full flex flex-col lg:flex-row items-center gap-10 lg:gap-16 py-12 lg:py-0">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50 font-medium mb-3">Digital Healthcare Platform</p>
            <h1 className="text-[28px] sm:text-[34px] lg:text-[40px] font-bold text-white leading-[1.15] tracking-tight">
              Healthcare,<br />accessible anywhere.
            </h1>
            <p className="mt-3 text-[13px] text-white/60 leading-relaxed max-w-sm mx-auto lg:mx-0">
              Book appointments, consult doctors, and manage your health — all from your phone.
            </p>
            <div className="mt-5 flex items-center gap-3 justify-center lg:justify-start">
              <Link to="/signup" className="inline-flex items-center gap-1.5 bg-white text-primary-dark font-semibold px-5 py-2 rounded-md text-[13px] hover:bg-white/90 transition">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-white/40 font-medium">In development</span>
            </div>
          </div>

          {/* Phone */}
          <div className="flex-shrink-0">
            <div className="relative w-[240px] sm:w-[260px] aspect-[9/19.2] bg-black rounded-[2.4rem] p-[6px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-[18px] bg-black rounded-b-xl z-10" />
              <div className="w-full h-full rounded-[2rem] overflow-hidden">
                <img src="/HomeIndividual.png" alt="Canoe Health" className="w-full h-full object-cover object-top" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-5 sm:px-8 py-4 max-w-6xl mx-auto w-full flex items-center justify-between text-[11px] text-white/30">
        <span>&copy; {new Date().getFullYear()} Canoe Health Ltd.</span>
        <div className="flex gap-4">
          <Link to="/terms" className="hover:text-white/60">Terms</Link>
          <Link to="/privacy" className="hover:text-white/60">Privacy</Link>
          <Link to="/contact" className="hover:text-white/60">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
