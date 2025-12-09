export type Role = 'nurse' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
}

export type PatientStatus = 'Active' | 'Discharged' | 'Deceased' | 'ReadyForDischarge';

export interface TemperatureRecord {
  id: string;
  patientId: string;
  value: number; // Celsius
  timestamp: string; // ISO string
  recordedBy: string;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  note: string;
  timestamp: string;
  doctorName: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bedNumber: string;
  admissionDate: string;
  condition: string;
  status: PatientStatus;
  dischargeApprovedDate?: string;
  dischargeCompletedDate?: string;
}

export interface BedStats {
  total: number;
  occupied: number;
  available: number;
}

export interface OutcomeStats {
  active: number;
  recovered: number;
  deceased: number;
  successRate: number;
}