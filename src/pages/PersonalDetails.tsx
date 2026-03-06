import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function PersonalDetails() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [form, setForm] = useState({ first_name: '', last_name: '', date_of_birth: '', gender: '', country: '', address: '' });
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });
  const inputCls = "w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.first_name || !form.last_name) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const res = await api.patch('/auth/update-profile', form);
      await api.parseResponse(res);
      localStorage.setItem('profile_complete', 'true');
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-gray-900">Complete profile</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">Tell us about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">First name</label>
            <input type="text" value={form.first_name} onChange={set('first_name')} required className={inputCls} />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1">Last name</label>
            <input type="text" value={form.last_name} onChange={set('last_name')} required className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Date of birth</label>
          <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} className={inputCls} />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Gender</label>
          <select value={form.gender} onChange={set('gender')} className={`${inputCls} bg-white`}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-[12px] font-medium text-gray-500 mb-1">Country</label>
          <input type="text" value={form.country} onChange={set('country')} placeholder="Uganda" className={inputCls} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded-lg transition text-[13px] disabled:opacity-50">
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
