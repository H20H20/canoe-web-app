import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <main className="flex-1 flex">
        <Outlet />
      </main>
    </div>
  );
}
