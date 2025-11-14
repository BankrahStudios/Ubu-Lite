import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';

// Code-split secondary pages to speed up initial load
const FAQ = lazy(() => import('./pages/FAQ'));
const Studio = lazy(() => import('./pages/Studio'));
const Book = lazy(() => import('./pages/Book'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const CreativesList = lazy(() => import('./pages/CreativesList'));
const CreativeProfile = lazy(() => import('./pages/CreativeProfile'));
const AppLogin = lazy(() => import('./pages/AppLogin'));
const AppRegister = lazy(() => import('./pages/AppRegister'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Escrows = lazy(() => import('./pages/Escrows'));
const Contact = lazy(() => import('./pages/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));

// Slimmed routes so the homepage can build cleanly without
// pulling in legacy pages/components while we iterate on UI.
const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div style={{padding:16}}>Loading…</div>}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/studio" component={Studio} />
          <Route exact path="/book" component={Book} />
          <Route exact path="/faq" component={FAQ} />
          <Route exact path="/terms" component={Terms} />
          <Route exact path="/privacy" component={Privacy} />
          <Route exact path="/creatives" component={CreativesList} />
          <Route path="/creatives/:id" component={CreativeProfile} />
          <Route exact path="/app-login" component={AppLogin} />
          <Route exact path="/app-register" component={AppRegister} />
          <Route exact path="/wallet" component={Wallet} />
          <Route exact path="/escrows" component={Escrows} />
          <Route exact path="/checkout" component={Checkout} />
          <Route exact path="/react-app/checkout" component={Checkout} />
          <Route exact path="/contact" component={Contact} />
          <Route path="/react-app" component={Home} />
        </Switch>
      </Suspense>
    </Router>
  );
};

export default App;
