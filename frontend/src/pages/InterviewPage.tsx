import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface Question {
  id: string; question_text: string; question_type: string;
  difficulty: string; topic: string; hint: string;
  user_answer: string | null; ai_feedback: string | null; score: number | null;
}

interface Session { question_type: string;
  id: string; job_role: string; status: string; score: number | null;
  total_questions: number; answered_questions: number; created_at: string;
}

export default function InterviewPage() {
  const [view, setView]           = useState<'list'|'create'|'session'>('list');
  const [sessions, setSessions]   = useState<Session[]>([]);
  const [current, setCurrent]     = useState<any>(null);
  const [answers, setAnswers]     = useState<Record<string, string>>({});
  const [openIdx, setOpenIdx]     = useState<number>(0);
  const [loading, setLoading]     = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const [jobRole, setJobRole]     = useState('');
  const [qType, setQType]         = useState('mixed');
  const [count, setCount]         = useState(5);
  const [resumeText, setResumeText] = useState('');

  useEffect(() => { fetchSessions(); }, []);

  async function fetchSessions() {
    try {
      const { data } = await api.get('/api/interviews');
      setSessions(data.data);
    } catch { toast.error('Failed to load sessions'); }
  }

  async function createSession() {
    if (!jobRole) { toast.error('Enter a job role'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/api/interviews', {
        jobRole, questionType: qType, count, resumeText,
      });
      setCurrent(data.data);
      setAnswers({});
      setOpenIdx(0);
      setView('session');
      toast.success(`${data.data.questions.length} questions ready!`);
    } catch { toast.error('Failed to create session'); }
    finally { setLoading(false); }
  }

  async function submitAnswer(questionId: string) {
    const answer = answers[questionId];
    if (!answer?.trim()) { toast.error('Write an answer first'); return; }
    setSubmitting(questionId);
    try {
      const { data } = await api.post(`/api/interviews/${current.session.id}/answer`, {
        questionId, answer,
      });
      // Update question in local state
      setCurrent((prev: any) => ({
        ...prev,
        questions: prev.questions.map((q: Question) =>
          q.id === questionId
            ? { ...q, user_answer: answer, ai_feedback: data.data.feedback, score: data.data.score }
            : q
        ),
        session: { ...prev.session, answered_questions: prev.session.answered_questions + 1 },
      }));
      toast.success(`Score: ${data.data.score}/100`);
      // Auto-advance to next question
      const idx = current.questions.findIndex((q: Question) => q.id === questionId);
      if (idx < current.questions.length - 1) setOpenIdx(idx + 1);
    } catch { toast.error('Failed to submit answer'); }
    finally { setSubmitting(null); }
  }

  async function completeSession() {
    try {
      const { data } = await api.put(`/api/interviews/${current.session.id}/complete`);
      toast.success(`Session complete! Final score: ${data.data.finalScore}/100`);
      fetchSessions();
      setView('list');
    } catch { toast.error('Failed to complete session'); }
  }

  const diffColor = (d: string) =>
    d === 'hard' ? 'bg-red-100 text-red-700' :
    d === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';

  const typeColor = (t: string) =>
    t === 'technical' ? 'bg-blue-100 text-blue-700' :
    t === 'behavioral' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700';

  // LIST VIEW
  if (view === 'list') return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Mock Interviews</h1>
        </div>
        <button onClick={() => setView('create')}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700">
          + New Session
        </button>
      </nav>
      <div className="max-w-3xl mx-auto p-6">
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-4">No interview sessions yet</p>
            <button onClick={() => setView('create')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700">
              Start Your First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.id} className="bg-white rounded-xl border border-gray-100 p-5 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-900">{s.job_role}</p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {s.question_type} • {s.answered_questions}/{s.total_questions} answered •{' '}
                    {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {s.score && <span className="text-2xl font-bold text-purple-600">{s.score}</span>}
                  <span className={`px-2 py-1 rounded text-xs font-medium
                    ${s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // CREATE VIEW
  if (view === 'create') return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
        <h1 className="text-xl font-bold text-gray-900">New Interview Session</h1>
      </nav>
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Role *</label>
            <input value={jobRole} onChange={e => setJobRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g. Backend Software Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select value={qType} onChange={e => setQType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="mixed">Mixed</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
              <select value={count} onChange={e => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500">
                {[5,8,10,15].map(n => <option key={n} value={n}>{n} questions</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resume Text (optional — improves question relevance)</label>
            <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={4}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="Paste your resume text here for personalized questions..." />
          </div>
          <button onClick={createSession} disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Generating questions...</> : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );

  // SESSION VIEW
  if (!current) return null;
  const { session, questions } = current;
  const progress = Math.round((session.answered_questions / session.total_questions) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{session.job_role}</h1>
              <p className="text-sm text-gray-500">{session.answered_questions}/{session.total_questions} answered</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-gray-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-sm text-gray-500">{progress}%</span>
            {session.answered_questions > 0 && (
              <button onClick={completeSession}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                Complete
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-3">
        {questions.map((q: Question, i: number) => (
          <div key={q.id} className={`bg-white rounded-xl border overflow-hidden
            ${q.user_answer ? 'border-green-200' : 'border-gray-100'}`}>
            <button onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              className="w-full text-left p-4 flex items-start justify-between gap-3">
              <div className="flex gap-2 items-start flex-1">
                <span className="text-gray-400 text-sm font-medium mt-0.5 shrink-0">Q{i+1}</span>
                <div className="flex-1">
                  <div className="flex gap-2 mb-1 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColor(q.question_type)}`}>{q.question_type}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${diffColor(q.difficulty)}`}>{q.difficulty}</span>
                    {q.topic && <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">{q.topic}</span>}
                  </div>
                  <p className="font-medium text-gray-900 text-sm">{q.question_text}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {q.user_answer && <CheckCircle size={18} className="text-green-500" />}
                {openIdx === i ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
              </div>
            </button>

            {openIdx === i && (
              <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                {q.hint && (
                  <p className="text-xs text-gray-500 bg-blue-50 rounded-lg p-3">
                    <span className="font-medium text-blue-700">Hint:</span> {q.hint}
                  </p>
                )}

                {q.user_answer ? (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-1">Your Answer</p>
                      <p className="text-sm text-gray-700">{q.user_answer}</p>
                    </div>
                    <div className={`rounded-lg p-3 ${q.score && q.score >= 70 ? 'bg-green-50' : 'bg-amber-50'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-medium text-gray-500">Feedback</p>
                        <span className={`text-sm font-bold ${q.score && q.score >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                          {q.score}/100
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{q.ai_feedback}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      rows={4} placeholder="Type your answer here..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                    />
                    <button onClick={() => submitAnswer(q.id)}
                      disabled={submitting === q.id || !answers[q.id]?.trim()}
                      className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
                      {submitting === q.id ? <><Loader size={14} className="animate-spin" /> Evaluating...</> : 'Submit Answer'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
