import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader, TrendingUp, Building2, DollarSign, Target } from 'lucide-react';
import api from '../api/client';
import toast from 'react-hot-toast';

type Tab = 'job-match' | 'skill-gap' | 'salary' | 'companies';

export default function MLPage() {
  const [tab, setTab]             = useState<Tab>('job-match');
  const [resumeText, setResume]   = useState('');
  const [jobDesc, setJobDesc]     = useState('');
  const [targetRole, setRole]     = useState('backend engineer');
  const [location, setLocation]   = useState('bangalore');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<any>(null);

  async function run() {
    if (!resumeText.trim()) { toast.error('Paste your resume text first'); return; }
    setLoading(true); setResult(null);
    try {
      let data;
      if (tab === 'job-match') {
        if (!jobDesc.trim()) { toast.error('Paste job description'); setLoading(false); return; }
        const r = await api.post('/api/ml/job-match', { resumeText, jobDescription: jobDesc, targetRole });
        data = r.data.data;
      } else if (tab === 'skill-gap') {
        const r = await api.post('/api/ml/skill-gap', { resumeText, targetRole });
        data = r.data.data;
      } else if (tab === 'salary') {
        const r = await api.post('/api/ml/salary-predict', { resumeText, targetRole, location });
        data = r.data.data;
      } else {
        const r = await api.post('/api/ml/companies', { resumeText, targetRole, topN: 10 });
        data = r.data.data;
      }
      setResult(data);
      toast.success('Analysis complete!');
    } catch { toast.error('Analysis failed'); }
    finally { setLoading(false); }
  }

  const tabs = [
    { id: 'job-match', label: 'Job Match', icon: Target },
    { id: 'skill-gap', label: 'Skill Gap', icon: TrendingUp },
    { id: 'salary', label: 'Salary', icon: DollarSign },
    { id: 'companies', label: 'Companies', icon: Building2 },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">ML Career Insights</h1>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-5">
        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-xl p-1 border border-gray-100">
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Input Panel */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <select value={targetRole} onChange={e => setRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="backend engineer">Backend Engineer</option>
                <option value="frontend engineer">Frontend Engineer</option>
                <option value="full stack engineer">Full Stack Engineer</option>
                <option value="data scientist">Data Scientist</option>
                <option value="ml engineer">ML Engineer</option>
                <option value="devops engineer">DevOps Engineer</option>
                <option value="software engineer">Software Engineer</option>
              </select>
            </div>
            {tab === 'salary' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select value={location} onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {['bangalore','mumbai','hyderabad','pune','delhi','chennai','remote','usa','uk','singapore'].map(l => (
                    <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Resume Text *</label>
            <textarea value={resumeText} onChange={e => setResume(e.target.value)} rows={5}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Paste your resume text here..." />
          </div>

          {tab === 'job-match' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={4}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Paste the job description here..." />
            </div>
          )}

          <button onClick={run} disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Analyzing...</> : 'Analyze'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Job Match Result */}
            {tab === 'job-match' && (
              <>
                <div className={`rounded-2xl p-6 text-white text-center
                  ${result.matchScore >= 80 ? 'bg-green-600' : result.matchScore >= 60 ? 'bg-yellow-500' : result.matchScore >= 40 ? 'bg-orange-500' : 'bg-red-500'}`}>
                  <div className="text-5xl font-bold mb-2">{result.matchScore}%</div>
                  <div className="text-lg opacity-90">Job Match Score</div>
                  <div className="text-sm opacity-75 mt-1">{result.verdict}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-green-700 mb-3">✓ Matched Skills ({result.matchedSkills?.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-red-700 mb-3">✗ Missing from JD ({result.missingFromJD?.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingFromJD?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Skill Gap Result */}
            {tab === 'skill-gap' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Overall Readiness', value: `${result.overallReadiness}%`, color: result.overallReadiness >= 70 ? 'text-green-600' : 'text-orange-600' },
                    { label: 'Core Skills', value: `${result.coreCompletion}%`, color: 'text-blue-600' },
                    { label: 'Advanced Skills', value: `${result.advancedCompletion}%`, color: 'text-purple-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5 text-center">
                      <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                      <div className="text-sm text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-gray-700 font-medium mb-3">{result.verdict}</p>
                  <p className="text-sm text-gray-500">Estimated time to job-ready: <span className="font-semibold text-gray-700">{result.estimatedWeeksToReady} weeks</span></p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-red-700 mb-3">Missing Core Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingCore?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-orange-700 mb-3">Missing Advanced Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.missingAdvanced?.slice(0,6).map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-orange-50 text-orange-700 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {result.learningRoadmap?.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Learning Roadmap</h3>
                    <div className="space-y-3">
                      {result.learningRoadmap.map((item: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium shrink-0
                            ${item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              item.priority === 'important' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-600'}`}>
                            {item.priority}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.skill}</p>
                            <p className="text-xs text-gray-500">{item.estimatedWeeks} weeks • {item.resources[0]?.platform}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Salary Result */}
            {tab === 'salary' && (
              <>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                  <div className="text-center mb-4">
                    <div className="text-sm opacity-75 mb-1">{result.experienceLevel} {result.predictedRole}</div>
                    <div className="text-4xl font-bold">₹{result.salaryRange?.expected} LPA</div>
                    <div className="text-sm opacity-75 mt-1">₹{result.salaryRange?.min} – ₹{result.salaryRange?.max} LPA range</div>
                  </div>
                  <p className="text-center text-sm opacity-90">{result.marketInsight}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Premium Skills You Have</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.premiumSkillsFound?.map((s: string) => (
                        <span key={s} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">⬆ {s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-semibold text-gray-900 mb-3">Salary Boost Tips</h3>
                    <div className="space-y-2">
                      {result.salaryBoostTips?.map((tip: string, i: number) => (
                        <p key={i} className="text-sm text-gray-700">💡 {tip}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Company Match Result */}
            {tab === 'companies' && (
              <>
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <p className="text-gray-700 font-medium">{result.summary}</p>
                  <p className="text-sm text-gray-500 mt-1">{result.experienceLevel} level • {result.totalSkills} skills detected</p>
                </div>
                <div className="space-y-3">
                  {result.topCompanies?.map((c: any) => (
                    <div key={c.name} className="bg-white rounded-xl border border-gray-100 p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{c.type}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{c.fitVerdict} • {c.interviewRounds} rounds</p>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${c.matchScore >= 75 ? 'text-green-600' : c.matchScore >= 55 ? 'text-yellow-600' : 'text-gray-400'}`}>
                            {c.matchScore}%
                          </div>
                          <div className="text-xs text-gray-400">{c.difficulty}</div>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Matched: </span>
                          {c.matchedSkills.map((s: string) => (
                            <span key={s} className="inline-block mr-1 px-1.5 py-0.5 bg-green-50 text-green-700 rounded text-xs">{s}</span>
                          ))}
                        </div>
                        {c.missingSkills.length > 0 && (
                          <div>
                            <span className="text-gray-500">Missing: </span>
                            {c.missingSkills.map((s: string) => (
                              <span key={s} className="inline-block mr-1 px-1.5 py-0.5 bg-red-50 text-red-700 rounded text-xs">{s}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
