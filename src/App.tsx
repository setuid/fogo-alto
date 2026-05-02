import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';

// HashRouter para GitHub Pages: links de convite ficam tipo
// `/#/g/<token>` e funcionam sem 404.html redirect.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}
