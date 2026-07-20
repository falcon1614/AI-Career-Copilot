import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

interface Problem {
  id: string; title: string; slug: string;
  difficulty: string; category: string; tags: string[];
}

interface TestResult {
  testCase: number; passed: boolean; input: string;
  expectedOutput: string; actualOutput: string;
  executionTime: number; error: string | null;
}

export default function CodingPage() {
  const [problems, setProblems]       = useState<Problem[]>([]);
  const [selected, setSelected]       = useState<any>(null);
  const [language, setLanguage]       = useState('python');
  const [code, setCode]               = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [result, setResult]           = useState<any>(null);
  const [openTest, setOpenTest]       = useState<number | null>(null);

  useEffect(() => { fetchProblems(); }, []);

  async function fetchProblems() {
    try {
      const { data } = await api.get('/api/coding/problems');
      setProblems(data.data);
    } catch { toast.error('Failed to load problems'); }
  }

  async function selectProblem(id: string) {
    try {
      const { data } = await api.get(`/api/coding/problems/${id}`);
      setSelected(data.data);
      setCode(data.data.starterCode[language] || '');
      setResult(null);
    } catch { toast.error('Failed to load problem'); }
  }

  function handleLanguageChange(lang: string) {
    setLanguage(lang);
    if (selected) setCode(selected.starterCode[lang] || '');
  }

  async function submitCode() {
    if (!code.trim()) { toast.error('Write some code first'); return; }
    setSubmitting(true);
    setResult(null);
    try {
      const { data } = await api.post('/api/coding/submit', {
        problemId: selected.id, language, code,
      });
      setResult(data.data);
      if (data.data.status === 'accepted') toast.success('🎉 All test cases passed!');
      else toast.error(`${data.data.passedTests}/${data.data.totalTests} tests passed`);
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(false); }
  }

  const diffColor = (d: string) =>
    d === 'hard' ? 'text-red-600 bg-red-50' :
    d === 'medium' ? 'text-yellow-600 bg-yellow-50' : 'text-green-600 bg-green-50';

  // Problem list view
  if (!selected) return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Coding Practice</h1>
        <span className="text-sm text-gray-400">{problems.length} problems</span>
      </nav>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase px-5 py-3 border-b border-gray-50">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Title</span>
            <span className="col-span-2">Difficulty</span>
            <span className="col-span-2">Category</span>
            <span className="col-span-2">Tags</span>
          </div>
          {problems.map((p, i) => (
            <button key={p.id} onClick={() => selectProblem(p.id)}
              className="w-full grid grid-cols-12 items-center px-5 py-4 hover:bg-gray-50 border-b border-gray-50 text-left transition-colors">
              <span className="col-span-1 text-gray-400 text-sm">{i + 1}</span>
              <span className="col-span-5 font-medium text-gray-900 text-sm">{p.title}</span>
              <span className="col-span-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${diffColor(p.difficulty)}`}>
                  {p.difficulty}
                </span>
              </span>
              <span className="col-span-2 text-gray-500 text-xs">{p.category}</span>
              <span className="col-span-2 text-gray-400 text-xs">{p.tags.slice(0,2).join(', ')}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Problem solver view
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => { setSelected(null); setResult(null); }}
            className="text-gray-400 hover:text-white"><ArrowLeft size={20} /></button>
          <span className="font-semibold">{selected.title}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${diffColor(selected.difficulty)}`}>
            {selected.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <select value={language} onChange={e => handleLanguageChange(e.target.value)}
            className="bg-gray-700 text-gray-200 px-3 py-1.5 rounded text-sm border border-gray-600 focus:outline-none">
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="cpp">C++</option>
          </select>
          <button onClick={submitCode} disabled={submitting}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded font-medium text-sm transition-colors">
            <Play size={14} />
            {submitting ? 'Running...' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — problem description */}
        <div className="w-2/5 border-r border-gray-700 overflow-y-auto p-5 space-y-5">
          <div>
            <h2 className="text-lg font-bold mb-3">{selected.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.description}</p>
          </div>

          {selected.examples?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">Examples</h3>
              {selected.examples.map((ex: any, i: number) => (
                <div key={i} className="bg-gray-800 rounded-lg p-3 mb-2 text-sm">
                  <p className="text-gray-400 mb-1"><span className="text-gray-200 font-medium">Input:</span> {ex.input}</p>
                  <p className="text-gray-400 mb-1"><span className="text-gray-200 font-medium">Output:</span> {ex.output}</p>
                  {ex.explanation && <p className="text-gray-400"><span className="text-gray-200 font-medium">Explanation:</span> {ex.explanation}</p>}
                </div>
              ))}
            </div>
          )}

          {selected.constraints?.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-200 mb-2">Constraints</h3>
              <ul className="space-y-1">
                {selected.constraints.map((c: string, i: number) => (
                  <li key={i} className="text-gray-400 text-sm">• {c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Test results */}
          {result && (
            <div>
              <div className={`rounded-lg p-4 mb-3 ${result.status === 'accepted' ? 'bg-green-900/40 border border-green-700' : 'bg-red-900/40 border border-red-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {result.status === 'accepted'
                    ? <CheckCircle size={18} className="text-green-400" />
                    : <XCircle size={18} className="text-red-400" />}
                  <span className="font-semibold">{result.message}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-400 mt-2">
                  <span className="flex items-center gap-1"><Clock size={12} /> {result.executionTime}ms</span>
                  <span>{result.passedTests}/{result.totalTests} tests</span>
                </div>
              </div>

              {result.testResults?.map((t: TestResult) => (
                <div key={t.testCase} className="border border-gray-700 rounded-lg mb-2 overflow-hidden">
                  <button onClick={() => setOpenTest(openTest === t.testCase ? null : t.testCase)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800">
                    <div className="flex items-center gap-2">
                      {t.passed
                        ? <CheckCircle size={14} className="text-green-400" />
                        : <XCircle size={14} className="text-red-400" />}
                      <span className="text-sm">Test Case {t.testCase}</span>
                    </div>
                    <span className="text-xs text-gray-500">{t.executionTime}ms</span>
                  </button>
                  {openTest === t.testCase && (
                    <div className="px-3 pb-3 space-y-2 bg-gray-800/50 text-xs">
                      {t.input !== '[hidden]' && (
                        <div><span className="text-gray-400">Input:</span> <code className="text-gray-200 ml-1">{t.input}</code></div>
                      )}
                      {t.expectedOutput !== '[hidden]' && (
                        <div><span className="text-gray-400">Expected:</span> <code className="text-green-400 ml-1">{t.expectedOutput}</code></div>
                      )}
                      <div><span className="text-gray-400">Got:</span> <code className={`ml-1 ${t.passed ? 'text-green-400' : 'text-red-400'}`}>{t.actualOutput}</code></div>
                      {t.error && <div><span className="text-red-400">Error:</span> <code className="text-red-300 ml-1">{t.error}</code></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel — code editor */}
        <div className="flex-1 flex flex-col">
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            className="flex-1 bg-gray-900 text-gray-100 p-4 font-mono text-sm resize-none focus:outline-none border-none"
            placeholder="Write your solution here..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
