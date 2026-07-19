import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';

import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import ResumePage       from './pages/ResumePage';
import ResumeDetailPage from './pages/ResumeDetailPage';
import InterviewPage    from './pages/InterviewPage';
import CodingPage from './pages/CodingPage';
import RoadmapPage      from './pages/RoadmapPage';
import ProtectedRoute   from './components/layout/ProtectedRoute';

function AppRoutes() {
  const { fetchMe, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/resume"    element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
      <Route path="/resume/:id" element={<ProtectedRoute><ResumeDetailPage /></ProtectedRoute>} />
      <Route path="/interview" element={<ProtectedRoute><InterviewPage /></ProtectedRoute>} />
      <Route path="/coding" element={<ProtectedRoute><CodingPage /></ProtectedRoute>} />
      <Route path="/roadmap"   element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <AppRoutes />
    </BrowserRouter>
  );
}
