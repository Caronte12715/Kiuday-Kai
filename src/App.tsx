import React, { useState, useEffect } from "react";
import { 
  Users, 
  ClipboardCheck, 
  BarChart3, 
  Database, 
  Download, 
  Printer, 
  Settings, 
  MapPin, 
  Flame, 
  Plus, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Student, AttendanceRecord, SupabaseConfig } from "./types";
import { 
  loadStudents, 
  saveStudent, 
  deleteStudent, 
  loadAttendance, 
  bulkSaveAttendanceRecords,
  getSupabaseConfig,
  saveSupabaseConfig
} from "./lib/storage";

// Sub-components
import StudentList from "./components/StudentList";
import EnrollmentForm from "./components/EnrollmentForm";
import AttendanceControl from "./components/AttendanceControl";
import StatsDashboard from "./components/StatsDashboard";
import SupabaseConfigModal from "./components/SupabaseConfigModal";
import PrintSheet from "./components/PrintSheet";

function getCurrentWeekKey() {
  const d = new Date();
  const tempDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = tempDate.getUTCDay() || 7;
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
  const startOfYear = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tempDate.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
  return `${tempDate.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

export default function App() {
  // Core states
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"students" | "attendance" | "stats">("students");
  const [activeWeekKey, setActiveWeekKey] = useState<string>(getCurrentWeekKey());
  
  // Modals & form toggles
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudentForForm, setSelectedStudentForForm] = useState<Student | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>({
    url: "",
    anonKey: "",
    isConnected: false,
  });

  // Print state
  const [printType, setPrintType] = useState<"enrollment" | "attendance">("enrollment");
  const [printStudent, setPrintStudent] = useState<Student | null>(null);

  // Load initial data
  useEffect(() => {
    async function initData() {
      const storedStudents = await loadStudents();
      const storedAttendance = await loadAttendance();
      const storedCfg = getSupabaseConfig();
      
      setStudents(storedStudents);
      setAttendanceRecords(storedAttendance);
      setSupabaseConfig(storedCfg);
    }
    initData();
  }, [isFormOpen]);

  // Actions
  const handleSaveStudent = async (student: Student) => {
    await saveStudent(student);
    const updated = await loadStudents();
    setStudents(updated);
    setIsFormOpen(false);
    setSelectedStudentForForm(null);
  };

  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudent(studentId);
    const updated = await loadStudents();
    setStudents(updated);
  };

  const handleSaveAttendance = async (records: AttendanceRecord[]) => {
    await bulkSaveAttendanceRecords(records);
    const updated = await loadAttendance();
    setAttendanceRecords(updated);
  };

  const handleSaveConfig = (newConfig: SupabaseConfig) => {
    saveSupabaseConfig(newConfig);
    setSupabaseConfig(newConfig);
  };

  // Printing Triggers
  const handleTriggerSingleEnrollmentPrint = (student: Student) => {
    setPrintType("enrollment");
    setPrintStudent(student);
    // Give state a fraction of a second to render before triggering browser dialog
    setTimeout(() => {
      window.print();
    }, 120);
  };

  const handleTriggerWeeklyAttendancePrint = () => {
    setPrintType("attendance");
    setPrintStudent(null);
    setTimeout(() => {
      window.print();
    }, 125);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-amber-500 selection:text-slate-950 pb-16">
      
      {/* Brand Header & Navigation Panel */}
      <header className="relative bg-[#070b13] border-b border-amber-500/10 py-6 px-4 md:px-8 shadow-xl no-print">
        {/* Subtle glowing ambient mesh */}
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Logo Brand Segment */}
          <div className="flex items-center gap-4 text-center md:text-left self-center md:self-auto">
            {/* Dynamic circular SVG Dojo Emblem (Kyudai Kai Custom) */}
            <div className="relative group shrink-0">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-blue-600 rounded-full blur-sm opacity-30 group-hover:opacity-70 transition-all duration-300"></div>
              
              {/* Perfectly simulated Kyudai Kai patch logo! */}
              <svg 
                viewBox="0 0 200 200" 
                className="w-18 h-18 md:w-20 md:h-20 rounded-full border-2 border-amber-500 bg-black shadow-lg"
              >
                {/* Outer Ring boundary */}
                <circle cx="100" cy="100" r="95" fill="black" />
                <circle cx="100" cy="100" r="91" stroke="#d97706" strokeWidth="2" fill="none" />
                
                {/* Text along outer arc using SVG Path */}
                <defs>
                  <path id="textPathTop" d="M 23,100 A 77,77 0 0,1 177,100" fill="none" />
                  <path id="textPathBottom" d="M 177,100 A 77,77 0 0,1 23,100" fill="none" />
                </defs>
                <text fill="#d97706" fontSize="13.5" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="0.8">
                  <textPath href="#textPathTop" startOffset="50%" textAnchor="middle">
                    Escuela de karate Kyudai Kai
                  </textPath>
                </text>
                <text fill="#d97706" fontSize="12" fontWeight="bold" fontFamily="system-ui, sans-serif" letterSpacing="0.5">
                  <textPath href="#textPathBottom" startOffset="50%" textAnchor="middle">
                    San Miguel, El Salvador
                  </textPath>
                </text>

                {/* Inner cream background ring for martial art elements */}
                <circle cx="100" cy="100" r="69" fill="#fcf9f2" stroke="#d97706" strokeWidth="1.5" />
                
                {/* Red Sun of Japan */}
                <circle cx="100" cy="100" r="32" fill="#dc2626" />
                
                {/* Mount Fuji (Green silhouette + snow top) */}
                <path d="M 50,150 L 100,75 L 150,150 Z" fill="#15803d" />
                <path d="M 85,98 L 100,75 L 115,98 L 108,103 L 100,97 L 92,103 Z" fill="#ffffff" />
                
                {/* Black belt belt decoration overlapping bottom */}
                <path d="M 68,142 Q 100,165 132,142" stroke="black" strokeWidth="15" fill="none" />
                <path d="M 68,142 Q 100,165 132,142" stroke="#d97706" strokeWidth="17" fill="none" strokeDasharray="4 6" />

                {/* Kanji Overlay (空手道 - Karate Do) on top of Red Sun */}
                <text x="100" y="87" textAnchor="middle" fill="#2563eb" fontSize="12.5" fontWeight="black" fontFamily="serif" stroke="#d97706" strokeWidth="0.5">空</text>
                <text x="100" y="102" textAnchor="middle" fill="#2563eb" fontSize="12.5" fontWeight="black" fontFamily="serif" stroke="#d97706" strokeWidth="0.5">手</text>
                <text x="100" y="117" textAnchor="middle" fill="#2563eb" fontSize="12.5" fontWeight="black" fontFamily="serif" stroke="#d97706" strokeWidth="0.5">道</text>
              </svg>
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="font-display font-black text-2xl md:text-3xl text-white tracking-tight">
                  SISTEMA <span className="text-amber-500">KYUDAI KAI</span>
                </h1>
                <span className="self-start sm:self-auto px-2 py-0.5 text-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded font-semibold uppercase tracking-widest flex items-center gap-1">
                  <Flame className="w-3 h-3 animate-pulse" />
                  <span>Dojō San Miguel</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Gestor Administrativo Semanal de Matrícula y Asistencias</span>
              </p>
            </div>
          </div>

          {/* Database & Metadata status card */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Supabase Sync Card Banner */}
            <div 
              onClick={() => setIsConfigModalOpen(true)}
              className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer select-none transition-all w-full sm:w-auto ${
                supabaseConfig.isConnected
                  ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-950/30"
                  : "bg-slate-900 border-slate-800 text-slate-450 hover:border-slate-700"
              }`}
            >
              <div className={`p-2 rounded-full ${supabaseConfig.isConnected ? 'bg-emerald-500/10' : 'bg-slate-950'}`}>
                <Database className={`w-4 h-4 ${supabaseConfig.isConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
              </div>
              <div className="text-left text-xs min-w-[120px]">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span>Supabase Cloud</span>
                  <span className={`w-2 h-2 rounded-full inline-block ${supabaseConfig.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {supabaseConfig.isConnected ? "Conectado y sincrónico" : "Local (Pulsa para conectar)"}
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 ml-auto sm:ml-0" />
            </div>

            {/* settings config */}
            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors w-full sm:w-auto flex items-center justify-center gap-2 text-xs"
              title="Ajustar Base de Datos"
            >
              <Settings className="w-4 h-4 text-amber-500" />
              <span className="sm:hidden">Ajustes</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6 relative z-10 no-print">
        
        {/* If Form is open, show the enrollment screen */}
        {isFormOpen ? (
          <div className="transition-all duration-300">
            <EnrollmentForm
              student={selectedStudentForForm}
              onSave={handleSaveStudent}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedStudentForForm(null);
              }}
            />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Tabs Bar controllers */}
            <div className="flex border-b border-slate-800 p-1 bg-slate-900/40 rounded-xl max-w-lg">
              <button
                id="tab-students"
                onClick={() => setActiveTab("students")}
                className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "students"
                    ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                <Users className="w-4.5 h-4.5" />
                <span>Matrículas ({students.length})</span>
              </button>

              <button
                id="tab-attendance"
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "attendance"
                    ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                <ClipboardCheck className="w-4.5 h-4.5" />
                <span>Asistencia</span>
              </button>

              <button
                id="tab-stats"
                onClick={() => setActiveTab("stats")}
                className={`flex-1 py-3 text-xs md:text-sm font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 transition-all ${
                  activeTab === "stats"
                    ? "bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
              >
                <BarChart3 className="w-4.5 h-4.5" />
                <span>Métricas</span>
              </button>
            </div>

            {/* Current Active Tab Body Panel */}
            <div className="transition-all duration-350 min-h-[50vh]">
              {activeTab === "students" && (
                <StudentList
                  students={students}
                  onAddStudentClick={() => {
                    setSelectedStudentForForm(null);
                    setIsFormOpen(true);
                  }}
                  onEditStudentClick={(std) => {
                    setSelectedStudentForForm(std);
                    setIsFormOpen(true);
                  }}
                  onDeleteStudent={handleDeleteStudent}
                  onTriggerSinglePrint={handleTriggerSingleEnrollmentPrint}
                />
              )}

              {activeTab === "attendance" && (
                <AttendanceControl
                  students={students}
                  attendanceRecords={attendanceRecords}
                  activeWeekKey={activeWeekKey}
                  onWeekChange={setActiveWeekKey}
                  onSaveAttendance={handleSaveAttendance}
                  onTriggerPrint={handleTriggerWeeklyAttendancePrint}
                />
              )}

              {activeTab === "stats" && (
                <StatsDashboard
                  students={students}
                  attendanceRecords={attendanceRecords}
                  activeWeekKey={activeWeekKey}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-16 text-center text-xs text-slate-600 border-t border-slate-900 py-6 px-4 no-print">
        <p>© {new Date().getFullYear()} Escuela de Karate Kyudai Kai • San Miguel, El Salvador.</p>
        <p className="mt-1 font-mono text-[10px] text-slate-700">Diseño Tecnológico Profesional • Sincronización Supabase Cloud habilitada</p>
      </footer>

      {/* MODALS */}
      <SupabaseConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={supabaseConfig}
        onSave={handleSaveConfig}
      />

      {/* HIDDEN PRINT LAYOUTS (Rendered and isolated during printing only using media css print rules) */}
      <PrintSheet
        type={printType}
        student={printStudent}
        students={students}
        attendance={attendanceRecords}
        weekKey={activeWeekKey}
      />
    </div>
  );
}
