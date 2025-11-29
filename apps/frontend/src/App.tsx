import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/Home';
import Patients from './pages/dashboard/patients/Patients';
import RegisterPatient from './pages/dashboard/patients/RegisterPatient';
import RecordVitals from './pages/dashboard/patients/RecordVitals';
import Consultations from './pages/dashboard/consultations/Consultations';
import NewConsultation from './pages/dashboard/consultations/NewConsultation';
import Pharmacy from './pages/dashboard/pharmacy/Pharmacy';
import AddMedicine from './pages/dashboard/pharmacy/AddMedicine';
import StaffList from './pages/dashboard/staff/StaffList';
import AddStaff from './pages/dashboard/staff/AddStaff';

import Reports from './pages/dashboard/reports/Reports';

import Settings from './pages/dashboard/settings/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/new" element={<RegisterPatient />} />
          <Route path="patients/:patientId/vitals" element={<RecordVitals />} />
          <Route path="consultations" element={<Consultations />} />
          <Route path="consultations/new" element={<NewConsultation />} />
          <Route path="pharmacy" element={<Pharmacy />} />
          <Route path="pharmacy/new" element={<AddMedicine />} />
          <Route path="staff" element={<StaffList />} />
          <Route path="staff/new" element={<AddStaff />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
