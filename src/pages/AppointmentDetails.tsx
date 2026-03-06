import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Video, MapPin, MessageSquare, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function AppointmentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appt, setAppt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/appointments/${id}`)
      .then((r) => api.parseResponse<{ data?: any }>(r))
      .then((result) => setAppt(result.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.parseResponse(await api.patch(`/appointments/${id}/cancel`));
      toast.success('Appointment cancelled');
      navigate('/appointments');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to cancel');
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!appt) return <div className="text-center py-12"><p className="text-gray-500">Appointment not found</p></div>;

  const statusColors: Record<string, string> = { confirmed: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', completed: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700', canceled: 'bg-red-100 text-red-700' };
  const statusColor = statusColors[appt.status?.toLowerCase() || ''] || 'bg-gray-100 text-gray-700';

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Appointment Details</h1>
            <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${statusColor}`}>{appt.status || 'pending'}</span>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg">
              {(appt.provider_name || 'D')[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{appt.provider_name || 'Doctor'}</p>
              <p className="text-sm text-primary">{appt.provider_specialty || 'General'}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" /> {appt.appointment_date || '--'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" /> {appt.appointment_time || '--'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {appt.visit_type === 'online' ? <Video className="w-4 h-4 text-gray-400" /> : <MapPin className="w-4 h-4 text-gray-400" />}
              {appt.visit_type || 'online'}
            </div>
          </div>
        </div>

        {appt.health_concerns && (
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Health Concerns</h3>
            <p className="text-sm text-gray-600">{appt.health_concerns}</p>
          </div>
        )}

        <div className="p-6 flex flex-wrap gap-3">
          {appt.status === 'confirmed' && appt.visit_type === 'online' && (
            <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition">
              <Video className="w-4 h-4" /> Join Video Call
            </button>
          )}
          <Link to={`/chats`} className="flex items-center gap-2 bg-secondary-teal text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition">
            <MessageSquare className="w-4 h-4" /> Chat
          </Link>
          {['confirmed', 'pending'].includes(appt.status?.toLowerCase()) && (
            <button onClick={handleCancel} className="flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition ml-auto">
              <AlertCircle className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
