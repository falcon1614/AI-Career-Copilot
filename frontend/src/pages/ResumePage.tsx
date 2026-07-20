import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore';
import { Upload, FileText, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResumePage() {
  const { resumes, uploadResume, fetchResumes, deleteResume, isUploading } = useResumeStore();
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchResumes(); }, []);

  async function handleFile(file: File) {
    if (!['application/pdf','application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
      toast.error('Only PDF and DOCX files supported'); return;
    }
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return; }
    const toastId = toast.loading('Uploading and analyzing...');
    try {
      const result = await uploadResume(file);
      toast.success(`ATS Score: ${result.ats.score}/100`, { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed', { id: toastId });
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await deleteResume(id);
    toast.success('Resume deleted');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-xl font-bold text-gray-900">Resume Analyzer</h1>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Upload Zone */}
        <div
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors mb-8
            ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
            ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <Upload size={40} className={`mx-auto mb-4 ${dragOver ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700">
            {isUploading ? 'Analyzing your resume...' : 'Drop your resume here or click to upload'}
          </p>
          <p className="text-gray-400 text-sm mt-2">PDF or DOCX • Max 5MB</p>
        </div>

        {/* Resume List */}
        {resumes.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-700 mb-4">Your Resumes ({resumes.length})</h2>
            {resumes.map((r) => (
              <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5
                flex items-center justify-between">
                <Link to={`/resume/${r.id}`} className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText size={22} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{r.file_name}</p>
                    <p className="text-gray-400 text-sm">
                      {(r.file_size / 1024).toFixed(0)} KB •{' '}
                      {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold
                      ${r.ats_score >= 80 ? 'text-green-600' : r.ats_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {r.ats_score}
                    </div>
                    <div className="text-xs text-gray-400">ATS Score</div>
                  </div>
                  <button onClick={() => handleDelete(r.id, r.file_name)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
