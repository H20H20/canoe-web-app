import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Stethoscope, MessageSquare, Ambulance, FlaskConical, Pill, Clock, Video, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const QUICK_ACTIONS = [
  { icon: Stethoscope, label: 'Doctors', to: '/doctors', color: 'bg-primary-light text-primary' },
  { icon: Calendar, label: 'Appointments', to: '/appointments', color: 'bg-blue-50 text-blue-600' },
  { icon: MessageSquare, label: 'Messages', to: '/chats', color: 'bg-teal-50 text-teal-600' },
  { icon: Ambulance, label: 'Emergency', to: '#', color: 'bg-red-50 text-red-500' },
  { icon: FlaskConical, label: 'Lab Tests', to: '#', color: 'bg-purple-50 text-purple-500' },
  { icon: Pill, label: 'Pharmacy', to: '#', color: 'bg-orange-50 text-orange-500' },
];

interface Appointment {
  appointment_id: string;
  provider_name?: string;
  provider_specialty?: string;
  appointment_date?: string;
  appointment_time?: string;
  visit_type?: string;
  status?: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then((r) => api.parseResponse<{ data?: Appointment[] }>(r))
      .then((result) => {
        const list = Array.isArray(result.data) ? result.data : [];
        setAppointments(list.filter((a) => a.status === 'confirmed' || a.status === 'pending').slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-primary-dark to-primary rounded-xl p-5 text-white">
        <p className="text-[13px] text-white/60">{greeting()}</p>
        <h1 className="text-lg font-bold mt-0.5">{user?.first_name || 'there'}</h1>
        <Link to="/doctors" className="inline-flex items-center gap-1.5 mt-3 bg-white text-primary-dark font-medium px-4 py-1.5 rounded-md text-[12px] hover:bg-white/90 transition">
          Book consultation <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium mb-3">Quick actions</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.label} to={a.to} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-white border border-gray-100 hover:shadow-sm transition">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.color}`}>
                <a.icon className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-gray-600">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">Upcoming</p>
          <Link to="/appointments" className="text-[12px] text-primary font-medium hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
            <Calendar className="w-8 h-8 text-gray-200 mx-auto mb-1.5" />
            <p className="text-[13px] text-gray-400">No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-2">
            {appointments.map((a) => (
              <Link key={a.appointment_id} to={`/appointments/${a.appointment_id}`} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 p-3 hover:shadow-sm transition">
                <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                  {a.visit_type === 'online' ? <Video className="w-4 h-4 text-primary" /> : <Calendar className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-gray-800 truncate">{a.provider_name || 'Doctor'}</p>
                  <p className="text-[11px] text-gray-400">{a.provider_specialty || 'General'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-medium text-gray-600">{a.appointment_date || '--'}</p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-0.5 justify-end"><Clock className="w-3 h-3" /> {a.appointment_time || '--'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
