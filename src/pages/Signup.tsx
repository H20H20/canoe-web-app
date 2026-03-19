import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ChevronRight, Video, Wallet, CalendarDays, ShieldCheck, Stethoscope, Globe, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ─── Static data ─────────────────────────────────────── */

const COUNTRIES = [
  { flag: '🇺🇬', name: 'Uganda',   iso: 'UG', dial: '+256' },
  { flag: '🇰🇪', name: 'Kenya',    iso: 'KE', dial: '+254' },
];

const EXPERIENCE = ['< 1 yr', '1–3 yrs', '3–5 yrs', '5–10 yrs', '10+ yrs'];

function getRoleFromUrl(): 'provider' | 'client' {
  const role = new URLSearchParams(window.location.search).get('role')?.toLowerCase();
  return role === 'client' ? 'client' : 'provider';
}

const PROVIDER_STEPS = ['Your identity', 'Contact & location', 'Specialisation', 'Professional background', 'Security'];
const CLIENT_STEPS = ['Your identity', 'Contact & location', 'Security'];

/* ─── Panel content per step ─────────────────────────── */

const PROVIDER_PANELS = [
  {
    label: 'Step 1 of 5',
    headline: 'Welcome to\nCanoe Health',
    sub: 'Provider Registration',
    body: 'As a Canoe Health provider, you offer telemedicine to patients — consultations via video and voice calls, all through the app. Set your own schedule, work from anywhere, and get paid securely for every session.',
    items: [
      { Icon: Video,       text: 'Video & voice consultations' },
      { Icon: Wallet,      text: 'Instant, secure payments'    },
      { Icon: CalendarDays,text: 'Flexible scheduling'         },
    ],
    gradient: 'from-[#1B5E20] via-[#256829] to-[#2E7D32]',
  },
  {
    label: 'Step 2 of 5',
    headline: 'Reach patients\nacross East Africa',
    sub: 'Contact & Location',
    body: 'Tell us where you practice so we can connect you with nearby patients and ensure timely appointment notifications reach you.',
    items: [
      { flag: '🇺🇬', text: 'Uganda'   },
      { flag: '🇰🇪', text: 'Kenya'    },
      { flag: '🇹🇿', text: 'Tanzania' },
      { flag: '🇷🇼', text: 'Rwanda'   },
      { flag: '🇧🇮', text: 'Burundi'  },
      { flag: '🇸🇸', text: 'S. Sudan' },
    ] as { flag: string; text: string }[],
    gradient: 'from-[#1a6b2e] via-[#2a8038] to-[#3daa4a]',
    useFlags: true,
  },
  {
    label: 'Step 3 of 5',
    headline: 'Pick a specialty\nthat fits you',
    sub: 'Specialisation',
    body: 'Choose one or more categories and specialties so patients can find you.',
    items: [
      { Icon: Stethoscope,   text: 'Category + specialty selection' },
      { Icon: Globe,         text: 'Better patient matching' },
      { Icon: ShieldCheck,   text: 'Clear verification pathway' },
    ],
    gradient: 'from-[#155d25] via-[#1d7530] to-[#2E7D32]',
  },
  {
    label: 'Step 4 of 5',
    headline: 'Your credentials\nbuild patient trust',
    sub: 'Professional background',
    body: 'Patients feel safer consulting verified professionals. Your license, certification, and specialty help us match you with the right cases and build your reputation on the platform.',
    items: [
      { Icon: ShieldCheck,   text: 'License verification'     },
      { Icon: Stethoscope,   text: 'Specialty-matched patients'},
      { Icon: Globe,         text: 'Pan-Africa reach'          },
    ],
    gradient: 'from-[#155d25] via-[#1d7530] to-[#2E7D32]',
  },
  {
    label: 'Step 5 of 5',
    headline: "Almost there —\nwelcome aboard!",
    sub: 'Account security',
    body: "After registration, our team reviews your profile within 1–2 business days. Once approved, you're live and can start accepting patient bookings.",
    items: [
      { Icon: Lock, text: 'Submit registration'        },
      { Icon: ShieldCheck, text: 'Profile review (1–2 days)'  },
      { Icon: Video, text: 'Go live & start consulting' },
    ],
    gradient: 'from-[#1B5E20] via-[#256829] to-[#34913a]',
  },
];

const CLIENT_PANELS = [
  {
    label: 'Step 1 of 3',
    headline: 'Welcome to\nCanoe Health',
    sub: 'Patient Registration',
    body: 'Book appointments, chat with providers, and manage your health — all from one place.',
    items: [
      { Icon: CalendarDays, text: 'Easy appointment booking' },
      { Icon: Video,       text: 'Video, phone & chat consultations' },
      { Icon: ShieldCheck, text: 'Privacy-first care' },
    ],
    gradient: 'from-[#1B5E20] via-[#256829] to-[#2E7D32]',
  },
  {
    label: 'Step 2 of 3',
    headline: 'Stay connected\nwith your care',
    sub: 'Contact & Location',
    body: 'Add your phone number so you can receive verification codes and appointment updates.',
    items: [
      { flag: '🇺🇬', text: 'Uganda'   },
      { flag: '🇰🇪', text: 'Kenya'    },
      { flag: '🇹🇿', text: 'Tanzania' },
      { flag: '🇷🇼', text: 'Rwanda'   },
      { flag: '🇬🇭', text: 'Ghana'    },
      { flag: '🇳🇬', text: 'Nigeria'  },
    ] as { flag: string; text: string }[],
    gradient: 'from-[#1a6b2e] via-[#2a8038] to-[#3daa4a]',
    useFlags: true,
  },
  {
    label: 'Step 3 of 3',
    headline: 'Create your\nsecure account',
    sub: 'Security',
    body: 'Choose a strong password and accept the terms to finish registration.',
    items: [
      { Icon: Lock,       text: 'Secure sign-in' },
      { Icon: ShieldCheck,text: 'Protected data' },
      { Icon: Wallet,     text: 'Simple payments' },
    ],
    gradient: 'from-[#1B5E20] via-[#256829] to-[#34913a]',
  },
];

/* ─── Component ──────────────────────────────────────── */

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const role = getRoleFromUrl();
  const isProvider = role === 'provider';
  const STEPS = isProvider ? PROVIDER_STEPS : CLIENT_STEPS;
  const PANELS = isProvider ? PROVIDER_PANELS : CLIENT_PANELS;

  const [step, setStep]         = useState(0);
  const [panelKey, setPanelKey] = useState(0);
  const [formKey, setFormKey]   = useState(0);

  // Step 0
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');

  // Step 1
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [phone, setPhone]     = useState('');
  const [city, setCity]       = useState('');

  // Step 2 (provider only): category + specialisation
  const [categories, setCategories] = useState<{ id: number; category_name: string }[]>([]);
  const [specialisationsByCategoryId, setSpecialisationsByCategoryId] = useState<
    Record<number, { id: number; category_id: number; category_name: string; item_name: string }[]>
  >({});
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedSpecialisationIds, setSelectedSpecialisationIds] = useState<number[]>([]);
  const [specialisationSearch, setSpecialisationSearch] = useState('');

  // Step 3 (provider only): professional background
  const [experience, setExperience] = useState('');
  const [licensed, setLicensed]     = useState<'yes' | 'no' | ''>('');
  const [hasCert, setHasCert]       = useState<'yes' | 'no' | ''>('');

  // Step 4 (provider) / Step 2 (client): security
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [agreedTerms, setAgreedTerms]         = useState(false);
  const [agreedAccurate, setAgreedAccurate]   = useState(false);
  const [agreedVerify, setAgreedVerify]       = useState(false);
  const [loading, setLoading]                 = useState(false);

  const can0 = firstName.trim() && lastName.trim() && email.trim().includes('@');
  const can1 = phone.trim().length >= 6;
  const canSpec = !isProvider || selectedSpecialisationIds.length > 0;
  const canProfessional = !isProvider || (licensed !== '' && hasCert !== '');
  const canSecurity = password.length >= 8 && password === confirmPassword && agreedTerms && agreedAccurate && agreedVerify;

  const goStep = (s: number) => {
    setStep(s);
    setPanelKey(s);
    setFormKey((k) => k + 1);
  };

  const next = () => {
    if (step === 0 && !can0) { toast.error('Fill in your name and email'); return; }
    if (step === 1 && !can1) { toast.error('Enter your phone number'); return; }
    if (isProvider && step === 2 && !canSpec) { toast.error('Choose at least one speciality'); return; }
    if (isProvider && step === 3 && !canProfessional) { toast.error('Complete all professional fields'); return; }
    goStep(step + 1);
  };

  useEffect(() => {
    if (!isProvider) return;
    (async () => {
      try {
        const r = await api.get('/providers/specialisation-categories', { useAuth: false });
        const res = await api.parseResponse<any>(r);
        const list = res?.data?.categories ?? res?.data ?? [];
        const safeCategories = Array.isArray(list) ? list : [];
        setCategories(safeCategories);

        // Preload specialisations for ALL categories so when a user taps a category,
        // the checkboxes are already available (no extra wait).
        const preloadResults: Record<
          number,
          { id: number; category_id: number; category_name: string; item_name: string }[]
        > = {};

        await Promise.all(
          safeCategories.map(async (c: any) => {
            if (!c?.id) return;
            const sr = await api.get(`/providers/specialisations?category_id=${c.id}`, { useAuth: false });
            const sres = await api.parseResponse<any>(sr);
            const sList = sres?.data?.specialisations ?? sres?.data ?? [];
            preloadResults[c.id] = Array.isArray(sList) ? sList : [];
          })
        );

        setSpecialisationsByCategoryId(preloadResults);
      } catch (e) {
        // Non-blocking; user can still select categories and we will fall back to empty states.
        console.warn('Failed to load specialisation categories/specialisations', e);
      }
    })();
  }, [isProvider]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSecurity) {
      if (password.length < 8) toast.error('Password must be at least 8 characters');
      else if (password !== confirmPassword) toast.error('Passwords do not match');
      else toast.error('Please accept all statements to continue');
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: email.trim(),
        password,
        phone: `${country.dial}${phone.trim().replace(/\D/g, '')}`,
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        role,
        agreed_to_terms: agreedTerms,
        iso_code: country.iso,
        licensed: isProvider ? licensed === 'yes' : undefined,
        has_certificate: isProvider ? hasCert === 'yes' : undefined,
        specialisation_ids: isProvider ? selectedSpecialisationIds : undefined,
      });
      toast.success('Account created! Check your email or phone for the verification code.');
      navigate('/verify', { state: { phone: `${country.dial}${phone}` } });
    } catch (err: any) {
      toast.error(err?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const inp = 'w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition bg-white';
  const toggle = (active: boolean) =>
    `flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold transition cursor-pointer select-none text-center ${
      active ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'
    }`;

  const panel = PANELS[step];

  return (
    <div className="min-h-screen flex w-full">
      {/* ── LEFT: Form ────────────────────────────────── */}
   
      <div className={`hidden lg:flex lg:w-[44%] bg-gradient-to-br ${panel.gradient} flex-col justify-between p-10 relative overflow-hidden shrink-0`}
        style={{ transition: 'background 0.7s ease' }}>
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-12 w-72 h-72 rounded-full bg-white/8 pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-20 right-8 w-64 h-64 rounded-full bg-black/10 pointer-events-none" />

        {/* Logo */}
        <Link to="/" className="relative z-10">
          <img src="/logo.png" alt="Canoe Health" className="h-20 w-auto" />
        </Link>

        {/* Animated content */}
        <div key={panelKey} className="relative z-10 panel-in">
          <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">{panel.label}</p>
          <h2 className="text-[28px] font-bold text-white leading-[1.2] whitespace-pre-line">{panel.headline}</h2>
          <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-[280px]">{panel.body}</p>

          {/* Items — icons or flags */}
          <div className="mt-7 space-y-2.5">
            {'useFlags' in panel && panel.useFlags
              ? (
                <div className="grid grid-cols-3 gap-2">
                  {(panel.items as { flag: string; text: string }[]).map((item) => (
                    <div key={item.text} className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <span className="text-lg leading-none">{item.flag}</span>
                      <span className="text-xs text-white/80 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              )
              : (panel.items as { Icon: React.ComponentType<{ className?: string }>; text: string }[]).map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <item.Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-white/80 font-medium">{item.text}</span>
                </div>
              ))
            }
          </div>

          {/* Progress dots */}
          <div className="flex gap-1.5 mt-10">
            {STEPS.map((_, i) => (
              <div key={i}
                className={`rounded-full transition-all duration-500 ${i === step ? 'w-7 h-2 bg-white' : 'w-2 h-2 bg-white/30'}`} />
            ))}
          </div>
        </div>

        <p className="text-white/20 text-xs relative z-10">&copy; {new Date().getFullYear()} Canoe Health Ltd.</p>
      </div>
      
         <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md py-4">
          {/* Mobile logo */}
          <Link to="/" className="lg:hidden mb-5 inline-block">
            <img src="/logo.png" alt="Canoe Health" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              {isProvider ? 'Provider Registration' : 'Patient Registration'}
            </p>
            <span className="text-xs text-gray-400">{step + 1} / {STEPS.length}</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mt-1">{STEPS[step]}</h1>

          {/* Step bar */}
          <div className="flex gap-1.5 mt-4 mb-6">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>

          {/* ── Step 0: Identity ── */}
          {step === 0 && (
            <div key={`form-${formKey}`} className="form-step-in space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First" className={inp} autoFocus />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
              </div>

              <button onClick={next} disabled={!can0} className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm mt-2">
                Get started <ChevronRight className="w-4 h-4" />
              </button>
              <p className="text-center text-xs text-gray-500">
                Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </div>
          )}

          {/* ── Step 1: Contact ── */}
          {step === 1 && (
            <div key={`form-${formKey}`} className="form-step-in space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country of practice</label>
                <select
                  value={country.iso}
                  onChange={(e) => setCountry(COUNTRIES.find((c) => c.iso === e.target.value) ?? COUNTRIES[0])}
                  className={`${inp} cursor-pointer`}
                  autoFocus
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.iso} value={c.iso}>
                      {c.flag}  {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone number</label>
                <div className="flex gap-2">
                  <select
                    value={country.iso}
                    onChange={(e) => setCountry(COUNTRIES.find((c) => c.iso === e.target.value) ?? COUNTRIES[0])}
                    className="px-2 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none bg-white cursor-pointer shrink-0"
                    style={{ minWidth: 108 }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.iso} value={c.iso}>{c.flag} {c.dial}</option>
                    ))}
                  </select>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="700 000 000" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City / Town <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Kampala" className={inp} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => goStep(0)} className="w-24 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shrink-0">Back</button>
                <button onClick={next} disabled={!can1} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Specialisation (provider only) ── */}
          {isProvider && step === 2 && (
            <div key={`form-${formKey}`} className="form-step-in space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category + specialisations
                </label>

                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={specialisationSearch}
                      onChange={(e) => setSpecialisationSearch(e.target.value)}
                      placeholder="Search category or speciality"
                      className={inp}
                      autoFocus={false}
                    />
                  </div>

                  {(() => {
                    const q = specialisationSearch.trim().toLowerCase();
                    const cats = q
                      ? categories.filter((c) => {
                          const specs = specialisationsByCategoryId[c.id] ?? [];
                          const catMatch = c.category_name.toLowerCase().includes(q);
                          const specMatch = specs.some((s) => s.item_name.toLowerCase().includes(q));
                          return catMatch || specMatch;
                        })
                      : categories;

                    return (
                      <div className="space-y-3">
                        {cats.map((c) => {
                          const specs = specialisationsByCategoryId[c.id] ?? [];
                          const filteredSpecs = q
                            ? specs.filter((s) => s.item_name.toLowerCase().includes(q))
                            : specs;
                          const categoryChecked = selectedCategoryIds.includes(c.id);

                          return (
                            <div
                              key={c.id}
                              className={`rounded-xl border-2 transition ${
                                categoryChecked ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                              }`}
                            >
                              <div className="w-full px-3 py-2.5 flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={categoryChecked}
                                  onChange={() => {
                                    setSelectedCategoryIds((prev) =>
                                      prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                                    );
                                  }}
                                  className="h-4 w-4 accent-primary"
                                />
                                <span className="text-sm font-semibold text-gray-800">{c.category_name}</span>
                              </div>

                              <div className="px-3 pb-3">
                                {specs.length === 0 ? (
                                  <div className="text-sm text-gray-500 mt-1">Loading specialities…</div>
                                ) : filteredSpecs.length === 0 ? (
                                  <div className="text-sm text-gray-500 mt-1">No matching specialities</div>
                                ) : (
                                  <>
                                   <p className="mt-2 text-xs text-gray-500">
                                      Choose one or more specialities (multi-select).
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 gap-2">
                                      {filteredSpecs.map((s) => {
                                        const selected = selectedSpecialisationIds.includes(s.id);
                                        return (
                                          <button
                                            key={s.id}
                                            type="button"
                                            onClick={() => {
                                              setSelectedSpecialisationIds((prev) => {
                                                const isSelected = prev.includes(s.id);
                                                const next = isSelected
                                                  ? prev.filter((id) => id !== s.id)
                                                  : Array.from(new Set([...prev, s.id]));

                                                // Keep category checkbox in sync with selected specialisations.
                                                setSelectedCategoryIds((catPrev) => {
                                                  const anySelectedInCategory = (specs ?? []).some((sp) =>
                                                    next.includes(sp.id)
                                                  );

                                                  if (!anySelectedInCategory) {
                                                    return catPrev.filter((id) => id !== c.id);
                                                  }

                                                  // Category should be checked if at least one specialisation is selected.
                                                  return catPrev.includes(c.id) ? catPrev : [...catPrev, c.id];
                                                });

                                                return next;
                                              });
                                            }}
                                            className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold transition text-left ${
                                              selected
                                                ? 'border-primary bg-primary-light text-primary'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                            }`}
                                          >
                                            <span className="inline-flex items-center gap-2">
                                              <span
                                                className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                                                  selected ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
                                                }`}
                                              >
                                                {selected ? '✓' : ''}
                                              </span>
                                              <span>{s.item_name}</span>
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                   
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => goStep(1)} className="w-24 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shrink-0">Back</button>
                  <button onClick={next} disabled={!canSpec} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Professional background (provider only) ── */}
          {isProvider && step === 3 && (
            <div key={`form-${formKey}`} className="form-step-in space-y-3.5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Years of experience</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {EXPERIENCE.map((opt) => (
                    <button key={opt} type="button" onClick={() => setExperience(opt)}
                      className={`py-2 rounded-xl border-2 text-xs font-semibold transition ${experience === opt ? 'border-primary bg-primary-light text-primary' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Licensed to practice?</label>
                <div className="flex gap-2">
                  <button onClick={() => setLicensed('yes')} className={toggle(licensed === 'yes')}>✓ Yes</button>
                  <button onClick={() => setLicensed('no')}  className={toggle(licensed === 'no')}>✗ No</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional certificate?</label>
                <div className="flex gap-2">
                  <button onClick={() => setHasCert('yes')} className={toggle(hasCert === 'yes')}>✓ Yes</button>
                  <button onClick={() => setHasCert('no')}  className={toggle(hasCert === 'no')}>✗ No</button>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={() => goStep(2)} className="w-24 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shrink-0">Back</button>
                <button onClick={next} disabled={!canProfessional} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-40 flex items-center justify-center gap-1.5 text-sm">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Security + Terms (provider: step 3, client: step 2) ── */}
          {((isProvider && step === 4) || (!isProvider && step === 2)) && (
            <form key={`form-${formKey}`} onSubmit={handleSubmit} className="form-step-in space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password <span className="text-gray-400 font-normal">(min 8 chars)</span>
                </label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create password" minLength={8} className={`${inp} pr-12`} autoFocus />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className={inp} />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5">Passwords do not match</p>
                )}
              </div>

              {/* Detailed terms block */}
              <div className="border-2 border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Before you submit</p>
                {[
                  {
                    id: 'terms',
                    checked: agreedTerms,
                    set: setAgreedTerms,
                    label: (
                      <>
                        I have read and agree to the{' '}
                        <Link to="/terms" className="text-primary font-semibold hover:underline" target="_blank">Terms of Service</Link>
                        {' '}and{' '}
                        <Link to="/privacy" className="text-primary font-semibold hover:underline" target="_blank">Privacy Policy</Link>
                      </>
                    ),
                  },
                  {
                    id: 'accurate',
                    checked: agreedAccurate,
                    set: setAgreedAccurate,
                    label: 'I confirm that all information I have provided is accurate and complete',
                  },
                  {
                    id: 'verify',
                    checked: agreedVerify,
                    set: setAgreedVerify,
                    label: 'I understand my account is subject to verification before I can start accepting patients',
                  },
                ].map((item) => (
                  <label key={item.id} className="flex items-start gap-3 cursor-pointer">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${item.checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'}`}
                      onClick={() => item.set(!item.checked)}>
                      {item.checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
                    </div>
                    <span className="text-xs text-gray-600 leading-relaxed">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goStep(isProvider ? 3 : 1)}
                  className="w-24 py-2.5 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition shrink-0"
                >
                  Back
                </button>
                <button type="submit" disabled={loading || !canSecurity} className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-xl transition disabled:opacity-40 text-sm">
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    : 'Create my account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ── RIGHT: Animated info panel ─────────────────── */}
     
    </div>
  );
}
