import React, { useState } from "react";
import { Search, Plus, UserCheck, ShieldAlert, Phone, Heart, Printer, Edit2, Trash2, X, Eye, FileText } from "lucide-react";
import { Student } from "../types";

interface StudentListProps {
  students: Student[];
  onAddStudentClick: () => void;
  onEditStudentClick: (student: Student) => void;
  onDeleteStudent: (studentId: string) => Promise<void>;
  onTriggerSinglePrint: (student: Student) => void;
}

const BELT_FILTER_OPTIONS = [
  "Todos",
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

export default function StudentList({
  students,
  onAddStudentClick,
  onEditStudentClick,
  onDeleteStudent,
  onTriggerSinglePrint,
}: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBeltFilter, setSelectedBeltFilter] = useState("Todos");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return "N/D";
    try {
      const birth = new Date(birthDateStr);
      const now = new Date();
      let age = now.getFullYear() - birth.getFullYear();
      const m = now.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
      }
      return `${age} años`;
    } catch {
      return "N/D";
    }
  };

  const formatDateValue = (dateStr?: string) => {
    if (!dateStr) return "N/D";
    try {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.phone.includes(searchTerm) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBelt = selectedBeltFilter === "Todos" || s.belt === selectedBeltFilter;
    
    return matchesSearch && matchesBelt;
  });

  const handleDelete = async (studentId: string, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente la matrícula de ${name}? Esta acción se sincronizará con la base de datos.`)) {
      await onDeleteStudent(studentId);
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
    }
  };

  return (
    <div className="space-y-6 no-print">
      
      {/* Botones y Búsqueda */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Filtros rápidos por cinta */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-2 lg:pb-0">
          {BELT_FILTER_OPTIONS.map((belt) => {
            const count = belt === "Todos" 
              ? students.length 
              : students.filter((s) => s.belt === belt).length;
            
            if (count === 0 && belt !== "Todos") return null; // Only show active belt pills

            const isActive = selectedBeltFilter === belt;
            return (
              <button
                key={belt}
                onClick={() => setSelectedBeltFilter(belt)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                {belt} ({count})
              </button>
            );
          })}
        </div>

        {/* Barra de búsqueda y botón añadir */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:max-w-md shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              id="student-search-input"
              type="text"
              placeholder="Buscar dojo-ka por nombre, fono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
            />
          </div>

          <button
            id="add-new-student-btn"
            onClick={onAddStudentClick}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-900/10"
          >
            <Plus className="w-4 h-4" />
            <span>Matricular Alumno</span>
          </button>
        </div>
      </div>

      {/* Grid del Listado de Estudiantes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map((student) => {
          
          let beltBadgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
          if (student.belt.includes("Naranja")) beltBadgeStyle = "bg-amber-950/40 border border-amber-600/30 text-amber-500";
          else if (student.belt.includes("Verde")) beltBadgeStyle = "bg-emerald-950/40 border border-emerald-600/30 text-emerald-400";
          else if (student.belt.includes("Amarilla")) beltBadgeStyle = "bg-yellow-950/40 border border-yellow-600/30 text-yellow-500";
          else if (student.belt.includes("Morada")) beltBadgeStyle = "bg-purple-950/40 border border-purple-600/30 text-purple-400";
          else if (student.belt.includes("Azul")) beltBadgeStyle = "bg-blue-950/40 border border-blue-600/30 text-blue-400";
          else if (student.belt.includes("Marrón")) beltBadgeStyle = "bg-orange-950/40 border border-orange-600/30 text-orange-400";
          else if (student.belt.includes("Negra")) beltBadgeStyle = "bg-slate-950 border border-amber-550/30 text-amber-500 font-bold";

          return (
            <div
              key={student.id}
              className="group p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-amber-500/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${beltBadgeStyle}`}>
                      {student.belt}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                      student.isMinor || (student.isMinor === undefined && parseInt(calculateAge(student.birthDate)) < 18)
                        ? "bg-blue-950/40 border-blue-600/30 text-blue-400"
                        : "bg-amber-950/40 border-amber-600/30 text-amber-500"
                    }`}>
                      {student.isMinor || (student.isMinor === undefined && parseInt(calculateAge(student.birthDate)) < 18) ? "Menor" : "Adulto"}
                    </span>
                  </div>
                  {student.allergies && student.allergies !== "Ninguna" && student.allergies !== "Ninguno" && (
                    <span 
                      className="px-1.5 py-0.5 rounded text-[9px] bg-rose-950/60 text-rose-400 border border-rose-500/20 flex items-center gap-1 font-semibold"
                      title={`Alergias: ${student.allergies}`}
                    >
                      <ShieldAlert className="w-3 h-3 text-rose-500" />
                      <span>Médico</span>
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-semibold text-white tracking-tight text-base group-hover:text-amber-400 transition-colors">
                    {student.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <span>{calculateAge(student.birthDate)}</span>
                    <span className="text-slate-650">•</span>
                    <span>Tipo {student.bloodType}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-850 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Contacto: {student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">Tutor: {student.emergencyContactName}</span>
                  </div>
                </div>
              </div>

              {/* Card triggers */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-850">
                <button
                  onClick={() => setSelectedStudent(student)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ver Ficha</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditStudentClick(student)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-450 hover:text-white transition-colors"
                    title="Editar datos de matrícula"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id, student.name)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-450 hover:text-rose-400 transition-colors"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No se encontraron alumnos matriculados con los filtros ingresados.
          </div>
        )}
      </div>

      {/* DETAILED STUDENT MODAL (Ficha de Matrícula Detallada) */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm no-print">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Elegant header banner */}
            <div className="h-1 bg-gradient-to-r from-amber-500 via-blue-600 to-amber-600 w-full shrink-0"></div>

            {/* Modal header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-display font-bold text-lg text-white">
                  Ficha Oficial de Matrícula
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-xl font-bold font-display text-white">{selectedStudent.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Cinta: <strong className="text-amber-500">{selectedStudent.belt}</strong> • Registrado el {formatDateValue(selectedStudent.registrationDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onTriggerSinglePrint(selectedStudent)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
                  >
                    <Printer className="w-4 h-4 text-amber-500" />
                    <span>Imprimir Ficha</span>
                  </button>
                  <button
                    onClick={() => {
                      onEditStudentClick(selectedStudent);
                      setSelectedStudent(null);
                    }}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>

              {/* Grid de Datos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                
                {/* Bloque 1: Personales */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-300 border-b border-slate-850 pb-1.5 uppercase text-xs tracking-wider text-amber-500">Datos Personales</h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Fecha Nacimiento:</span>
                      <span className="text-slate-200">{formatDateValue(selectedStudent.birthDate)} ({calculateAge(selectedStudent.birthDate)})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Tipo de Sangre:</span>
                      <span className="text-slate-200">{selectedStudent.bloodType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Teléfono:</span>
                      <span className="text-slate-200">{selectedStudent.phone || "No aportado"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Email:</span>
                      <span className="text-slate-200 truncate block">{selectedStudent.email || "No aportado"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Dirección:</span>
                      <span className="text-slate-200">{selectedStudent.address || "No aportada"}</span>
                    </div>

                    {(selectedStudent.isMinor || (selectedStudent.isMinor === undefined && parseInt(calculateAge(selectedStudent.birthDate)) < 18)) && (
                      <div className="mt-3 p-3 bg-blue-950/20 border border-blue-500/20 rounded-lg space-y-1">
                        <span className="text-blue-400 font-bold uppercase text-[9px] block">Representante Legal (Tutor):</span>
                        <div className="text-slate-200 font-semibold text-xs">{selectedStudent.tutorName || "No aportado"}</div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-400 mt-1 pt-1 border-t border-blue-500/10">
                          <div>Relación: <strong className="text-slate-300">{selectedStudent.tutorRelationship || "No declarada"}</strong></div>
                          <div>DUI: <strong className="text-slate-300">{selectedStudent.tutorDui || "No aportado"}</strong></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bloque 2: Médicos */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-300 border-b border-slate-850 pb-1.5 uppercase text-xs tracking-wider text-rose-500">Historial de Salud</h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Alergias:</span>
                      <span className={`font-semibold ${selectedStudent.allergies && selectedStudent.allergies !== "Ninguna" ? 'text-rose-400' : 'text-slate-300'}`}>
                        {selectedStudent.allergies || "Ninguna registrada"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Medicinas Actuales:</span>
                      <span className="text-slate-300">{selectedStudent.medications || "Ninguna"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Condiciones Crónicas:</span>
                      <span className="text-slate-300">{selectedStudent.chronicConditions || "Ninguna"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9px]">Tutor Legal / Contacto:</span>
                      <span className="text-slate-200 font-semibold">{selectedStudent.emergencyContactName} • Fono: {selectedStudent.emergencyContactPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Bloque 3: Consents */}
                <div className="md:col-span-2 space-y-2.5">
                  <h5 className="font-semibold text-slate-300 border-b border-slate-850 pb-1.5 uppercase text-xs tracking-wider text-emerald-500">Autorizaciones Aceptadas</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-center">
                      <div className="font-bold text-white mb-0.5">Uso Imagen:</div>
                      <span className={selectedStudent.mediaConsent ? "text-emerald-400 font-semibold" : "text-slate-550"}>
                        {selectedStudent.mediaConsent ? "Aceptado ✓" : "Declinado ✗"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-center">
                      <div className="font-bold text-white mb-0.5">Atención Médica:</div>
                      <span className={selectedStudent.medicalConsent ? "text-emerald-400 font-semibold" : "text-slate-550"}>
                        {selectedStudent.medicalConsent ? "Aceptado ✓" : "Declinado ✗"}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-center">
                      <div className="font-bold text-white mb-0.5">Liberación Responsabilidad:</div>
                      <span className={selectedStudent.waiverConsent ? "text-emerald-400 font-semibold" : "text-rose-450"}>
                        {selectedStudent.waiverConsent ? "Firmado ✓" : "Pendiente ✗"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloque 4: Signature check */}
                {selectedStudent.signatureData && (
                  <div className="md:col-span-2 space-y-2 p-3 bg-slate-950 rounded-lg border border-slate-850">
                    <span className="text-slate-500 uppercase font-bold text-[9px] block">Representación de la Firma Digital:</span>
                    <div className="h-24 bg-black border border-slate-800 rounded flex justify-center items-center overflow-hidden">
                      <img
                        src={selectedStudent.signatureData}
                        alt="Firma Digital"
                        className="max-h-full max-w-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 shrink-0 flex justify-end gap-2 text-xs">
              <button
                onClick={() => handleDelete(selectedStudent.id, selectedStudent.name)}
                className="px-4 py-2 text-rose-500 hover:text-white hover:bg-rose-950/40 rounded-lg transition-all"
              >
                Eliminar Matrícula
              </button>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
