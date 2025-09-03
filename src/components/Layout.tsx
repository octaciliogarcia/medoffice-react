import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';

export default function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
      <Toaster richColors />
    </div>
  );
}
