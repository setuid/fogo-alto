import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import { AuthProvider, useAuth } from '@/lib/auth';
import { Toaster } from '@/components/ui/sonner';

import { AuthPage } from '@/pages/Auth';
import { Dashboard } from '@/pages/Dashboard';
import { NewBarbecue } from '@/pages/NewBarbecue';
import { BarbecueDetail } from '@/pages/BarbecueDetail';
import { BarbecueEdit } from '@/pages/BarbecueEdit';
import { CookingMode } from '@/pages/CookingMode';
import { GuestView } from '@/pages/GuestView';

// HashRouter para GitHub Pages: links de convite ficam tipo
// `/#/g/<token>` e funcionam sem 404.html redirect.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute() {
  const { user, loading, configured } = useAuth();
  if (!configured) return <AuthPage />;
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Convite público — não exige auth. */}
            <Route path="/g/:share_token" element={<GuestView />} />
            <Route path="/auth" element={<AuthPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/new" element={<NewBarbecue />} />
              <Route path="/barbecue/:id" element={<BarbecueDetail />} />
              <Route path="/barbecue/:id/edit" element={<BarbecueEdit />} />
              <Route path="/barbecue/:id/cook" element={<CookingMode />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
