import { Suspense, type ReactNode } from "react";
import AdminNavigationProgress from "@/components/admin/AdminNavigationProgress";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-bg min-h-screen">
      <Suspense fallback={null}>
        <AdminNavigationProgress />
      </Suspense>
      {children}
    </div>
  );
}
