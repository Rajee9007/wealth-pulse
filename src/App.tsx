import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import PortfolioHealthPage from './pages/PortfolioHealthPage';
import PossibilityPage from './pages/PossibilityPage';
import TargetsPage from './pages/TargetsPage';
import PerformancePage from './pages/PerformancePage';
import BadgePage from './pages/BadgePage';
import ClientsPage from './pages/ClientsPage';
import CopilotPage from './pages/CopilotPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<DashboardPage />} />
        <Route path="/portfolio-health"  element={<PortfolioHealthPage />} />
        <Route path="/possibility"       element={<PossibilityPage />} />
        <Route path="/targets"           element={<TargetsPage />} />
        <Route path="/performance"       element={<PerformancePage />} />
        <Route path="/badge"             element={<BadgePage />} />
        <Route path="/clients"           element={<ClientsPage />} />
        <Route path="/copilot"           element={<CopilotPage />} />
      </Routes>
    </BrowserRouter>
  );
}
