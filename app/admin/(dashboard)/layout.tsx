import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 print:block">
      <AdminSidebar />
      <main className="flex-1 overflow-auto print:w-full print:overflow-visible">{children}</main>
    </div>
  );
}
