import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OtpVerify from './pages/OtpVerify';
import PersonalDetails from './pages/PersonalDetails';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';

import Dashboard from './pages/Dashboard';
import FindDoctors from './pages/FindDoctors';
import DoctorDetails from './pages/DoctorDetails';
import BookAppointment from './pages/BookAppointment';
import Appointments from './pages/Appointments';
import AppointmentDetails from './pages/AppointmentDetails';
import ChatsList from './pages/ChatsList';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/verify" element={<OtpVerify />} />
        <Route path="/personal-details" element={<PersonalDetails />} />
      </Route>

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
        <Route path="/doctors" element={<FindDoctors />} />
        <Route path="/doctors/:id" element={<DoctorDetails />} />
        <Route path="/doctors/:id/book" element={<BookAppointment />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/appointments/:id" element={<AppointmentDetails />} />
        <Route path="/chats" element={<ChatsList />} />
        <Route path="/chats/:id" element={<Chat />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/password" element={<ChangePassword />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
