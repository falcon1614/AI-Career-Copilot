import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

export default function InterviewPage() {
  const [jobRole, setJobRole]     = useState('');
  const [type, setType]           = useState('mixed');
  const [resumeText, setResumeText] = useState('');
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading]     = useState(false);
  const [openIdx, setOpenIdx]     = useState<number | null>(null);

  async function generate() {
    if (!jobRole || !resumeText) { toast.error('Fill in job role and paste your resume text'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/genai/interview/questions', {
        resumeText, jobRole, questionType: type, count: 10,
      });
      setQuestions(data.data.questions || []);
      toast.success(`${data.data.questions?.length} questions generated!`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Generation failed — check Gemini quota');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Mock Interview</h1>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Role</label>
            <input value={jobRole} onChange={e => setJobRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Backend Software Engineer" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="mixed">Mixed (Technical + Behavioral + HR)</option>
              <option value="technical">Technical Only</option>
              <option value="behavioral">Behavioral Only</option>
              <option value="hr">HR Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Paste Your Resume Text</label>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={5}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Paste your resume text here..." />
          </div>
          <button onClick={generate} disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {loading ? <><Loader size={18} className="animate-spin" /> Generating...</> : 'Generate Interview Questions'}
          </button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-bold text-gray-900 text-lg">{questions.length} Questions Generated</h2>
            {questions.map((q, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full text-left p-4 flex justify-between items-start gap-3">
                  <div className="flex gap-3">
                    <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium
                      ${q.type === 'technical' ? 'bg-blue-100 text-blue-700' :
                        q.type === 'behavioral' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'}`}>
                      {q.type}
                    </span>
                    <span className="font-medium text-gray-900 text-sm">{q.question}</span>
                  </div>
                  <span className="text-gray-400 text-lg">{openIdx === i ? '−' : '+'}</span>
                </button>
                {openIdx === i && (
                  <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
                    <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Hint:</span> {q.hint}</p>
                    {q.followUp && <p className="text-sm text-gray-500"><span className="font-medium text-gray-700">Follow-up:</span> {q.followUp}</p>}
                    <span className={`inline-block px-2 py-0.5 rounded text-xs
                      ${q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                        q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'}`}>
                      {q.difficulty}
                    </span>
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
