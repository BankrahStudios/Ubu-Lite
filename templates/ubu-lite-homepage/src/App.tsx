import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import FAQ from './pages/FAQ';
import Studio from './pages/Studio';
import Book from './pages/Book';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import CreativesList from './pages/CreativesList';
import CreativeProfile from './pages/CreativeProfile';
import AppLogin from './pages/AppLogin';
import AppRegister from './pages/AppRegister';
import Wallet from './pages/Wallet';
import Escrows from './pages/Escrows';
import Contact from './pages/Contact';

// Slimmed routes so the homepage can build cleanly without
// pulling in legacy pages/components while we iterate on UI.
const App: React.FC = () => {
  return (
    <Router>
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
        <Route exact path="/contact" component={Contact} />
        <Route path="/react-app" component={Home} />
      </Switch>
    </Router>
  );
};

export default App;
