import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Investments from './pages/Investments';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuth } from './context/AuthContext';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/app" /> : <Landing />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/investments" element={<Investments />} />
                  <Route path="*" element={<Navigate to="/app" />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
          {/* Compatibility for old direct paths */}
          <Route path="/dashboard" element={<Navigate to="/app" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
