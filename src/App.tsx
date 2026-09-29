import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SubjectsPage from '@/pages/SubjectsPage';
import SchedulePage from '@/pages/SchedulePage';
import DashboardPage from '@/pages/DashboardPage';
import SettingsPage from '@/pages/SettingsPage';
import { useStore } from '@/hooks/useStore';

function App() {
  const store = useStore();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage store={store} />} />
          <Route path="/subjects" element={<SubjectsPage store={store} />} />
          <Route path="/schedule" element={<SchedulePage store={store} />} />
          <Route path="/dashboard" element={<DashboardPage store={store} />} />
          <Route path="/settings" element={<SettingsPage store={store} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
