import { Outlet, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="p-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-primary-dark font-semibold text-[15px]">
          <Heart className="w-5 h-5 fill-primary text-primary" />
          Canoe Health
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>
      <footer className="p-4 text-center text-[11px] text-gray-400">
        <div className="flex items-center justify-center gap-4">
          <Link to="/terms" className="hover:text-primary">Terms</Link>
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <Link to="/contact" className="hover:text-primary">Contact</Link>
        </div>
        <p className="mt-1.5">&copy; {new Date().getFullYear()} Canoe Health Ltd.</p>
      </footer>
    </div>
  );
}
