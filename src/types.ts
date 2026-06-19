export interface Student {
  id: string;
  name: string;
  belt: string; // e.g. "Cinta Amarilla.", "Cinta Verde", "Participante", etc.
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  bloodType: string;
  
  // Minor vs Adult classification fields
  isMinor?: boolean;
  tutorName?: string;
  tutorDui?: string; // Documento de Identidad del representante
  tutorRelationship?: string; // Padre, Madre, Abuelo, Tutor, etc.
  
  // Medical History
  allergies?: string;
  medications?: string;
  chronicConditions?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  
  // Legal Authorizations
  mediaConsent: boolean;
  medicalConsent: boolean;
  waiverConsent: boolean;
  signatureData?: string; // Base64 signature image or typed signature
  registrationDate: string;
}

export interface AttendanceRecord {
  id: string; // combination of studentId and weekKey (e.g. "studentId_2026-W25")
  studentId: string;
  weekKey: string; // e.g. "2026-W25"
  days: {
    lunes: boolean;
    miercoles: boolean;
    viernes: boolean;
    sabado: boolean;
  };
  notes?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
