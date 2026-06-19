import React, { useState, useRef, useEffect } from "react";
import { Save, RotateCcw, AlertTriangle, User, Heart, Shield, CheckCircle, Info } from "lucide-react";
import { Student } from "../types";

interface EnrollmentFormProps {
  student: Student | null; // null means "Create (Matricular Nuevo)"
  onSave: (student: Student) => Promise<void>;
  onCancel: () => void;
}

const BELT_OPTIONS = [
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

const BLOOD_TYPES = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "N/D"];

export default function EnrollmentForm({
  student,
  onSave,
  onCancel,
}: EnrollmentFormProps) {
  // Form fields
  const [name, setName] = useState("");
  const [belt, setBelt] = useState("Cinta Blanca");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [bloodType, setBloodType] = useState("O+");

  // Minor vs Adult fields
  const [isMinor, setIsMinor] = useState(true);
  const [tutorName, setTutorName] = useState("");
  const [tutorDui, setTutorDui] = useState("");
  const [tutorRelationship, setTutorRelationship] = useState("Padre");

  // Medical History
  const [allergies, setAllergies] = useState("");
  const [medications, setMedications] = useState("");
  const [chronicConditions, setChronicConditions] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Authorizations
  const [mediaConsent, setMediaConsent] = useState(true);
  const [medicalConsent, setMedicalConsent] = useState(true);
  const [waiverConsent, setWaiverConsent] = useState(false);
  const [signatureData, setSignatureData] = useState("");

  // Validation
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Signature canvas setup
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Initialize form
  useEffect(() => {
    if (student) {
      setName(student.name);
      setBelt(student.belt);
      setBirthDate(student.birthDate);
      setPhone(student.phone);
      setEmail(student.email);
      setAddress(student.address);
      setBloodType(student.bloodType);
      
      setIsMinor(student.isMinor ?? true);
      setTutorName(student.tutorName || "");
      setTutorDui(student.tutorDui || "");
      setTutorRelationship(student.tutorRelationship || "Padre");
      
      setAllergies(student.allergies || "");
      setMedications(student.medications || "");
      setChronicConditions(student.chronicConditions || "");
      setEmergencyContactName(student.emergencyContactName);
      setEmergencyContactPhone(student.emergencyContactPhone);

      setMediaConsent(student.mediaConsent);
      setMedicalConsent(student.medicalConsent);
      setWaiverConsent(student.waiverConsent);
      setSignatureData(student.signatureData || "");
      
      if (student.signatureData) {
        setHasDrawn(true);
      }
    } else {
      // Set default registration date to today
      const todayString = new Date().toISOString().split("T")[0];
      setBirthDate("");
      setName("");
      setBelt("Cinta Blanca");
      setPhone("");
      setEmail("");
      setAddress("");
      setBloodType("O+");
      setIsMinor(true);
      setTutorName("");
      setTutorDui("");
      setTutorRelationship("Padre");
      setAllergies("");
      setMedications("");
      setChronicConditions("");
      setEmergencyContactName("");
      setEmergencyContactPhone("");
      setMediaConsent(true);
      setMedicalConsent(true);
      setWaiverConsent(false);
      setSignatureData("");
      setHasDrawn(false);
    }
  }, [student]);

  // Auto-calculate minor/adult based on birthDate to deliver premium reactive assistant behavior
  useEffect(() => {
    if (!birthDate) return;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age >= 18) {
      setIsMinor(false);
    } else {
      setIsMinor(true);
    }
  }, [birthDate]);

  // Touch/Mouse draw methods
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#FFFFFF"; // Drawing in white ink on dark background in editor
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";

    const coords = getEventCoords(e, canvas);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Prevent default scrolling on mobile when drawing
    if (e.cancelable) {
      e.preventDefault();
    }

    const coords = getEventCoords(e, canvas);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    saveCanvasData();
  };

  const getEventCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    
    // Check touch vs mouse
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData("");
    setHasDrawn(false);
  };

  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Export data URL
    const dataUrl = canvas.toDataURL("image/png");
    setSignatureData(dataUrl);
  };

  // Re-render signature in canvas if editing student and canvas loaded
  useEffect(() => {
    if (student && student.signatureData && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = student.signatureData;
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
      }
    }
  }, [student, signatureData, canvasRef.current]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Basic validity validations
    if (!name.trim()) {
      setFormError("El Nombre Completo es obligatorio.");
      return;
    }
    if (!birthDate) {
      setFormError("La Fecha de Nacimiento es obligatoria.");
      return;
    }
    if (isMinor && !tutorName.trim()) {
      setFormError("Para alumnos menores de edad, el campo 'Nombre del Representante (Tutor Legal)' es obligatorio.");
      return;
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      setFormError("El Contacto de Emergencia (Nombre y Teléfono) es obligatorio.");
      return;
    }
    if (!waiverConsent) {
      setFormError("Debes marcar obligatoriamente la Exoneración de Responsabilidad física para poder entrenar karate.");
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrUpdatedStudent: Student = {
        id: student ? student.id : `stud_${Date.now()}`,
        name: name.trim(),
        belt,
        birthDate,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        bloodType,
        isMinor,
        tutorName: isMinor ? tutorName.trim() : undefined,
        tutorDui: isMinor ? tutorDui.trim() : undefined,
        tutorRelationship: isMinor ? tutorRelationship : undefined,
        allergies: allergies.trim(),
        medications: medications.trim(),
        chronicConditions: chronicConditions.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        mediaConsent,
        medicalConsent,
        waiverConsent,
        signatureData: hasDrawn ? signatureData : undefined,
        registrationDate: student ? student.registrationDate : new Date().toISOString().split("T")[0],
      };

      await onSave(newOrUpdatedStudent);
    } catch (e: any) {
      setFormError(e.message || "Ocurrió un error al guardar los datos.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-8 no-print">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-amber-500 rounded-full inline-block"></span>
            {student ? "Editar Matrícula" : "Nueva Matrícula de Alumno"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {student ? `Modificando registro de ${student.name}` : "Registra un nuevo dojo-ka en Kyudai Kai"}
          </p>
        </div>
      </div>

      {formError && (
        <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/30 flex items-center gap-3 text-sm text-rose-300">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{formError}</span>
        </div>
      )}

      {/* Sections Wrapper */}
      <div className="space-y-8">
        
        {/* Sección 1: Datos Personales */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-widest flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" />
              <span>1. Datos Personales del Alumno</span>
            </h3>

            {/* Minor/Adult Categorization Switch Panel styled in Gold & Blue */}
            <div className="bg-slate-950 p-1 rounded-lg border border-amber-500/20 flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsMinor(true)}
                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center ${
                  isMinor
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>👦 Menor de Edad</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMinor(false)}
                className={`px-3 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center ${
                  !isMinor
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <span>🧑‍🎓 Adulto (18+ años)</span>
              </button>
            </div>
          </div>

          {/* Feedback Label about Classification */}
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
            isMinor 
              ? "bg-blue-950/30 border-blue-500/20 text-blue-300" 
              : "bg-amber-950/20 border-amber-500/20 text-amber-300"
          }`}>
            <span className="text-base">{isMinor ? "👦" : "🧑‍🎓"}</span>
            <div>
              <strong>Categoría seleccionada: {isMinor ? "Alumno Menor de Edad" : "Alumno Adulto"}.</strong>
              <span className="block text-[11px] opacity-80 mt-0.5">
                {isMinor 
                  ? "Se requiere registrar los datos de un Representante Legal (Padre, Madre u otro Tutor) para la matrícula y firma legal."
                  : "El alumno asume su propio registro y firma de exoneración física. No requiere tutor legal."}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Nombre Completo del Alumno *</label>
              <input
                id="form-student-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Diego Alexander Guevara"
                className="w-full px-4 py-2 bg-slate-950 border border-slate-705 border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-lg text-white text-sm focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Grado - Cinta Actual *</label>
              <select
                id="form-student-belt"
                value={belt}
                onChange={(e) => setBelt(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
              >
                {BELT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Fecha de Nacimiento *</label>
              <input
                id="form-student-birthdate"
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Tipo de Sangre</label>
              <select
                id="form-student-blood"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
              >
                {BLOOD_TYPES.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                {isMinor ? "Teléfono de Alumno (Opcional)" : "Teléfono del Alumno *"}
              </label>
              <input
                id="form-student-phone"
                type="tel"
                required={!isMinor}
                placeholder="Ej. 7123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                {isMinor ? "Correo Electrónico (Opcional)" : "Correo Electrónico *"}
              </label>
              <input
                id="form-student-email"
                type="email"
                required={!isMinor}
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Dirección de Residencia del Alumno *</label>
              <textarea
                id="form-student-address"
                rows={2}
                required
                placeholder="Colonia, Pasaje, Casa, Barrio, San Miguel..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors resize-none"
              />
            </div>
          </div>
        </div>

        {/* Sección 1.5: Datos del Representante Legal (Solo visible si es MENOR) */}
        {isMinor && (
          <div className="p-4 bg-[#0a1122] border-l-4 border-amber-500 rounded-r-xl rounded-l-none space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>1.5 Datos del Representante Legal / Tutor (Obligatorio)</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-350 text-slate-300 uppercase mb-1">
                  Nombre Completo del Padre, Madre o Tutor *
                </label>
                <input
                  id="form-tutor-name"
                  type="text"
                  required={isMinor}
                  value={tutorName}
                  onChange={(e) => setTutorName(e.target.value)}
                  placeholder="Ej. Juan Alberto Guevara Portillo"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Parentesco con el Alumno *</label>
                <select
                  id="form-tutor-relationship"
                  value={tutorRelationship}
                  onChange={(e) => setTutorRelationship(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                >
                  <option value="Padre">Padre</option>
                  <option value="Madre">Madre</option>
                  <option value="Abuelo/a">Abuelo / Abuela</option>
                  <option value="Tio/a">Tío / Tía</option>
                  <option value="Hermano/a Mayor">Hermano / Hermana Mayor</option>
                  <option value="Tutor Legal">Tutor Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Número de DUI del Tutor *</label>
                <input
                  id="form-tutor-dui"
                  type="text"
                  required={isMinor}
                  value={tutorDui}
                  onChange={(e) => setTutorDui(e.target.value)}
                  placeholder="Ej. 01234567-8"
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 transition-colors"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-[11px] text-slate-400 mt-2">
                  ℹ️ Al registrar un menor de edad, el representante legal declara estar plenamente consciente de la exoneración física y delega la responsabilidad administrativa y comunicación de emergencias.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sección 2: Historial Médico */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span>2. Historial Médico del Alumno</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Alergias Conocidas</label>
              <input
                id="form-student-allergies"
                type="text"
                placeholder="Medicamentos, alimentos, ácaros, polvo, o 'Ninguna'"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Enfermedades Crónicas</label>
              <input
                id="form-student-chronic"
                type="text"
                placeholder="Ej. Asma, Diabetes, Cefaleas, o 'Ninguna'"
                value={chronicConditions}
                onChange={(e) => setChronicConditions(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Medicamentos Actuales</label>
              <input
                id="form-student-meds"
                type="text"
                placeholder="Indica si toma algún tratamiento actualmente, dosis y horario"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Contacto de Emergencia *</label>
              <input
                id="form-student-emergency-name"
                type="text"
                required
                placeholder="Nombre del Padre, Madre o Tutor"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Teléfono del Contacto de Emergencia *</label>
              <input
                id="form-student-emergency-phone"
                type="tel"
                required
                placeholder="Teléfono móvil o residencial"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sección 3: Autorizaciones Legales */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>3. Autorizaciones y Consentimientos Legales</span>
          </h3>
          
          <div className="space-y-3 bg-slate-950/50 p-4 border border-slate-800 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                id="form-consent-media"
                type="checkbox"
                checked={mediaConsent}
                onChange={(e) => setMediaConsent(e.target.checked)}
                className="mt-1 accent-amber-500 rounded bg-slate-950 border-slate-700 w-4 h-4 shrink-0 focus:ring-0"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block">Acepto Uso de Imagen y Promoción</strong>
                Autorizo a la Escuela Kyudai Kai a publicar contenido multimedia del alumno únicamente para fines deportivos, informativos y de difusión de logros en medios de organización.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer border-t border-slate-900 pt-3">
              <input
                id="form-consent-medical"
                type="checkbox"
                checked={medicalConsent}
                onChange={(e) => setMedicalConsent(e.target.checked)}
                className="mt-1 accent-amber-500 rounded bg-slate-950 border-slate-700 w-4 h-4 shrink-0 focus:ring-0"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white block">Autorizo Primeros Auxilios y Traslados Médicos</strong>
                En caso de alguna urgencia médica de fuerza mayor y no pudiendo contactar a los padres, concedo autorización al personal del dojo para trasladar al alumno al hospital o centro de salud más cercano.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer border-t border-slate-900 pt-3">
              <input
                id="form-consent-waiver"
                type="checkbox"
                required
                checked={waiverConsent}
                onChange={(e) => setWaiverConsent(e.target.checked)}
                className="mt-1 accent-amber-500 rounded bg-slate-950 border-slate-700 w-4 h-4 shrink-0 focus:ring-0"
              />
              <span className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-400 block font-bold">Exoneración de Responsabilidad Corporal * (Requerido)</strong>
                Acepto que la instrucción física de Karate es un deporte de contacto controlado. Libero de cualquier demanda económica o civil a Kyudai Kai por lesiones físicas recurrentes del entreno ordinario.
              </span>
            </label>
          </div>
        </div>

        {/* Sección 4: Firma Digital Innovadora */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>4. Firma Digital ({isMinor ? "Firma del Representante / Tutor Legal" : "Firma del Alumno Adulto"})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <p className="text-xs text-slate-400 leading-relaxed flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Diseño Móvil Intuitivo:</strong> {isMinor 
                    ? "El Representante (Padre/Madre/Tutor) debe dibujar su firma digital directamente en el cuadro negro con el dedo o mouse." 
                    : "El alumno adulto debe dibujar su firma digital directamente en el cuadro negro con la pantalla táctil o mouse."} Esta se incluirá en PDF para imprimir.
                </span>
              </p>

              {/* Signature Canvas Container */}
              <div className="relative border border-slate-705 border-amber-500/20 rounded-lg bg-black overflow-hidden flex flex-col justify-center items-center h-48 w-full select-none">
                <canvas
                  id="signature-canvas"
                  ref={canvasRef}
                  width={500}
                  height={192}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="sig-canvas w-full h-full cursor-crosshair"
                />
                
                {/* Clear tools */}
                <button
                  type="button"
                  onClick={clearSignature}
                  className="absolute bottom-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-750 text-amber-500 rounded text-xs flex items-center gap-1 border border-amber-500/10 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reiniciar Firma</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-850 rounded-lg flex flex-col justify-center space-y-2 border-amber-500/10">
              <div className="text-xs text-slate-400">Estado de Firma:</div>
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${hasDrawn ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className="text-sm font-semibold text-white">
                  {hasDrawn ? "Firma Registrada" : "Pendiente de Firma"}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                {isMinor 
                  ? "Esta firma representa el consentimiento legal del representante para que el menor entrene karate."
                  : "Esta firma representa tu propio consentimiento legal para la exoneración física y registro."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-800">
        <button
          id="form-cancel-btn"
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium text-sm rounded-lg transition-colors border border-slate-800"
        >
          Cancelar
        </button>
        <button
          id="form-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold hover:shadow-lg hover:shadow-amber-500/10 text-sm rounded-lg transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? "Guardando..." : "Guardar Matrícula"}</span>
        </button>
      </div>
    </form>
  );
}
