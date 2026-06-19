import React from "react";
import { Users, Medal, TrendingUp, Award, Activity, AlertCircle } from "lucide-react";
import { Student, AttendanceRecord } from "../types";

interface StatsDashboardProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  activeWeekKey: string;
}

export default function StatsDashboard({
  students,
  attendanceRecords,
  activeWeekKey,
}: StatsDashboardProps) {
  
  // 1. Calculate Belt levels count
  const beltDistribution: { [key: string]: number } = {};
  students.forEach((s) => {
    const belt = s.belt || "Participante";
    beltDistribution[belt] = (beltDistribution[belt] || 0) + 1;
  });

  // Sort belts by custom order of martial arts seniority
  const beltOrder = [
    "Cinta Blanca",
    "Cinta Amarilla",
    "Cinta Naranja",
    "Cinta Verde",
    "Cinta Verde-Morada",
    "Cinta Morada",
    "Cinta Azul",
    "Cinta Marrón",
    "Cinta Negra",
    "Participante"
  ];

  // 2. Attendance percentage for the current chosen week
  const weekRecords = attendanceRecords.filter((r) => r.weekKey === activeWeekKey);
  const totalStudents = students.length || 1;
  
  let totalAttendancesForWeek = 0;
  weekRecords.forEach((rec) => {
    if (rec.days.lunes) totalAttendancesForWeek++;
    if (rec.days.miercoles) totalAttendancesForWeek++;
    if (rec.days.viernes) totalAttendancesForWeek++;
    if (rec.days.sabado) totalAttendancesForWeek++;
  });

  // Calculate percentage
  const maxPossibleAttendances = totalStudents * 4; // 4 classes per week
  const attendanceRate = maxPossibleAttendances > 0 
    ? Math.round((totalAttendancesForWeek / maxPossibleAttendances) * 100)
    : 0;

  // 3. Demographics: Under 18 (Niños / Jóvenes) vs 18+ (Adultos)
  let childrenCount = 0;
  let adultCount = 0;
  
  students.forEach((s) => {
    if (s.birthDate) {
      const birth = new Date(s.birthDate);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        childrenCount++;
      } else {
        adultCount++;
      }
    } else {
      childrenCount++; // Default fallback
    }
  });

  // 4. Find Top high-attendance students (e.g. 3 or 4 days checked)
  const stellarStudents = students.map((s) => {
    const rec = weekRecords.find((r) => r.studentId === s.id);
    let classesCount = 0;
    if (rec?.days.lunes) classesCount++;
    if (rec?.days.miercoles) classesCount++;
    if (rec?.days.viernes) classesCount++;
    if (rec?.days.sabado) classesCount++;
    return { name: s.name, belt: s.belt, classesCount };
  }).filter(s => s.classesCount >= 3)
    .sort((a, b) => b.classesCount - a.classesCount)
    .slice(0, 5);

  return (
    <div className="space-y-6 no-print">
      
      {/* Bento Grid: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total students */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Dojo-kas Activos</span>
            <div className="text-3xl font-bold text-white font-mono">{students.length}</div>
            <span className="text-[10px] text-slate-500 block">Matrículas cargadas con éxito</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-950/40 text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-1 bg-blue-500"></div>
        </div>

        {/* Attendance KPI */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Asistencia Semanal</span>
            <div className="text-3xl font-bold text-amber-500 font-mono">{attendanceRate}%</div>
            <span className="text-[10px] text-slate-500 block">De todos los entrenamientos de esta semana</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/25 text-amber-500">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-1 bg-amber-500"></div>
        </div>

        {/* Belts Count */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Instructores & Graduados</span>
            <div className="text-3xl font-bold text-emerald-400 font-mono">
              {students.filter((s) => s.belt.includes("Verde") || s.belt.includes("Morada") || s.belt.includes("Negra")).length}
            </div>
            <span className="text-[10px] text-slate-500 block">Grados intermedios y avanzados</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/25 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-1 bg-emerald-500"></div>
        </div>

        {/* Classes this week */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Falta de Registro</span>
            <div className="text-3xl font-bold text-rose-450 font-mono">
              {students.length - weekRecords.length}
            </div>
            <span className="text-[10px] text-slate-500 block">Alumnos sin registrar asistencia</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/25 text-rose-400">
            <Activity className="w-6 h-6" />
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-1 bg-rose-500"></div>
        </div>
      </div>

      {/* Main Charts & Highlights panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Belt counts chart (HTML linear layout) */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4 lg:col-span-2">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="font-display font-semibold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <Medal className="w-4 h-4 text-amber-500" />
              <span>Distribución de Cinturones y Rangos</span>
            </h4>
            <p className="text-[10px] text-slate-500 mt-1">Avance de graduación en la escuela Kyudai Kai</p>
          </div>

          <div className="space-y-3 pt-2">
            {beltOrder.map((belt) => {
              const count = beltDistribution[belt] || 0;
              const ratio = Math.round((count / totalStudents) * 100);
              
              // Only render if there are students in that belt, to keep it clean
              if (count === 0) return null;

              // Color styles
              let barColor = "bg-slate-700";
              if (belt.includes("Naranja")) barColor = "bg-amber-600";
              else if (belt.includes("Verde")) barColor = "bg-emerald-500";
              else if (belt.includes("Amarilla")) barColor = "bg-yellow-400";
              else if (belt.includes("Morada")) barColor = "bg-purple-500";
              else if (belt.includes("Negra")) barColor = "bg-slate-300";

              return (
                <div key={belt} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{belt}</span>
                    <span className="text-slate-400 font-mono">
                      {count} {count === 1 ? "alumno" : "alumnos"} ({ratio}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${ratio}%` }}
                      className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar stats & top performers list */}
        <div className="space-y-6">
          
          {/* Demographics card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Demografía del Dojō
            </h4>
            
            <div className="space-y-4">
              {/* Children ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Niños & Menores (Menores de 18)</span>
                  <span className="font-mono text-white">{childrenCount}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(childrenCount / totalStudents) * 100}%` }}
                    className="h-full bg-blue-500 rounded-full"
                  ></div>
                </div>
              </div>

              {/* Adults ratio */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Adultos (Mayores de 18)</span>
                  <span className="font-mono text-white">{adultCount}</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${(adultCount / totalStudents) * 100}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top performers list */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Fórmula de Honor de la Semana
            </h4>

            {stellarStudents.length > 0 ? (
              <div className="space-y-3">
                {stellarStudents.map((std, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div>
                      <div className="font-semibold text-white truncate max-w-[140px]">{std.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{std.belt}</div>
                    </div>
                    <span className="inline-block px-2 py-1 bg-emerald-950/40 text-emerald-400 font-bold rounded text-[10px]">
                      {std.classesCount}/4 Asistido
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-slate-950 rounded text-slate-500 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>Nadie ha entrenado esta semana todavía.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
