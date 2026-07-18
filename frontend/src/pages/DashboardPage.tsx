import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useResumeStore } from '../store/resumeStore';
import { FileText, Mic, Map, LogOut, Upload, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { resumes, fetchResumes } = useResumeStore();

  useEffect(() => { fetchResumes(); }, []);

  const bestScore = resumes.length ? Math.max(...resumes.map(r => r.ats_score || 0)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">AI Career Copilot</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">Hi, {user?.fullName?.split(' ')[0] || 'User'}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1 text-gray-500 hover:text-red-500 text-sm transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Resumes Uploaded</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{resumes.length}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Best ATS Score</p>
            <p className={`text-3xl font-bold mt-1 ${bestScore >= 80 ? 'text-green-600' : bestScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
              {bestScore > 0 ? `${bestScore}/100` : '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm">Account</p>
            <p className="text-sm font-medium text-gray-900 mt-1 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link to="/resume" className="bg-blue-600 text-white rounded-xl p-6 hover:bg-blue-700 transition-colors">
            <FileText size={28} className="mb-3" />
            <h3 className="font-semibold text-lg">Resume Analyzer</h3>
            <p className="text-blue-100 text-sm mt-1">Upload & get ATS score + AI feedback</p>
          </Link>
          <Link to="/interview" className="bg-purple-600 text-white rounded-xl p-6 hover:bg-purple-700 transition-colors">
            <Mic size={28} className="mb-3" />
            <h3 className="font-semibold text-lg">Mock Interview</h3>
            <p className="text-purple-100 text-sm mt-1">AI-generated interview questions</p>
          </Link>
          <Link to="/roadmap" className="bg-green-600 text-white rounded-xl p-6 hover:bg-green-700 transition-colors">
            <Map size={28} className="mb-3" />
            <h3 className="font-semibold text-lg">Learning Roadmap</h3>
            <p className="text-green-100 text-sm mt-1">Personalized study plan</p>
          </Link>
        </div>

        {/* Recent Resumes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Resumes</h2>
            <Link to="/resume" className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline">
              <Upload size={14} /> Upload New
            </Link>
          </div>
          {resumes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={40} className="mx-auto mb-3 opacity-40" />
              <p>No resumes yet. Upload your first one!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {resumes.map((r) => (
                <Link key={r.id} to={`/resume/${r.id}`}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{r.file_name}</p>
                      <p className="text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-gray-400" />
                    <span className={`font-bold text-sm ${r.ats_score >= 80 ? 'text-green-600' : r.ats_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {r.ats_score}/100
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
