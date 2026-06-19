import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Student, AttendanceRecord, SupabaseConfig } from "../types";
import { INITIAL_STUDENTS } from "./initialData";

const STORAGE_KEYS = {
  STUDENTS: "kyudaikai_students",
  ATTENDANCE: "kyudaikai_attendance",
  SUPABASE_CONFIG: "kyudaikai_supabase_config",
};

// SQL helper query to give to the user for Supabase setup
export const SUPABASE_SQL_SETUP = `-- 1. Tabla de Estudiantes (Matrícula)
create table if not exists students (
  id text primary key,
  name text not null,
  belt text not null,
  birth_date date not null,
  phone text,
  email text,
  address text,
  blood_type text,
  allergies text,
  medications text,
  chronic_conditions text,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  media_consent boolean default true,
  medical_consent boolean default true,
  waiver_consent boolean default true,
  signature_data text,
  is_minor boolean default true,
  tutor_name text,
  tutor_dui text,
  tutor_relationship text,
  registration_date date default current_date,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable row level security (optional)
alter table students enable row level security;
create policy "Allow public read/write" on students for all using (true);

-- 2. Tabla de Asistencia Semanal
create table if not exists attendance (
  id text primary key, -- p.ej. "studentId_2026-W25"
  student_id text references students(id) on delete cascade,
  week_key text not null, -- p.ej. "2026-W25"
  lunes boolean default false,
  miercoles boolean default false,
  viernes boolean default false,
  sabado boolean default false,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable row level security (optional)
alter table attendance enable row level security;
create policy "Allow public read/write" on attendance for all using (true);
`;

// Helper to get Supabase Client
let cachedClient: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  const saved = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || "",
        anonKey: parsed.anonKey || "",
        isConnected: !!(parsed.url && parsed.anonKey && parsed.isConnected),
      };
    } catch {
      // Ignore conversion error
    }
  }
  return { url: "", anonKey: "", isConnected: false };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(config));
  cachedClient = null; // Reset cache so next getClient rebuilds it
}

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      // Ensure only valid URLs are initialized
      new URL(config.url);
      cachedClient = createClient(config.url, config.anonKey, {
        auth: { persistSession: false },
      });
      return cachedClient;
    } catch (e) {
      console.error("URL de Supabase inválida:", e);
      return null;
    }
  }
  return null;
}

// Check connection to Supabase
export async function testSupabaseConnection(url: string, key: string): Promise<boolean> {
  try {
    const client = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await client.from("students").select("id").limit(1);
    if (error && error.code !== "PGRST116") { // Group/Table Missing error can be accepted as connected. Relational error codes.
      console.warn("Supabase respondió con error, pero el cliente conecta:", error.message);
      // If it is just that the table does not exist (PGRST116 or similar), that still means the key/url is right.
      // But let's check code. If code is invalid API key, it is false.
      if (error.message.includes("apiKey") || error.message.includes("Invalid REST Key")) {
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error("Error al conectar con Supabase:", e);
    return false;
  }
}

// Core Student management
export async function loadStudents(): Promise<Student[]> {
  // Load local
  const localData = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  let students: Student[] = [];

  if (localData) {
    try {
      students = JSON.parse(localData);
    } catch (e) {
      console.error("Error parsing local students", e);
    }
  }

  // Seed default students if empty
  if (students.length === 0) {
    students = [...INITIAL_STUDENTS];
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  }

  // Sync with Supabase if active
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();
  if (supabase && config.isConnected) {
    try {
      const { data, error } = await supabase.from("students").select("*");
      if (!error && data && data.length > 0) {
        // Map DB attributes back to camelCase
        const mapped: Student[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          belt: d.belt,
          birthDate: d.birth_date,
          phone: d.phone,
          email: d.email,
          address: d.address,
          bloodType: d.blood_type,
          allergies: d.allergies,
          medications: d.medications,
          chronicConditions: d.chronic_conditions,
          emergencyContactName: d.emergency_contact_name,
          emergencyContactPhone: d.emergency_contact_phone,
          mediaConsent: d.media_consent,
          medicalConsent: d.medical_consent,
          waiverConsent: d.waiver_consent,
          signatureData: d.signature_data,
          registrationDate: d.registration_date,
          isMinor: d.is_minor,
          tutorName: d.tutor_name,
          tutorDui: d.tutor_dui,
          tutorRelationship: d.tutor_relationship,
        }));
        
        // Merge - Supabase takes precedence but keep local ones if not in DB
        const mergedMap = new Map<string, Student>();
        students.forEach((s) => mergedMap.set(s.id, s));
        mapped.forEach((s) => mergedMap.set(s.id, s));
        
        const mergedList = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(mergedList));
        return mergedList;
      }
    } catch (e) {
      console.warn("Fallo la sincronización con Supabase. Usando datos locales.", e);
    }
  }

  return students;
}

export async function saveStudent(student: Student): Promise<void> {
  // Save local
  const current = await loadStudents();
  const index = current.findIndex((s) => s.id === student.id);
  if (index >= 0) {
    current[index] = student;
  } else {
    current.push(student);
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(current));

  // Sync to Supabase if active
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();
  if (supabase && config.isConnected) {
    try {
      const dbObj = {
        id: student.id,
        name: student.name,
        belt: student.belt,
        birth_date: student.birthDate,
        phone: student.phone,
        email: student.email,
        address: student.address,
        blood_type: student.bloodType,
        allergies: student.allergies || "",
        medications: student.medications || "",
        chronic_conditions: student.chronicConditions || "",
        emergency_contact_name: student.emergencyContactName,
        emergency_contact_phone: student.emergencyContactPhone,
        media_consent: student.mediaConsent,
        medical_consent: student.medicalConsent,
        waiver_consent: student.waiverConsent,
        signature_data: student.signatureData || "",
        registration_date: student.registrationDate,
        is_minor: student.isMinor ?? false,
        tutor_name: student.tutorName || "",
        tutor_dui: student.tutorDui || "",
        tutor_relationship: student.tutorRelationship || "",
      };

      const { error } = await supabase.from("students").upsert(dbObj);
      if (error) {
        throw new Error(error.message);
      }
    } catch (e) {
      console.error("Error al guardar estudiante en Supabase:", e);
    }
  }
}

export async function deleteStudent(studentId: string): Promise<void> {
  const current = await loadStudents();
  const updated = current.filter((s) => s.id !== studentId);
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();
  if (supabase && config.isConnected) {
    try {
      await supabase.from("students").delete().eq("id", studentId);
    } catch (e) {
      console.error("Error al borrar estudiante en Supabase:", e);
    }
  }
}

// Core Attendance management
export async function loadAttendance(): Promise<AttendanceRecord[]> {
  const localData = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  let records: AttendanceRecord[] = [];

  if (localData) {
    try {
      records = JSON.parse(localData);
    } catch (e) {
      console.error("Error parsing attendance records", e);
    }
  }

  // Sync with Supabase if active
  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();
  if (supabase && config.isConnected) {
    try {
      const { data, error } = await supabase.from("attendance").select("*");
      if (!error && data && data.length > 0) {
        const mapped: AttendanceRecord[] = data.map((d: any) => ({
          id: d.id,
          studentId: d.student_id,
          weekKey: d.week_key,
          days: {
            lunes: d.lunes,
            miercoles: d.miercoles,
            viernes: d.viernes,
            sabado: d.sabado,
          },
          notes: d.notes,
        }));

        const mergedMap = new Map<string, AttendanceRecord>();
        records.forEach((r) => mergedMap.set(r.id, r));
        mapped.forEach((r) => mergedMap.set(r.id, r));

        const mergedList = Array.from(mergedMap.values());
        localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(mergedList));
        return mergedList;
      }
    } catch (e) {
      console.warn("Error cargando asistencia de Supabase. Usando local.", e);
    }
  }

  return records;
}

export async function saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
  const current = await loadAttendance();
  const index = current.findIndex((r) => r.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.push(record);
  }
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(current));

  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();
  if (supabase && config.isConnected) {
    try {
      const dbObj = {
        id: record.id,
        student_id: record.studentId,
        week_key: record.weekKey,
        lunes: record.days.lunes,
        miercoles: record.days.miercoles,
        viernes: record.days.viernes,
        sabado: record.days.sabado,
        notes: record.notes || "",
      };

      const { error } = await supabase.from("attendance").upsert(dbObj);
      if (error) {
        throw new Error(error.message);
      }
    } catch (e) {
      console.error("Error al guardar asistencia en Supabase:", e);
    }
  }
}
export async function bulkSaveAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  const current = await loadAttendance();
  const recordMap = new Map<string, AttendanceRecord>();
  current.forEach(r => recordMap.set(r.id, r));
  records.forEach(r => recordMap.set(r.id, r));
  
  const updated = Array.from(recordMap.values());
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));

  const supabase = getSupabaseClient();
  const config = getSupabaseConfig();
  if (supabase && config.isConnected) {
    try {
      const dbObjects = records.map(record => ({
        id: record.id,
        student_id: record.studentId,
        week_key: record.weekKey,
        lunes: record.days.lunes,
        miercoles: record.days.miercoles,
        viernes: record.days.viernes,
        sabado: record.days.sabado,
        notes: record.notes || "",
      }));

      const { error } = await supabase.from("attendance").upsert(dbObjects);
      if (error) {
        throw new Error(error.message);
      }
    } catch (e) {
      console.error("Error cargando múltiples asistencias en Supabase:", e);
    }
  }
}
