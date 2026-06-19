import React, { useState, useEffect } from "react";
import { Search, Calendar, Save, FileDown, Printer, Check, ClipboardList, RefreshCw } from "lucide-react";
import { Student, AttendanceRecord } from "../types";

interface AttendanceControlProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  activeWeekKey: string;
  onWeekChange: (weekKey: string) => void;
  onSaveAttendance: (records: AttendanceRecord[]) => Promise<void>;
  onTriggerPrint: () => void;
}

// Helper to generate recent weeks list
function generateWeeksList() {
  const list = [];
  const currentDate = new Date();
  
  // Let's generate the last 12 weeks of the year 2026/current
  for (let i = 0; i < 12; i++) {
    const d = new Date(currentDate.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    // ISO Week Calculation roughly
    const tempDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = tempDate.getUTCDay() || 7;
    tempDate.setUTCDate(tempDate.getUTCDate() + 4 - dayNum);
    const startOfYear = new Date(Date.UTC(tempDate.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((tempDate.getTime() - startOfYear.getTime()) / 86400000) + 1) / 7);
    
    const weekKey = `${tempDate.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
    const formattedRange = getWeekRangeLabel(tempDate);
    
    list.push({ key: weekKey, label: `Semana ${weekNo} (${formattedRange})` });
  }
  
  // Deduplicate
  const seen = new Set();
  return list.filter(el => {
    const duplicate = seen.has(el.key);
    seen.add(el.key);
    return !duplicate;
  });
}

function getWeekRangeLabel(mondayDate: Date) {
  const start = new Date(mondayDate);
  // Monday of the week
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(start.setDate(diff));
  
  const sat = new Date(mon);
  sat.setDate(mon.getDate() + 5);
  
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${mon.toLocaleDateString("es-ES", options)} - ${sat.toLocaleDateString("es-ES", options)}`;
}

export default function AttendanceControl({
  students,
  attendanceRecords,
  activeWeekKey,
  onWeekChange,
  onSaveAttendance,
  onTriggerPrint,
}: AttendanceControlProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const weeks = generateWeeksList();

  // Populate local state when students, attendance list, or week changes
  useEffect(() => {
    const recordsForWeek = students.map((std) => {
      const existing = attendanceRecords.find(
        (r) => r.studentId === std.id && r.weekKey === activeWeekKey
      );

      if (existing) {
        return { ...existing };
      } else {
        // Return blank slate record
        return {
          id: `${std.id}_${activeWeekKey}`,
          studentId: std.id,
          weekKey: activeWeekKey,
          days: {
            lunes: false,
            miercoles: false,
            viernes: false,
            sabado: false,
          },
          notes: "",
        };
      }
    });

    setLocalRecords(recordsForWeek);
  }, [students, attendanceRecords, activeWeekKey]);

  // Handle single checkbox toggle
  const handleToggleDay = (studentId: string, day: "lunes" | "miercoles" | "viernes" | "sabado") => {
    setLocalRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId === studentId) {
          return {
            ...rec,
            days: {
              ...rec.days,
              [day]: !rec.days[day],
            },
          };
        }
        return rec;
      })
    );
  };

  // Handle notes input change
  const handleNoteChange = (studentId: string, text: string) => {
    setLocalRecords((prev) =>
      prev.map((rec) => {
        if (rec.studentId === studentId) {
          return {
            ...rec,
            notes: text,
          };
        }
        return rec;
      })
    );
  };

  // Fast trigger: Toggle all checklists or mark all presents for a single day
  const handleMarkAllDay = (day: "lunes" | "miercoles" | "viernes" | "sabado", value: boolean) => {
    setLocalRecords((prev) =>
      prev.map((rec) => {
        // Only modify records of currently filtered/searched students, or all if search is empty
        const isFiltered = students
          .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .some((s) => s.id === rec.studentId);
        
        if (isFiltered) {
          return {
            ...rec,
            days: {
              ...rec.days,
              [day]: value,
            },
          };
        }
        return rec;
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveAttendance(localRecords);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // EXCEL EXPORT SCRIPT (Robust Excel CSV structure with UTF-8 BOM)
  const handleExportExcel = () => {
    // Column header labels
    const headers = [
      "ID",
      "Nombre Completo",
      "Cinta",
      "Lunes",
      "Miercoles",
      "Viernes",
      "Sabado",
      "Asistencias Totales",
      "Porcentaje Rendimiento",
      "Observaciones",
    ];

    // Generate row lines
    const rows = students.map((std) => {
      const rec = localRecords.find((r) => r.studentId === std.id);
      
      const lun = rec?.days.lunes ? "P" : "E"; // P: Presente, E: Edit/Falta
      const mie = rec?.days.miercoles ? "P" : "E";
      const vie = rec?.days.viernes ? "P" : "E";
      const sab = rec?.days.sabado ? "P" : "E";

      let checkSum = 0;
      if (rec?.days.lunes) checkSum++;
      if (rec?.days.miercoles) checkSum++;
      if (rec?.days.viernes) checkSum++;
      if (rec?.days.sabado) checkSum++;

      const percent = Math.round((checkSum / 4) * 100);

      return [
        std.id,
        `"${std.name.replace(/"/g, '""')}"`, // Quote strings safely to bypass commas inside names
        std.belt,
        lun,
        mie,
        vie,
        sab,
        checkSum.toString(),
        `${percent}%`,
        `"${(rec?.notes || "").replace(/"/g, '""')}"`,
      ];
    });

    // Create CSV content (prepend UTF-8 BOM so Excel opens accents correctly!)
    const csvContent = 
      "\uFEFF" + 
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Download link
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asistencia_kyudaikai_${activeWeekKey}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter((std) =>
    std.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    std.belt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 no-print">
      
      {/* Selector de Semana y Botones de Reporte */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-amber-500 font-bold shrink-0">
            <Calendar className="w-5 h-5" />
            <span className="font-display">Semana de Control:</span>
          </div>
          <select
            id="attendance-week-selector"
            value={activeWeekKey}
            onChange={(e) => onWeekChange(e.target.value)}
            className="px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 font-mono"
          >
            {weeks.map((wk) => (
              <option key={wk.key} value={wk.key}>
                {wk.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Print button */}
          <button
            id="print-attendance-btn"
            onClick={onTriggerPrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-755 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors"
            title="Imprimir listado en PDF"
          >
            <Printer className="w-4 h-4 text-amber-500" />
            <span>Imprimir PDF</span>
          </button>

          {/* Export spreadsheet button */}
          <button
            id="export-attendance-excel"
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-755 text-slate-200 hover:text-white text-xs font-semibold rounded-lg transition-colors"
            title="Descargar tabla formato Excel CSV"
          >
            <FileDown className="w-4 h-4 text-emerald-500" />
            <span>Excel Semana</span>
          </button>

          {/* Save button */}
          <button
            id="save-attendance-btn"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-blue-950/50"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>¡Guardado con éxito!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Rápido Masivo */}
      <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg flex flex-wrap gap-4 items-center text-xs text-slate-400">
        <span className="font-semibold text-slate-300">Marcar todo el listado actual:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleMarkAllDay("lunes", true)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:text-white hover:border-slate-655 transition-all"
          >
            + Lun
          </button>
          <button
            type="button"
            onClick={() => handleMarkAllDay("miercoles", true)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:text-white hover:border-slate-655 transition-all"
          >
            + Mié
          </button>
          <button
            type="button"
            onClick={() => handleMarkAllDay("viernes", true)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:text-white hover:border-slate-655 transition-all"
          >
            + Vie
          </button>
          <button
            type="button"
            onClick={() => handleMarkAllDay("sabado", true)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded hover:text-white hover:border-slate-655 transition-all"
          >
            + Sáb
          </button>
        </div>
        <div className="w-px h-4 bg-slate-800 hidden sm:block"></div>
        <div className="flex gap-2 text-[10px]">
          <button
            type="button"
            onClick={() => {
              handleMarkAllDay("lunes", false);
              handleMarkAllDay("miercoles", false);
              handleMarkAllDay("viernes", false);
              handleMarkAllDay("sabado", false);
            }}
            className="text-amber-500 underline hover:text-amber-400"
          >
            Limpiar filtros de la semana
          </button>
        </div>
      </div>

      {/* Filtro y Listado */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/60 overflow-hidden">
        
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30">
          <div className="flex items-center gap-2 text-slate-300">
            <ClipboardList className="w-5 h-5 text-amber-500 font-display" />
            <span className="font-semibold text-sm">Registro de Asistencias</span>
            <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-slate-800 rounded-full text-slate-400 border border-slate-700">
              {filteredStudents.length} de {students.length} alumnos
            </span>
          </div>

          {/* Campo buscador */}
          <div className="relative w-full md:max-w-xs shrink-0">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              id="attendance-search-input"
              type="text"
              placeholder="Buscar alumno o cinta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* Responsive layout: Table on desktop, interactive tap cards on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <th className="p-4 font-semibold text-center w-8">N°</th>
                <th className="p-4 font-semibold text-slate-300">Alumno (Judo-ka)</th>
                <th className="p-4 font-semibold text-slate-300 w-32">Cinta actual</th>
                <th className="p-4 font-semibold text-center w-20">Lunes</th>
                <th className="p-4 font-semibold text-center w-20">Miércoles</th>
                <th className="p-4 font-semibold text-center w-20">Viernes</th>
                <th className="p-4 font-semibold text-center w-20">Sábado</th>
                <th className="p-4 font-semibold text-slate-300 w-44">Observaciones y Nota</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((std, index) => {
                const rec = localRecords.find((r) => r.studentId === std.id);
                
                // Color formatting belts
                let beltBadgeStyle = "bg-slate-800 text-slate-300";
                if (std.belt.includes("Naranja")) beltBadgeStyle = "bg-amber-950/60 border border-amber-600/30 text-amber-500";
                else if (std.belt.includes("Verde")) beltBadgeStyle = "bg-emerald-950/60 border border-emerald-600/30 text-emerald-400";
                else if (std.belt.includes("Amarilla")) beltBadgeStyle = "bg-yellow-950/60 border border-yellow-600/30 text-yellow-500";
                else if (std.belt.includes("Morada")) beltBadgeStyle = "bg-purple-950/60 border border-purple-600/30 text-purple-400";
                else if (std.belt.includes("Azul")) beltBadgeStyle = "bg-blue-950/60 border border-blue-600/30 text-blue-400";
                else if (std.belt.includes("Marrón")) beltBadgeStyle = "bg-orange-950/60 border border-orange-600/30 text-orange-400";
                else if (std.belt.includes("Negra")) beltBadgeStyle = "bg-slate-950 border border-amber-500/30 text-amber-400 font-bold";

                let completedRhythm = rec?.days.lunes && rec?.days.miercoles && rec?.days.viernes && rec?.days.sabado;

                return (
                  <tr 
                    key={std.id} 
                    className={`border-b border-slate-850 hover:bg-slate-850/40 transition-colors ${
                      completedRhythm ? "bg-amber-500/[0.02]" : ""
                    }`}
                  >
                    <td className="p-4 text-center font-mono text-slate-600">{index + 1}</td>
                    <td className="p-4">
                      <div className="font-semibold text-white text-sm">{std.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">ID: {std.id}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold ${beltBadgeStyle}`}>
                        {std.belt}
                      </span>
                    </td>
                    
                    {/* Days */}
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={rec?.days.lunes || false}
                        onChange={() => handleToggleDay(std.id, "lunes")}
                        className="w-4.5 h-4.5 accent-amber-500 rounded bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={rec?.days.miercoles || false}
                        onChange={() => handleToggleDay(std.id, "miercoles")}
                        className="w-4.5 h-4.5 accent-amber-500 rounded bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={rec?.days.viernes || false}
                        onChange={() => handleToggleDay(std.id, "viernes")}
                        className="w-4.5 h-4.5 accent-amber-500 rounded bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={rec?.days.sabado || false}
                        onChange={() => handleToggleDay(std.id, "sabado")}
                        className="w-4.5 h-4.5 accent-amber-500 rounded bg-slate-950 border-slate-700 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Notes */}
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="Nota de retraso, lesión..."
                        value={rec?.notes || ""}
                        onChange={(e) => handleNoteChange(std.id, e.target.value)}
                        className="w-full px-3 py-1 bg-slate-950 border border-slate-800 rounded text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile View list layout with clean and large touch targets */}
        <div className="md:hidden divide-y divide-slate-850">
          {filteredStudents.map((std, index) => {
            const rec = localRecords.find((r) => r.studentId === std.id);
            
            let beltBadgeStyle = "bg-slate-850 text-slate-400";
            if (std.belt.includes("Naranja")) beltBadgeStyle = "bg-amber-950/60 text-amber-500";
            else if (std.belt.includes("Verde")) beltBadgeStyle = "bg-emerald-950/60 text-emerald-400";
            else if (std.belt.includes("Amarilla")) beltBadgeStyle = "bg-yellow-950/60 text-yellow-500";
            else if (std.belt.includes("Morada")) beltBadgeStyle = "bg-purple-950/60 text-purple-400";
            else if (std.belt.includes("Azul")) beltBadgeStyle = "bg-blue-950/60 text-blue-400";
            else if (std.belt.includes("Marrón")) beltBadgeStyle = "bg-orange-950/60 text-orange-400";
            else if (std.belt.includes("Negra")) beltBadgeStyle = "bg-slate-950 border border-amber-500/30 text-amber-400";

            return (
              <div key={std.id} className="p-4 space-y-3 bg-slate-900/40">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500">#{index + 1}</span>
                    <h4 className="font-semibold text-sm text-white">{std.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${beltBadgeStyle}`}>
                    {std.belt}
                  </span>
                </div>

                {/* Training days checklist box */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-2.5 rounded-lg border border-slate-850 text-center">
                  <button
                    type="button"
                    onClick={() => handleToggleDay(std.id, "lunes")}
                    className={`py-1.5 rounded text-xs font-semibold select-none flex flex-col items-center justify-center gap-1 ${
                      rec?.days.lunes
                        ? "bg-blue-950/50 text-blue-400 border border-blue-500/30 font-bold"
                        : "bg-slate-900 text-slate-500 border border-transparent"
                    }`}
                  >
                    <span>Lunes</span>
                    <span className={`w-2 h-2 rounded-full ${rec?.days.lunes ? 'bg-blue-400' : 'bg-slate-800'}`}></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleDay(std.id, "miercoles")}
                    className={`py-1.5 rounded text-xs font-semibold select-none flex flex-col items-center justify-center gap-1 ${
                      rec?.days.miercoles
                        ? "bg-blue-950/50 text-blue-400 border border-blue-500/30 font-bold"
                        : "bg-slate-900 text-slate-500 border border-transparent"
                    }`}
                  >
                    <span>Mié</span>
                    <span className={`w-2 h-2 rounded-full ${rec?.days.miercoles ? 'bg-blue-400' : 'bg-slate-800'}`}></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleDay(std.id, "viernes")}
                    className={`py-1.5 rounded text-xs font-semibold select-none flex flex-col items-center justify-center gap-1 ${
                      rec?.days.viernes
                        ? "bg-blue-950/50 text-blue-400 border border-blue-500/30 font-bold"
                        : "bg-slate-900 text-slate-500 border border-transparent"
                    }`}
                  >
                    <span>Vie</span>
                    <span className={`w-2 h-2 rounded-full ${rec?.days.viernes ? 'bg-blue-400' : 'bg-slate-800'}`}></span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleDay(std.id, "sabado")}
                    className={`py-1.5 rounded text-xs font-semibold select-none flex flex-col items-center justify-center gap-1 ${
                      rec?.days.sabado
                        ? "bg-amber-950/50 text-amber-500 border border-amber-500/30 font-bold"
                        : "bg-slate-900 text-slate-500 border border-transparent"
                    }`}
                  >
                    <span>Sáb</span>
                    <span className={`w-2 h-2 rounded-full ${rec?.days.sabado ? 'bg-amber-400' : 'bg-slate-800'}`}></span>
                  </button>
                </div>

                {/* Mobile note input */}
                <div>
                  <input
                    type="text"
                    placeholder="Escribir nota u observaciones..."
                    value={rec?.notes || ""}
                    onChange={(e) => handleNoteChange(std.id, e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder:text-slate-700 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No se encontraron alumnos con el criterio de búsqueda "{searchTerm}".
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 flex items-center justify-between text-xs text-slate-400">
        <div>
          Recuerda pulsar el botón <strong className="text-blue-400">"Guardar Cambios"</strong> arriba a la derecha para almacenar los reportes de la semana.
        </div>
      </div>
    </div>
  );
}
