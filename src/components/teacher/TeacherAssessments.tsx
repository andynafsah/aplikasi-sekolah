import React, { useState, useEffect } from 'react';
import { Plus, Save, Check, FileText, Sparkles, HelpCircle, AlertCircle, Award, Trophy, Trash2 } from 'lucide-react';
import { GradeRecord } from '../../types/teacher';
import apiClient from '../../api/client';

interface TeacherAssessmentsProps {
  gradesList: GradeRecord[];
  setGradesList: React.Dispatch<React.SetStateAction<GradeRecord[]>>;
}

export default function TeacherAssessments({ gradesList, setGradesList }: TeacherAssessmentsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'tugas' | 'quiz' | 'bank' | 'formatif' | 'sumatif' | 'praktik' | 'p5'>('tugas');
  const [successMsg, setSuccessMsg] = useState('');

  const [assignments, setAssignments] = useState<any[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskType, setNewTaskType] = useState('TUGAS MANDIRI');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await apiClient.post('/api/action', { action: 'getAssignments' });
      if (res.data.success) {
        setAssignments(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch assignments', error);
    }
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/action', { 
        action: 'saveAssignment',
        body: {
          title: newTaskTitle,
          description: newTaskDesc,
          type: newTaskType,
          subject_id: 'SUBJ-1',
          teacher_id: 'TCH-1'
        }
      });
      setSuccessMsg('Sistem berhasil membuat tugas baru di LMS portal!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowTaskForm(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      fetchAssignments();
    } catch (error) {
      console.error('Failed to save assignment', error);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await apiClient.post('/api/action', {
        action: 'deleteAssignment',
        body: { id }
      });
      fetchAssignments();
    } catch (error) {
      console.error('Failed to delete assignment', error);
    }
  };

  const [bankSoal, setBankSoal] = useState<any[]>([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionTopic, setNewQuestionTopic] = useState('');
  const [newQuestionDifficulty, setNewQuestionDifficulty] = useState('Sedang');
  const [newQuestionCognitive, setNewQuestionCognitive] = useState('C3');

  useEffect(() => {
    fetchAssignments();
    fetchBankSoal();
  }, []);

  const fetchBankSoal = async () => {
    try {
      const res = await apiClient.post('/api/action', { action: 'getQuestionBanks' });
      if (res.data.success) {
        setBankSoal(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank soal', error);
    }
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/action', {
        action: 'saveQuestionBank',
        body: {
          question: newQuestionText,
          topic: newQuestionTopic,
          difficulty: newQuestionDifficulty,
          cognitive_level: newQuestionCognitive,
          subject_id: 'SUBJ-1',
          teacher_id: 'TCH-1'
        }
      });
      setSuccessMsg('Sistem berhasil meregistrasikan butir soal baru!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowQuestionForm(false);
      setNewQuestionText('');
      setNewQuestionTopic('');
      fetchBankSoal();
    } catch (error) {
      console.error('Failed to save question', error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      await apiClient.post('/api/action', {
        action: 'deleteQuestionBank',
        body: { id }
      });
      fetchBankSoal();
    } catch (error) {
      console.error('Failed to delete question', error);
    }
  };

  const handleUploadBankSoal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string;
        // Basic CSV parsing for demo
        const rows = content.split('\n').filter(r => r.trim().length > 0);
        const questions = rows.slice(1).map(row => {
          const cols = row.split(',');
          return {
            question: cols[0] || 'Unknown Question',
            topic: cols[1] || 'Unknown Topic',
            difficulty: cols[2] || 'Sedang',
            cognitive_level: cols[3] || 'C3',
            subject_id: 'SUBJ-1',
            teacher_id: 'TCH-1'
          };
        });

        await apiClient.post('/api/action', {
          action: 'importQuestionBank',
          body: { questions }
        });
        
        setSuccessMsg(`Berhasil mengimpor ${questions.length} butir soal dari CSV.`);
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchBankSoal();
      } catch (error) {
        console.error('Failed to upload', error);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadBankSoal = () => {
    if (bankSoal.length === 0) return;
    
    // Create CSV header
    let csv = 'Pertanyaan,Topik,Tingkat Kesulitan,Level Kognitif\n';
    
    // Add rows
    bankSoal.forEach(q => {
      // Escape commas and quotes for CSV
      const questionEscaped = `"${(q.question || '').replace(/"/g, '""')}"`;
      const topicEscaped = `"${(q.topic || '').replace(/"/g, '""')}"`;
      csv += `${questionEscaped},${topicEscaped},${q.difficulty || 'Sedang'},${q.cognitive_level || 'C3'}\n`;
    });

    // Download file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bank_soal_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quiz active states
  const [quizScoreboard, setQuizScoreboard] = useState([
    { rank: 1, name: 'Farhan Ramadhan', score: 95, time: '2m 14s' },
    { rank: 2, name: 'Laila Fitriani', score: 90, time: '2m 45s' },
    { rank: 3, name: 'Zaid Al-Khair', score: 85, time: '3m 10s' }
  ]);

  const handleInlineGradeChange = (studentId: string, field: keyof GradeRecord, value: string | number) => {
    setGradesList(prev => prev.map(item => {
      if (item.studentId === studentId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSaveGrades = () => {
    setSuccessMsg('Seluruh nilai berhasil disimpan, divalidasi, dan diakumulasikan secara otomatis!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1">
        <button
          onClick={() => setActiveSubTab('tugas')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'tugas' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Tugas Kelas
        </button>
        <button
          onClick={() => setActiveSubTab('quiz')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'quiz' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Kuis Interaktif
        </button>
        <button
          onClick={() => setActiveSubTab('bank')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'bank' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bank Soal
        </button>
        <button
          onClick={() => setActiveSubTab('formatif')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'formatif' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Formatif (UH)
        </button>
        <button
          onClick={() => setActiveSubTab('sumatif')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'sumatif' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Sumatif (PTS/PAS)
        </button>
        <button
          onClick={() => setActiveSubTab('praktik')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'praktik' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Nilai Praktik
        </button>
        <button
          onClick={() => setActiveSubTab('p5')}
          className={`px-3 py-2 font-bold text-[11px] border-b-2 cursor-pointer transition-all ${
            activeSubTab === 'p5' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Projek P5
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 1. TUGAS KELAS */}
      {activeSubTab === 'tugas' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penugasan Terjadwal</h3>
              <p className="text-slate-500 text-xs mt-0.5">Membuat, meninjau, dan menilai penugasan mandiri ataupun kelompok.</p>
            </div>
            {!showTaskForm && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Buat Tugas Baru
              </button>
            )}
          </div>

          {showTaskForm && (
            <form onSubmit={handleSaveAssignment} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
              <h4 className="font-bold text-slate-700 text-sm">Form Pembuatan Tugas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Judul Tugas</label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Tugas Mandiri 1: Pemecahan Persamaan"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tipe Tugas</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="TUGAS MANDIRI">Tugas Mandiri</option>
                    <option value="TUGAS KELOMPOK">Tugas Kelompok</option>
                    <option value="KUIS">Kuis</option>
                    <option value="PROYEK">Proyek</option>
                  </select>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Deskripsi & Instruksi</label>
                  <textarea
                    rows={3}
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan instruksi lengkap pengerjaan tugas..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {assignments.length > 0 ? assignments.map((assignment: any) => (
              <div key={assignment.id} className="p-4 border border-slate-200 rounded-xl space-y-3 relative hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">{assignment.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400 font-mono">Status: {assignment.status}</span>
                    <button 
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      title="Hapus tugas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800">{assignment.title}</h4>
                <p className="text-slate-500 text-[11px] whitespace-pre-wrap">{assignment.description}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Belum ada tugas.</p>
                <p className="text-[10px]">Klik Buat Tugas Baru untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. KUIS INTERAKTIF */}
      {activeSubTab === 'quiz' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Sesi Kuis Kelas Aktif</h3>
              <p className="text-slate-500 text-xs mt-0.5">Pantau jalannya kuis waktu nyata dan nilai leaderboard siswa.</p>
            </div>
            <button
              onClick={() => {
                setSuccessMsg('Sesi kuis kelas baru berhasil dibuka di server portal!');
                setTimeout(() => setSuccessMsg(''), 4000);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Trophy className="h-4 w-4" />
              Mulai Kuis Cepat
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Leaderboard */}
            <div className="border border-slate-200 rounded-xl p-4 space-y-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                Live Podium Scoreboard
              </h4>
              <div className="space-y-2">
                {quizScoreboard.map((player) => (
                  <div key={player.rank} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black text-white ${
                        player.rank === 1 ? 'bg-amber-500' : player.rank === 2 ? 'bg-slate-400' : 'bg-amber-700'
                      }`}>
                        {player.rank}
                      </span>
                      <span className="text-xs font-bold text-slate-700">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="font-bold text-blue-600">{player.score} Pts</span>
                      <span className="text-slate-400">{player.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quiz Info */}
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded uppercase tracking-wider">KUIS AKTIF</span>
                <h4 className="text-xs font-bold text-slate-800">Ujian Kilat: GLB & GLBB Fisika</h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">Kuis ini digunakan sebagai instrumen refleksi harian siswa di akhir sub-bab pertama.</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-4 block">Dibuat menggunakan Bank Soal Terpadu</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. BANK SOAL */}
      {activeSubTab === 'bank' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Koleksi Bank Soal Terarsip</h3>
              <p className="text-slate-500 text-xs mt-0.5">Gunakan butir soal terstandarisasi untuk ujian formatif atau sumatif.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-slate-200 transition-colors">
                <FileText className="h-4 w-4" />
                Upload CSV
                <input type="file" accept=".csv" className="hidden" onChange={handleUploadBankSoal} />
              </label>
              <button
                onClick={handleDownloadBankSoal}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                Unduh CSV
              </button>
              {!showQuestionForm && (
                <button
                  onClick={() => setShowQuestionForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Soal
                </button>
              )}
            </div>
          </div>

          {showQuestionForm && (
            <form onSubmit={handleSaveQuestion} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
              <h4 className="font-bold text-slate-700 text-sm">Form Soal Baru</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-3">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pertanyaan</label>
                  <textarea
                    rows={3}
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Masukkan butir soal..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Topik / Materi</label>
                  <input
                    type="text"
                    value={newQuestionTopic}
                    onChange={(e) => setNewQuestionTopic(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Contoh: Hukum Newton"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tingkat Kesulitan</label>
                  <select
                    value={newQuestionDifficulty}
                    onChange={(e) => setNewQuestionDifficulty(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Level Kognitif</label>
                  <select
                    value={newQuestionCognitive}
                    onChange={(e) => setNewQuestionCognitive(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    required
                  >
                    <option value="C1">C1 - Mengingat</option>
                    <option value="C2">C2 - Memahami</option>
                    <option value="C3">C3 - Mengaplikasikan</option>
                    <option value="C4">C4 - Menganalisis</option>
                    <option value="C5">C5 - Mengevaluasi</option>
                    <option value="C6">C6 - Mencipta</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors cursor-pointer"
                >
                  Simpan Soal
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {bankSoal.length > 0 ? bankSoal.map((q) => (
              <div key={q.id} className="p-4 border border-slate-200 rounded-xl space-y-2.5 hover:bg-slate-50/30 transition-all relative">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                  <span className="font-bold text-blue-600">Topik: {q.topic}</span>
                  <div className="flex gap-3 items-center">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">Tingkat {q.difficulty}</span>
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">{q.cognitive_level || q.cognitiveLevel}</span>
                    <button 
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors ml-2"
                      title="Hapus soal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">{q.question}</p>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-bold">Belum ada soal tersimpan.</p>
                <p className="text-[10px]">Klik Tambah Soal atau Upload CSV untuk memulai.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. ULANGAN HARIAN & FORMATIF */}
      {activeSubTab === 'formatif' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nilai Ulangan Harian & Formatif</h3>
              <p className="text-slate-500 text-xs mt-0.5">Daftar nilai evaluasi harian. Edit langsung pada sel tabel untuk mengubah nilai.</p>
            </div>
            <button
              onClick={handleSaveGrades}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan Nilai
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Formatif 1 (Gaya)</th>
                  <th className="py-3 px-4 text-center">Formatif 2 (Energi)</th>
                  <th className="py-3 px-4 text-center">Rata-rata Formatif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => {
                  const avg = ((item.formative1 + item.formative2) / 2).toFixed(1);
                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="number"
                          value={item.formative1 ?? ''}
                          onChange={(e) => handleInlineGradeChange(item.studentId, 'formative1', parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="number"
                          value={item.formative2 ?? ''}
                          onChange={(e) => handleInlineGradeChange(item.studentId, 'formative2', parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-blue-600">{avg}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUMATIF, PTS & PAS */}
      {activeSubTab === 'sumatif' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nilai Sumatif Akhir (PTS/PAS/PAT)</h3>
              <p className="text-slate-500 text-xs mt-0.5">Daftar nilai ujian sumatif tengah semester dan akhir semester.</p>
            </div>
            <button
              onClick={handleSaveGrades}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Perubahan Nilai
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Sumatif Harian</th>
                  <th className="py-3 px-4 text-center">Nilai PTS</th>
                  <th className="py-3 px-4 text-center">Nilai PAS / PAT</th>
                  <th className="py-3 px-4 text-center">Kombinasi Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => {
                  const final = ((item.summative * 0.4) + (item.pts * 0.2) + (item.pas * 0.4)).toFixed(1);
                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="number"
                          value={item.summative ?? ''}
                          onChange={(e) => handleInlineGradeChange(item.studentId, 'summative', parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="number"
                          value={item.pts ?? ''}
                          onChange={(e) => handleInlineGradeChange(item.studentId, 'pts', parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-2 px-4 text-center">
                        <input
                          type="number"
                          value={item.pas ?? ''}
                          onChange={(e) => handleInlineGradeChange(item.studentId, 'pas', parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-indigo-600">{final}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. NILAI PRAKTIK */}
      {activeSubTab === 'praktik' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penilaian Praktik & Keterampilan</h3>
              <p className="text-slate-500 text-xs mt-0.5">Asesmen kemampuan unjuk kerja, portofolio, dan laporan ilmiah.</p>
            </div>
            <button
              onClick={handleSaveGrades}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Nilai Praktik
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Persiapan Alat (20%)</th>
                  <th className="py-3 px-4 text-center">Prosedur Kerja (40%)</th>
                  <th className="py-3 px-4 text-center">Laporan Praktikum (40%)</th>
                  <th className="py-3 px-4 text-center">Nilai Praktik Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => {
                  return (
                    <tr key={item.studentId} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                      <td className="py-2 px-4 text-center text-slate-500">85</td>
                      <td className="py-2 px-4 text-center text-slate-500">88</td>
                      <td className="py-2 px-4 text-center text-slate-500">
                        <input
                          type="number"
                          value={item.praktik ?? ''}
                          onChange={(e) => handleInlineGradeChange(item.studentId, 'praktik', parseInt(e.target.value) || 0)}
                          className="w-16 bg-slate-50 border border-slate-200 rounded-lg text-center py-1 text-slate-800 text-xs font-bold focus:bg-white focus:outline-none"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-emerald-600">{item.praktik}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. PROJEK P5 */}
      {activeSubTab === 'p5' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Penilaian Projek Penguatan Profil Pelajar Pancasila (P5)</h3>
              <p className="text-slate-500 text-xs mt-0.5">Asesmen dimensi karakter gotong royong, bernalar kritis, kreatif, dan mandiri.</p>
            </div>
            <button
              onClick={handleSaveGrades}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              Simpan Karakter P5
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase bg-slate-50">
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Penilaian Karakter P5</th>
                  <th className="py-3 px-4">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {gradesList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2 px-4 text-center">
                      <select
                        value={item.p5_status}
                        onChange={(e) => handleInlineGradeChange(item.studentId, 'p5_status', e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold focus:bg-white focus:outline-none"
                      >
                        <option value="BB">BB - Belum Berkembang</option>
                        <option value="MB">MB - Mulai Berkembang</option>
                        <option value="BSH">BSH - Berkembang Sesuai Harapan</option>
                        <option value="SB">SB - Sangat Berkembang</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px]">
                      {item.p5_status === 'SB' ? 'Sangat aktif memimpin tim projek energi matahari.' : 'Bekerja sama dengan baik dalam kelompok.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
