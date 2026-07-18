import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

function ScoreBar({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700 font-medium">{label}</span>
        <span className="text-gray-500">{score}/{max}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentResume, fetchResume } = useResumeStore();

  useEffect(() => { if (id) fetchResume(id); }, [id]);

  if (!currentResume) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  const ats = currentResume.ats_details || {};
  const breakdown = ats.breakdown || {};
  const score = ats.score || currentResume.ats_score || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/resume" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">{currentResume.file_name}</h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Score Hero */}
        <div className={`rounded-2xl p-8 text-white text-center
          ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}>
          <div className="text-6xl font-bold mb-2">{score}</div>
          <div className="text-xl opacity-90">ATS Score / 100</div>
          <div className="text-sm opacity-75 mt-2">
            {score >= 80 ? '🎉 Excellent — ready to apply!' :
             score >= 60 ? '👍 Good — a few improvements needed' :
             '⚠️ Needs work — follow the suggestions below'}
          </div>
        </div>

        {/* Score Breakdown */}
        {Object.keys(breakdown).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-5">Score Breakdown</h2>
            {Object.entries(breakdown).map(([key, val]: [string, any]) => (
              <div key={key}>
                <ScoreBar
                  label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  score={val.score}
                  max={val.max}
                />
                <p className="text-xs text-gray-400 mb-4 -mt-2">{val.feedback}</p>
              </div>
            ))}
          </div>
        )}

        {/* Suggestions */}
        {ats.suggestions?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Improvement Suggestions</h2>
            <div className="space-y-3">
              {ats.suggestions.map((s: string, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <AlertCircle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-gray-700 text-sm">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Keywords */}
        {ats.missingKeywords?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Missing Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {ats.missingKeywords.map((k: string) => (
                <span key={k} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm border border-red-100">
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
