import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

// User Pages
import UserHome from './pages/user/UserHome';
import UserStatus from './pages/user/UserStatus';
import UserMessages from './pages/user/UserMessages';
import UserSettings from './pages/user/UserSettings';
import UserEmergency from './pages/user/UserEmergency';
import UserRisk from './pages/user/UserRisk';
import UserMap from './pages/user/UserMap';
import UserDevice from './pages/user/UserDevice';
import UserActions from './pages/user/UserActions';

// Guardian Pages
import GuardianHome from './pages/guardian/GuardianHome';
import GuardianAlerts from './pages/guardian/GuardianAlerts';
import GuardianMessages from './pages/guardian/GuardianMessages';
import GuardianMap from './pages/guardian/GuardianMap';
import GuardianSettings from './pages/guardian/GuardianSettings';

import FloatingChatbot from './components/FloatingChatbot';

// Strict Root Gateway: Requires login to access the website
const RootGateway = () => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null;
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={currentUser.role === 'guardian' ? '/guardian' : '/user'} replace />;
};

// Authenticated Route Guard
const ProtectedRoute = ({ children, role }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'guardian' ? '/guardian' : '/user'} replace />;
  }
  
  return children;
};

// Public Auth Pages (Redirect to home if already logged in)
const PublicAuthRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (currentUser) {
    return <Navigate to={currentUser.role === 'guardian' ? '/guardian' : '/user'} replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-text font-sans selection:bg-purple-500/30 selection:text-white">
          <Routes>
            {/* Root: Website Access Only After Login */}
            <Route path="/" element={<RootGateway />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
            <Route path="/signup" element={<PublicAuthRoute><Signup /></PublicAuthRoute>} />
            <Route path="/about" element={<Landing />} />

            {/* User Routes (Strictly Protected) */}
            <Route path="/user" element={<ProtectedRoute role="user"><UserHome /></ProtectedRoute>} />
            <Route path="/user/emergency" element={<ProtectedRoute role="user"><UserEmergency /></ProtectedRoute>} />
            <Route path="/user/risk" element={<ProtectedRoute role="user"><UserRisk /></ProtectedRoute>} />
            <Route path="/user/map" element={<ProtectedRoute role="user"><UserMap /></ProtectedRoute>} />
            <Route path="/user/device" element={<ProtectedRoute role="user"><UserDevice /></ProtectedRoute>} />
            <Route path="/user/actions" element={<ProtectedRoute role="user"><UserActions /></ProtectedRoute>} />
            <Route path="/user/status" element={<ProtectedRoute role="user"><UserStatus /></ProtectedRoute>} />
            <Route path="/user/messages" element={<ProtectedRoute role="user"><UserMessages /></ProtectedRoute>} />
            <Route path="/user/settings" element={<ProtectedRoute role="user"><UserSettings /></ProtectedRoute>} />

            {/* Guardian Routes (Strictly Protected) */}
            <Route path="/guardian" element={<ProtectedRoute role="guardian"><GuardianHome /></ProtectedRoute>} />
            <Route path="/guardian/alerts" element={<ProtectedRoute role="guardian"><GuardianAlerts /></ProtectedRoute>} />
            <Route path="/guardian/messages" element={<ProtectedRoute role="guardian"><GuardianMessages /></ProtectedRoute>} />
            <Route path="/guardian/map" element={<ProtectedRoute role="guardian"><GuardianMap /></ProtectedRoute>} />
            <Route path="/guardian/settings" element={<ProtectedRoute role="guardian"><GuardianSettings /></ProtectedRoute>} />

            {/* Catch-all fallback */}
            <Route path="*" element={<RootGateway />} />
          </Routes>

          {/* 3D Floating Holographic Chatbot Assistant */}
          <FloatingChatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
