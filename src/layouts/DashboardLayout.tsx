import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Calendar, MessageSquare, User, LogOut, Menu, X, Settings, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/chats', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const profilePic = api.getProfilePicUrl(user?.profile_pic);

  return (
    <div className="min-h-screen bg-surface flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-56 bg-primary-dark text-white flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-4 py-4 flex items-center justify-between">
          <img src="/web_logo.jpeg" alt="Canoe Health" className="h-7 w-auto" />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-0.5 mt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-white/15 text-white' : 'text-white/55 hover:bg-white/8 hover:text-white/80'}`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 pb-4">
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-white/45 hover:bg-white/8 hover:text-white/70 w-full transition-colors">
            <LogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-100 px-4 lg:px-5 h-13 flex items-center justify-between sticky top-0 z-30">
          <button className="lg:hidden p-1" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div />
          <NavLink to="/profile" className="flex items-center gap-2 hover:opacity-80">
            {profilePic ? (
              <img src={profilePic} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-semibold">
                {user?.first_name?.[0] || 'U'}
              </div>
            )}
            <span className="hidden sm:block text-sm font-medium text-gray-600">
              {user?.first_name || 'User'}
            </span>
          </NavLink>
        </header>

        <main className="flex-1 p-4 lg:p-5 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
