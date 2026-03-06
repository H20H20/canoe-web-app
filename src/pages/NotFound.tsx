import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-2">Page not found</p>
        <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark transition">
          <Home className="w-5 h-5" /> Go Home
        </Link>
      </div>
    </div>
  );
}
