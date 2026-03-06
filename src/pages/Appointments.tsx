import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Video, MapPin, ChevronRight } from 'lucide-react';
import api from '../services/api';

type Tab = 'upcoming' | 'completed' | 'cancelled';

interface Appointment {
  appointment_id: string;
  provider_name?: string;
  provider_specialty?: string;
  appointment_date?: string;
  appointment_time?: string;
  visit_type?: string;
  status?: string;
}

const STATUS_MAP: Record<Tab, string[]> = {
  upcoming: ['confirmed', 'pending', 'open'],
  completed: ['completed', 'closed'],
  cancelled: ['canceled', 'cancelled', 'no_show'],
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tab, setTab] = useState<Tab>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/appointments')
      .then((r) => api.parseResponse<{ data?: Appointment[] }>(r))
      .then((result) => setAppointments(Array.isArray(result.data) ? result.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = appointments.filter((a) => STATUS_MAP[tab].includes((a.status || '').toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <Link to="/doctors" className="text-sm bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition font-medium">
          Book New
        </Link>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
        {(['upcoming', 'completed', 'cancelled'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-sm font-medium rounded-md transition capitalize ${tab === t ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No {tab} appointments</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Link key={a.appointment_id} to={`/appointments/${a.appointment_id}`} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center shrink-0">
                {a.visit_type === 'online' ? <Video className="w-5 h-5 text-primary" /> : <MapPin className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{a.provider_name || 'Doctor'}</p>
                <p className="text-sm text-gray-500">{a.provider_specialty || 'General'}</p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">{a.appointment_date || '--'}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 justify-end">
                    <Clock className="w-3 h-3" /> {a.appointment_time || '--'}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
