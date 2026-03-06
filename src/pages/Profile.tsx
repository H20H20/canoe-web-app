import { Link, useNavigate } from 'react-router-dom';
import { Edit, Settings, Shield, FileText, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const MENU_ITEMS = [
  { to: '/profile/edit', icon: Edit, label: 'Edit Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/privacy', icon: Shield, label: 'Privacy Policy' },
  { to: '/terms', icon: FileText, label: 'Terms of Service' },
  { to: '/contact', icon: HelpCircle, label: 'Help & Support' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pic = api.getProfilePicUrl(user?.profile_pic);
  const name = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4">
          {pic ? (
            <img src={pic} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-light text-primary flex items-center justify-center text-3xl font-bold">
              {name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {user?.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {MENU_ITEMS.map((item) => (
          <Link key={item.to} to={item.to} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 transition">
            <item.icon className="w-5 h-5 text-gray-400" />
            <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-3 px-5 py-4 hover:bg-red-50 transition w-full">
          <LogOut className="w-5 h-5 text-red-500" />
          <span className="flex-1 text-sm font-medium text-red-600 text-left">Logout</span>
        </button>
      </div>
    </div>
  );
}
