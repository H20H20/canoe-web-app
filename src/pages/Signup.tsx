import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, ShieldCheck, Calendar, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const COUNTRIES = [
  { flag: '🇺🇬', name: 'Uganda',   iso: 'UG', dial: '+256' },
  { flag: '🇰🇪', name: 'Kenya',    iso: 'KE', dial: '+254' },
  { flag: '🇹🇿', name: 'Tanzania', iso: 'TZ', dial: '+255' },
  { flag: '🇷🇼', name: 'Rwanda',   iso: 'RW', dial: '+250' },
  { flag: '🇧🇮', name: 'Burundi',  iso: 'BI', dial: '+257' },
  { flag: '🇸🇸', name: 'S. Sudan', iso: 'SS', dial: '+211' },
];

const STEPS = ['Contact & country', 'Professional details', 'Name & password'];

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licensed, setLicensed] = useState<'yes' | 'no' | ''>('');
  const [hasCert, setHasCert] = useState<'yes' | 'no' | ''>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const can0 = phone.trim().length >= 6 && email.trim().length > 3;
  const can1 = licensed !== '' && hasCert !== '';
  const can2 = firstName.trim() && lastName.trim() && password.length >= 8 && password === confirmPassword && agreed;

  const next = () => {
    if (step === 0 && !can0) { toast.error('Enter phone and email'); return; }
    if (step === 1 && !can1) { toast.error('Answer both questions'); return; }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!can2) {
      if (password.length < 8) toast.error('Password must be at least 8 characters');
      else if (password !== confirmPassword) toast.error('Passwords do not match');
      else toast.error('Accept the terms to continue');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        phone: `${country.dial}${phone.trim().replace(/\D/g, '')}`,
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        role: 'provider',
        agreed_to_terms: agreed,
        iso_code: country.iso,
        licensed: licensed === 'yes',
        has_certificate: hasCert === 'yes',
      });
      toast.success('Account created! Check your email or phone for the verification code.');
      navigate('/verify', { state: { phone: `${country.dial}${phone}` } });
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition bg-white';
  const yesNo = (active: boolean) =>
    `flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition cursor-pointer select-none ${
      active ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
    }`;

  return (
    <div className="min-h-screen flex w-full overflow-hidden">
      {/* ── Left branding panel ─────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-primary-dark via-[#256829] to-primary flex-col justify-between p-10 relative overflow-hidden shrink-0">
        {/* decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />

        <Link to="/" className="relative z-10">
          <img src="/web_logo.jpeg" alt="Canoe Health" className="h-10 w-auto" />
        </Link>

        <div className="relative z-10">
          <h2 className="text-[28px] font-bold text-white leading-tight">
            Join the future<br />of healthcare.
          </h2>
          <p className="text-white/65 text-sm mt-3 leading-relaxed max-w-xs">
            Register as a provider and start offering digital consultations to patients across East Africa.
          </p>
          <div className="mt-8 space-y-3">
            {[
              [ShieldCheck, 'Verified & secure platform'],
              [Calendar,   'Flexible scheduling'],
              [Users,      'Growing patient network'],
            ].map(([Icon, text]) => (
              <div key={text as string} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  {/* @ts-ignore */}
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/80 text-sm">{text as string}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/25 text-xs relative z-10">&copy; {new Date().getFullYear()} Canoe Health Ltd.</p>
      </div>

      {/* ── Right form panel ────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden mb-5 inline-block">
            <img src="/web_logo.jpeg" alt="Canoe Health" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900">Provider registration</h1>
            <span className="text-xs text-gray-400 font-medium">{step + 1} / 3</span>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            {step === 0 && 'Contact details & country'}
            {step === 1 && 'Professional background'}
            {step === 2 && 'Name & set your password'}
          </p>

          {/* Step bar */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>

          {/* ── STEP 0: Contact ── */}
          {step === 0 && (
            <div className="space-y-3.5">
              {/* Phone with dial code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <select
                    value={country.iso}
                    onChange={(e) => setCountry(COUNTRIES.find((c) => c.iso === e.target.value) ?? COUNTRIES[0])}
                    className="px-2 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition bg-white cursor-pointer shrink-0"
                    style={{ minWidth: 100 }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.iso} value={c.iso}>
                        {c.flag} {c.dial}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="700 000 000"
                    className={input}
                  />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={input} />
              </div>
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country of practice</label>
                <select
                  value={country.iso}
                  onChange={(e) => setCountry(COUNTRIES.find((c) => c.iso === e.target.value) ?? COUNTRIES[0])}
                  className={`${input} cursor-pointer`}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.iso}>{c.flag}  {c.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={next} disabled={!can0} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm mt-1">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-500 mt-1">
                Have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── STEP 1: Professional ── */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Are you currently licensed to practice?</label>
                <div className="flex gap-2">
                  <button onClick={() => setLicensed('yes')} className={yesNo(licensed === 'yes')}>✓ Yes</button>
                  <button onClick={() => setLicensed('no')}  className={yesNo(licensed === 'no')}>✗ No</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Do you hold a professional certificate?</label>
                <div className="flex gap-2">
                  <button onClick={() => setHasCert('yes')} className={yesNo(hasCert === 'yes')}>✓ Yes</button>
                  <button onClick={() => setHasCert('no')}  className={yesNo(hasCert === 'no')}>✗ No</button>
                </div>
              </div>

              {/* Summary chips of step 0 */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-xs bg-primary-light text-primary px-3 py-1 rounded-full font-medium">{country.flag} {country.name}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium truncate max-w-[180px]">{email}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <button onClick={() => setStep(0)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Back
                </button>
                <button onClick={next} disabled={!can1} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Name + Password ── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" className={input} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" className={input} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password <span className="text-gray-400 font-normal">(min 8 chars)</span></label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" minLength={8} className={`${input} pr-14`} />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className={input} />
              </div>
              <label className="flex items-start gap-2.5 cursor-pointer text-sm text-gray-600 pt-1">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 rounded border-2 border-gray-300 accent-primary" />
                <span>I agree to the <Link to="/terms" className="text-primary font-medium hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary font-medium hover:underline">Privacy Policy</Link></span>
              </label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                  Back
                </button>
                <button type="submit" disabled={loading || !can2} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 text-sm">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Create account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
