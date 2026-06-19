import React from "react";
import { Student, AttendanceRecord } from "../types";

interface PrintSheetProps {
  type: "enrollment" | "attendance";
  student: Student | null;
  students: Student[];
  attendance: AttendanceRecord[];
  weekKey: string;
}

export default function PrintSheet({
  type,
  student,
  students,
  attendance,
  weekKey,
}: PrintSheetProps) {
  
  // Custom simple date formatter helper to avoid dependency issues
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

  if (type === "enrollment" && student) {
    return (
      <div id="print-section" className="hidden p-8 font-sans text-black bg-white">
        {/* Dojō Header Logo Area */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Elegant SVG Dojo Logo */}
            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-gray-50 shrink-0">
              <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="2" />
                <path d="M25,65 Q50,45 75,65" stroke="black" strokeWidth="3" fill="none" />
                <circle cx="50" cy="38" r="14" fill="black" />
                <path d="M50,48 L50,75 M38,58 L62,58 M35,70 L50,58 L65,70" stroke="black" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-display">ESCUELA DE KARATE KYUDAI KAI</h1>
              <p className="text-xs font-mono uppercase tracking-widest text-gray-600">San Miguel, El Salvador • Disciplina y Carácter</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1.5 border-2 border-black text-xs font-bold uppercase">
              Hoja de Matrícula
            </span>
            <p className="text-[10px] mt-1 text-gray-500 font-mono">FECHA REGISTRO: {formatDateValue(student.registrationDate)}</p>
          </div>
        </div>

        {/* 1. Datos Personales */}
        <div className="mb-6">
          <h2 className="text-xs bg-gray-200 px-2 py-1 font-bold uppercase tracking-wider mb-3 leading-none border-l-4 border-black">
            1. DATOS PERSONALES DEL ALUMNO
          </h2>
          <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm">
            <div className="col-span-2 border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">NOMBRE COMPLETO:</span>
              <span className="font-semibold">{student.name}</span>
            </div>
            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">GRADO - CINTA:</span>
              <span className="font-bold text-blue-800">{student.belt}</span>
            </div>

            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">FECHA DE NACIMIENTO:</span>
              <span>{formatDateValue(student.birthDate)}</span>
            </div>
            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">EDAD:</span>
              <span>{calculateAge(student.birthDate)}</span>
            </div>
            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">TIPO DE SANGRE:</span>
              <span className="font-bold">{student.bloodType}</span>
            </div>

            <div className="col-span-2 border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">DIRECCIÓN DE RESIDENCIA:</span>
              <span>{student.address}</span>
            </div>
            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">TELÉFONO DE CONTACTO:</span>
              <span>{student.phone}</span>
            </div>

            <div className="col-span-3 border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-500 block">CORREO ELECTRÓNICO:</span>
              <span>{student.email || "No registrado"}</span>
            </div>
          </div>
        </div>

        {/* 1.5 Datos del Representante Legal (Si es Menor) */}
        {(student.isMinor || (student.isMinor === undefined && parseInt(calculateAge(student.birthDate)) < 18)) && (
          <div className="mb-6">
            <h2 className="text-xs bg-gray-200 px-2 py-1 font-bold uppercase tracking-wider mb-2 leading-none border-l-4 border-blue-900 text-blue-950">
              1.5 REPRESENTANTE LEGAL / TUTOR (REQUERIDO POR MINORÍA DE EDAD)
            </h2>
            <div className="grid grid-cols-3 gap-y-3 gap-x-4 text-sm bg-blue-50/40 p-3 rounded border border-blue-200">
              <div className="col-span-2 border-b border-gray-350 pb-1">
                <span className="text-[10px] font-bold text-blue-900 block">NOMBRE COMPLETO DEL TUTOR:</span>
                <span className="font-semibold text-gray-900">{student.tutorName || "No registrado"}</span>
              </div>
              <div className="border-b border-gray-350 pb-1">
                <span className="text-[10px] font-bold text-blue-900 block">PARENTESCO / RELACIÓN:</span>
                <span className="font-semibold text-gray-900">{student.tutorRelationship || "No registrado"}</span>
              </div>
              <div className="col-span-1 border-b border-gray-350 pb-1">
                <span className="text-[10px] font-bold text-blue-900 block">DOCUMENTO DE IDENTIDAD (DUI):</span>
                <span className="font-mono text-gray-900">{student.tutorDui || "No especificado"}</span>
              </div>
              <div className="col-span-2 border-b border-gray-350 pb-1">
                <span className="text-[10px] font-bold text-blue-900 block">TELÉFONO DE CONTACTO PRINCIPAL:</span>
                <span className="text-gray-900">{student.emergencyContactPhone} (Contacto de Emergencia)</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Historial Médico */}
        <div className="mb-6">
          <h2 className="text-xs bg-gray-200 px-2 py-1 font-bold uppercase tracking-wider mb-3 leading-none border-l-4 border-black">
            2. HISTORIAL MÉDICO Y DE SALUD
          </h2>
          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className="border-b border-gray-300 pb-1 col-span-2">
              <span className="text-[10px] font-bold text-gray-400 block">ALERGIAS REPORTADAS:</span>
              <p className="mt-0.5">{student.allergies || "Ninguna reportada"}</p>
            </div>

            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-400 block">MEDICAMENTOS ACTUALES:</span>
              <p className="mt-0.5">{student.medications || "Ninguno"}</p>
            </div>
            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-400 block">ENFERMEDADES CRÓNICAS:</span>
              <p className="mt-0.5">{student.chronicConditions || "Ninguna"}</p>
            </div>

            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-400 block">CONTACTO DE EMERGENCIA:</span>
              <span className="font-semibold">{student.emergencyContactName}</span>
            </div>
            <div className="border-b border-gray-300 pb-1">
              <span className="text-[10px] font-bold text-gray-400 block">TELÉFONO DE EMERGENCIA:</span>
              <span className="font-semibold">{student.emergencyContactPhone}</span>
            </div>
          </div>
        </div>

        {/* 3. Consentimiento y Autorizaciones Legales */}
        <div className="mb-10">
          <h2 className="text-xs bg-gray-200 px-2 py-1 font-bold uppercase tracking-wider mb-3 leading-none border-l-4 border-black">
            3. CONSENTIMIENTOS Y AUTORIZACIONES LEGALES
          </h2>
          <div className="space-y-2 text-xs leading-relaxed text-gray-700">
            <div className="flex gap-2 items-start border-l-2 border-gray-300 pl-2">
              <span className="text-lg leading-none select-none">{student.mediaConsent ? "☑" : "☐"}</span>
              <p>
                <strong>Consentimiento de Imagen:</strong> Autorizo a la Escuela de Karate Kyudai Kai a publicar fotografías y filmaciones del alumno durante las prácticas, torneos y actividades oficiales para uso exclusivo de promoción interna y redes sociales del dojo.
              </p>
            </div>
            <div className="flex gap-2 items-start border-l-2 border-gray-300 pl-2">
              <span className="text-lg leading-none select-none">{student.medicalConsent ? "☑" : "☐"}</span>
              <p>
                <strong>Autorización Médica:</strong> Autorizo al equipo directivo del dojo a tomar medidas médicas de emergencia oportunas, incluyendo traslados a centros asistenciales, si ocurriera un accidente en ausencia de padres o de su tutor legal.
              </p>
            </div>
            <div className="flex gap-2 items-start border-l-2 border-gray-300 pl-2">
              <span className="text-lg leading-none select-none">{student.waiverConsent ? "☑" : "☐"}</span>
              <p>
                <strong>Exoneración de Responsabilidad:</strong> Entiendo que la práctica de artes marciales conlleva un riesgo inherente de lesiones deportivas corporales leves. Exonero al dojo Kyudai Kai y a sus instructores de reclamaciones por incidentes ocurridos bajo práctica deportiva regular y cumplimiento de normas de seguridad.
              </p>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t border-gray-300">
          <div className="text-center flex flex-col justify-end items-center">
            {student.signatureData ? (
              <img
                src={student.signatureData}
                alt="Firma del Tutor/Alumno"
                className="max-h-24 max-w-xs mb-1 border-b border-gray-400 py-1"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-16 w-48 border-b border-line border-dashed border-gray-400 mb-2"></div>
            )}
            <span className="text-xs font-bold block">FIRMA DEL PADRE / TUTOR / ALUMNO</span>
            <span className="text-[10px] text-gray-500">Documento Firmado Digitalmente en Tablet/Móvil</span>
          </div>

          <div className="text-center flex flex-col justify-end items-center">
            <div className="h-16 w-48 border-b border-line border-dashed border-gray-400 mb-2 flex items-center justify-center">
              {/* Elegant Small stamp signature of school */}
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest">[ SELLO DOJO ]</span>
            </div>
            <span className="text-xs font-bold block">AUTORIZACIÓN DIRECCIÓN DOJO</span>
            <span className="text-[10px] text-gray-500">Kyudai Kai Karate Do - San Miguel</span>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-[10px] text-gray-400 font-mono">
          Escuela de Karate Kyudai Kai • Barrio El Centro, Avenida Roosevelt, San Miguel, El Salvador. Tel: 7123-4567 • Generado automáticamente.
        </div>
      </div>
    );
  }

  // Attendance Sheet Printing View
  if (type === "attendance") {
    // Parse week details
    const weekYear = weekKey.split("-W")[0];
    const weekNum = weekKey.split("-W")[1];

    return (
      <div id="print-section" className="hidden p-8 font-sans text-black bg-white">
        {/* Dojō Header Logo Area */}
        <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center bg-gray-50 shrink-0">
              <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="2" />
                <path d="M25,65 Q50,45 75,65" stroke="black" strokeWidth="3" fill="none" />
                <circle cx="50" cy="38" r="14" fill="black" />
                <path d="M50,48 L50,75 M38,58 L62,58 M35,70 L50,58 L65,70" stroke="black" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-display">ESCUELA DE KARATE KYUDAI KAI</h1>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-600">San Miguel, El Salvador • Control de Registro Semanal</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 border border-black text-xs font-bold uppercase bg-gray-150">
              Registro de Asistencia
            </span>
            <p className="text-[10px] mt-1 text-gray-600 font-semibold font-mono">SEMANA: {weekNum}, AÑO: {weekYear}</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="border border-black p-3 mb-4 text-xs bg-gray-55 text-gray-700">
          <strong className="text-black uppercase">Control de Disciplina Semanal:</strong> Este listado representa la plantilla de asistencia oficial para la semana correspondiente. Los entrenamientos son de alta intensidad. Registre el estado del alumno en la bitácora física y administrativa semanalmente.
        </div>

        {/* Table representation */}
        <table className="w-full text-xs text-left border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100 font-bold uppercase text-[9px] border-b border-gray-400">
              <th className="p-2 border border-gray-400 w-8 text-center">N°</th>
              <th className="p-2 border border-gray-400">Nombre del Judo-ka (Alumno)</th>
              <th className="p-2 border border-gray-400 w-24">Cinta / Grado</th>
              <th className="p-2 border border-gray-400 w-12 text-center">LUN</th>
              <th className="p-2 border border-gray-400 w-12 text-center">MIÉ</th>
              <th className="p-2 border border-gray-400 w-12 text-center">VIE</th>
              <th className="p-2 border border-gray-400 w-12 text-center">SÁB</th>
              <th className="p-2 border border-gray-400 text-center">Observaciones y Notas</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const record = attendance.find((r) => r.studentId === student.id && r.weekKey === weekKey);
              
              return (
                <tr key={student.id} className="border-b border-gray-400 hover:bg-gray-50">
                  <td className="p-1.5 border border-gray-400 text-center text-gray-500 font-mono">{idx + 1}</td>
                  <td className="p-1.5 border border-gray-400 font-semibold text-gray-800">{student.name}</td>
                  <td className="p-1.5 border border-gray-400 text-gray-600">{student.belt}</td>
                  <td className="p-1.5 border border-gray-400 text-center text-sm">
                    {record?.days.lunes ? "X" : ""}
                  </td>
                  <td className="p-1.5 border border-gray-400 text-center text-sm">
                    {record?.days.miercoles ? "X" : ""}
                  </td>
                  <td className="p-1.5 border border-gray-400 text-center text-sm">
                    {record?.days.viernes ? "X" : ""}
                  </td>
                  <td className="p-1.5 border border-gray-400 text-center text-sm">
                    {record?.days.sabado ? "X" : ""}
                  </td>
                  <td className="p-1.5 border border-gray-400 text-gray-500 font-mono text-[9px] italic max-w-[150px] truncate">
                    {record?.notes || ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Stats segment */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="border border-gray-400 p-3 text-center">
            <span className="text-[10px] block text-gray-500 font-bold uppercase">ALUMNOS ACTIVOS</span>
            <span className="text-xl font-bold font-mono">{students.length}</span>
          </div>
          <div className="border border-gray-400 p-3 text-center">
            <span className="text-[10px] block text-gray-500 font-bold uppercase">TOTAL ASISTENCIAS REGISTRADAS</span>
            <span className="text-xl font-bold font-mono text-blue-900">
              {attendance.filter((r) => r.weekKey === weekKey).reduce((acc, current) => {
                let currentDaySum = 0;
                if (current.days.lunes) currentDaySum++;
                if (current.days.miercoles) currentDaySum++;
                if (current.days.viernes) currentDaySum++;
                if (current.days.sabado) currentDaySum++;
                return acc + currentDaySum;
              }, 0)}
            </span>
          </div>
          <div className="border border-gray-400 p-3 text-center">
            <span className="text-[10px] block text-gray-500 font-bold uppercase">RENDIMIENTO SEMANAL PROMEDIO</span>
            <span className="text-xl font-bold font-mono text-emerald-800">
              {Math.round(
                (attendance.filter((r) => r.weekKey === weekKey).reduce((acc, current) => {
                  let activeDays = 0;
                  if (current.days.lunes) activeDays++;
                  if (current.days.miercoles) activeDays++;
                  if (current.days.viernes) activeDays++;
                  if (current.days.sabado) activeDays++;
                  return acc + (activeDays / 4);
                }, 0) / (students.length || 1)) * 100
              )}%
            </span>
          </div>
        </div>

        {/* Validation stamps */}
        <div className="grid grid-cols-2 gap-12 mt-20">
          <div className="text-center flex flex-col justify-end items-center">
            <div className="h-12 w-48 border-b border-dashed border-gray-400 mb-2"></div>
            <span className="text-xs font-bold block">FIRMA INSTRUCTOR PRINCIPAL</span>
            <span className="text-[9px] text-gray-500">Sensei Kyudai Kai - Certificado</span>
          </div>

          <div className="text-center flex flex-col justify-end items-center">
            <div className="h-12 w-48 border-b border-dashed border-gray-400 mb-2"></div>
            <span className="text-xs font-bold block">FIRMA AUDITADO ADMINISTRACIÓN</span>
            <span className="text-[9px] text-gray-500">Control semanal de asistencia</span>
          </div>
        </div>

        <div className="mt-16 text-center text-[9px] text-gray-400 font-mono border-t border-gray-300 pt-4">
          Kyudai Kai Karate Do • San Miguel, El Salvador. Todos los derechos reservados.
        </div>
      </div>
    );
  }

  return null;
}
