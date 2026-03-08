import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import YarnTestForm from './components/YarnTestForm';
import AdminPanel from './components/AdminPanel';
import YarnTestList from './components/YarnTestList';
import Login from './components/Login';
import Register from './components/Register';
import Production from './components/Production';
import ProductionForm from './components/ProductionForm';
import ProductionView from './components/ProductionView';
import ProductionAdminPanel from './components/ProductionAdminPanel';
import DailyProductionReport from './components/DailyProductionReport';
import CountWiseSummaryReport from './components/CountWiseSummaryReport';

function ModuleNavbar() {
  const location = useLocation();
  const isProductionRoute = location.pathname.startsWith('/production');
  const isYarnQualityRoute = !isProductionRoute && location.pathname !== '/login' && location.pathname !== '/register';

  return (
    <nav className="module-navbar">
      <div className="container">
        <div className="module-navbar-content">
          <Link
            to="/"
            className={`module-nav-link ${isYarnQualityRoute ? 'active' : ''}`}
          >
            <span className="module-nav-icon">🧵</span>
            Yarn Quality
          </Link>
          <Link
            to="/production"
            className={`module-nav-link ${isProductionRoute ? 'active' : ''}`}
          >
            <span className="module-nav-icon">📊</span>
            Production
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Navigation() {
  const location = useLocation();

  return (
    <nav className="app-nav">
      {/* Yarn / Quality module links */}
      <Link
        to="/login"
        className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}
      >
        Login
      </Link>
      <Link
        to="/"
        className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
      >
        Data Entry
      </Link>
      <Link
        to="/tests"
        className={location.pathname === '/tests' ? 'nav-link active' : 'nav-link'}
      >
        View Tests
      </Link>
      <Link
        to="/admin"
        className={location.pathname === '/admin' ? 'nav-link active' : 'nav-link'}
      >
        Admin Panel
      </Link>
    </nav>
  );
}

function AppShell() {
  const location = useLocation();
  const isProductionRoute = location.pathname.startsWith('/production');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className={isProductionRoute ? 'App App--production' : 'App'}>
      {!isAuthRoute && <ModuleNavbar />}
      <header className={isProductionRoute ? 'app-header app-header--production' : 'app-header'}>
        <div className="container">
          {isProductionRoute ? (
            <>
              <h1>Production Management</h1>
              <p className="subtitle">PT Triputra Textile Industry - Production Module</p>
            </>
          ) : (
            <>
              <h1>Yarn Quality ERP System</h1>
              <p className="subtitle">PT Triputra Textile Industry - Spinning Division</p>
              <Navigation />
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<YarnTestForm />} />
            <Route path="/tests" element={<YarnTestList />} />
            <Route path="/production" element={<Production />} />
            <Route path="/production/new" element={<ProductionForm />} />
            <Route path="/production/view/:id" element={<ProductionView />} />
            <Route path="/production/edit/:id" element={<ProductionForm />} />
            <Route path="/production/report" element={<DailyProductionReport />} />
            <Route path="/production/count-wise-summary" element={<CountWiseSummaryReport />} />
            <Route path="/production/admin" element={<ProductionAdminPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}

export default App;

