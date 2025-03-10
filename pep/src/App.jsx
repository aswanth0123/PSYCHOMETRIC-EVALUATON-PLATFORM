import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AuthForm from './Authform';
import TestDetails from './TestDetails';  // Import the TestDetails component
import Quiz from './Quiz/Components/Quiz/Quiz';
import DMT from './Quiz/Components/Quiz/DMT';
import LR from './Quiz/Components/Quiz/LR';
import NR from './Quiz/Components/Quiz/NR';
import SJ from './Quiz/Components/Quiz/SJ';
import VR from './Quiz/Components/Quiz/VR';
import Appointment from './AppointmentForm/components/AppointmentForm'; // Appointment page component
import Dashboard from "./CandidateDashboard/Components/Dashboard";
import Login from "./Login";
import LandingPage from './LandingPage';
import P_Dashboard from './Psycologist/Components/Dashboard';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard/Components/Admin';
import AddQuestion from './AdminDashboard/Components/AddQuestion';
function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dmt" element={<DMT />} />
          <Route path="/lr" element={<LR />} />
          <Route path="/nr" element={<NR />} />
          <Route path="/sj" element={<SJ />} />
          <Route path="/vr" element={<VR />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/test/:testId" element={<TestDetails />} />
          <Route path="/psychologist" element={<P_Dashboard />} />
          <Route path="/admin" element={<AdminLogin/>}/>
          <Route path='/AdminDashboard' element={<AdminDashboard/>}/>
          <Route path="/addquestion" element={<AddQuestion />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
