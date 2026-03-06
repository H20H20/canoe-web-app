import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (!agreed) { toast.error('Accept the terms to continue'); return; }
    setLoading(true);
    try {
      await signup({ email: form.email, password: form.password, phone: form.phone });
      toast.success('Account created');
      navigate('/verify', { state: { phone: form.phone } });
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Create account</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Join Canoe Health</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+256 700 000 000" required className={inputCls} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required className={inputCls} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Create password" required className={`${inputCls} pr-10`} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Confirm password</label>
          <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="Confirm password" required className={inputCls} />
        </div>

        <label className="flex items-start gap-2 text-[12px] text-gray-400 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-primary" />
          <span>I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></span>
        </label>

        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition text-[13px] disabled:opacity-50">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Sign Up'}
        </button>
      </form>

      <p className="text-center text-[12px] text-gray-400 mt-5">
        Have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
