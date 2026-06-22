import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch } from 'wouter';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CurtainTransition } from '@/components/CurtainTransition';
import { Toaster } from '@/components/ui/toaster';

import Home from '@/pages/Home';
import Calendar from '@/pages/Calendar';
import TheaterPlotka from '@/pages/TheaterPlotka';
import PlayDetails from '@/pages/PlayDetails';
import Account from '@/pages/Account';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});

const Recommendations = () => (
  <div className="min-h-screen flex flex-col bg-stone-50">
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="gold-frame p-8 max-w-md mx-auto">
        <h1 className="text-3xl font-serif font-bold text-primary mb-4">
          Moje Rekomendacje
        </h1>
        <p className="text-stone-600 font-serif italic">
          Funkcja dostępna wkrótce
        </p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CurtainTransition>
          <div className="min-h-screen flex flex-col bg-stone-50">
            <Header />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/calendar" component={Calendar} />
                <Route path="/plotka" component={TheaterPlotka} />
                <Route path="/recommendations" component={Recommendations} />
                <Route path="/play/:id" component={PlayDetails} />
                <Route path="/account" component={Account} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        </CurtainTransition>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
