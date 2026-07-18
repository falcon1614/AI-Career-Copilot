import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState('');
  const [weeks, setWeeks]           = useState(8);
  const [resumeText, setResumeText] = useState('');
  const [roadmap, setRoadmap]       = useState<any>(null);
  const [loading, setLoading]       = useState(false);
  const [openWeek, setOpenWeek]     = useState<number>(0);

  async function generate() {
    if (!targetRole || !resumeText) { toast.error('Fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/genai/interview/roadmap', {
        resumeText, targetRole, timelineWeeks: weeks,
      });
      setRoadmap(data.data);
      toast.success('Roadmap generated!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Generation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Learning Roadmap</h1>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <input value={targetRole} onChange={e => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Senior Backend Engineer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeline (weeks)</label>
              <select value={weeks} onChange={e => setWeeks(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500">
                {[4,6,8,12,16].map(w => <option key={w} value={w}>{w} weeks</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste Your Resume Text</label>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Paste your resume text here..." />
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Generating...</> : 'Generate My Roadmap'}
          </button>
        </div>

        {roadmap && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-xl text-gray-900">{roadmap.targetRole}</h2>
              <p className="text-gray-500 text-sm mt-1">{roadmap.gapAnalysis}</p>
              <div className="flex gap-4 mt-4">
                <div className="bg-green-50 rounded-lg p-3 text-center flex-1">
                  <div className="text-2xl font-bold text-green-600">{roadmap.readinessScore}%</div>
                  <div className="text-xs text-gray-500">Readiness</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-center flex-1">
                  <div className="text-2xl font-bold text-blue-600">{roadmap.totalHours}h</div>
                  <div className="text-xs text-gray-500">Total Hours</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center flex-1">
                  <div className="text-2xl font-bold text-purple-600">{roadmap.currentLevel}</div>
                  <div className="text-xs text-gray-500">Current Level</div>
                </div>
              </div>
            </div>

            {roadmap.weeks?.map((w: any, i: number) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenWeek(openWeek === i ? -1 : i)}
                  className="w-full text-left p-4 flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-gray-900">{w.weekRange}: {w.theme}</span>
                    <p className="text-sm text-gray-500 mt-0.5">{w.milestone}</p>
                  </div>
                  {openWeek === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                {openWeek === i && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {w.topics?.map((t: string) => (
                          <span key={t} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{t}</span>
                        ))}
                      </div>
                    </div>
                    {w.resources?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Resources</p>
                        {w.resources.map((r: any, j: number) => (
                          <p key={j} className="text-sm text-gray-600">• {r.title} ({r.type}, {r.hours}h)</p>
                        ))}
                      </div>
                    )}
                    {w.projects?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Build This Week</p>
                        {w.projects.map((p: string, j: number) => (
                          <p key={j} className="text-sm text-gray-600">🔨 {p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
