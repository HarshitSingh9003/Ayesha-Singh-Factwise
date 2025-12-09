import { Patient, TemperatureRecord, DoctorNote, BedStats, OutcomeStats, PatientStatus } from '../types';

const STORAGE_KEYS = {
  PATIENTS: 'qtc_patients',
  TEMPS: 'qtc_temps',
  NOTES: 'qtc_notes',
};

const TOTAL_BEDS = 74;

// --- Helper to initialize data ---
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
    const initialPatients: Patient[] = [
      { id: '1', name: 'John Doe', age: 45, gender: 'Male', bedNumber: 'A-101', admissionDate: new Date(Date.now() - 86400000 * 5).toISOString(), condition: 'Mild Fever', status: 'Active' },
      { id: '2', name: 'Jane Smith', age: 32, gender: 'Female', bedNumber: 'A-102', admissionDate: new Date(Date.now() - 86400000 * 2).toISOString(), condition: 'Cough & Fatigue', status: 'Active' },
      { id: '3', name: 'Robert Brown', age: 60, gender: 'Male', bedNumber: 'B-201', admissionDate: new Date(Date.now() - 86400000 * 10).toISOString(), condition: 'Recovering', status: 'ReadyForDischarge', dischargeApprovedDate: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialPatients));

    // Seed some temps
    const initialTemps: TemperatureRecord[] = [
        { id: 't1', patientId: '1', value: 38.2, timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), recordedBy: 'Nurse Joy' },
        { id: 't2', patientId: '1', value: 37.8, timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), recordedBy: 'Nurse Joy' },
        { id: 't3', patientId: '2', value: 39.0, timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), recordedBy: 'Nurse Joy' },
        { id: 't4', patientId: '3', value: 36.5, timestamp: new Date(Date.now() - 86400000 * 3).toISOString(), recordedBy: 'Nurse Joy' },
        { id: 't5', patientId: '3', value: 36.6, timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), recordedBy: 'Nurse Joy' },
        { id: 't6', patientId: '3', value: 36.4, timestamp: new Date(Date.now() - 86400000 * 1).toISOString(), recordedBy: 'Nurse Joy' },
    ];
    localStorage.setItem(STORAGE_KEYS.TEMPS, JSON.stringify(initialTemps));
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify([]));
  }
};

seedData();

// --- Data Accessors ---

export const getPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return data ? JSON.parse(data) : [];
};

export const getPatientById = (id: string): Patient | undefined => {
  return getPatients().find(p => p.id === id);
};

export const getTemperatures = (patientId: string): TemperatureRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPS);
  const allTemps: TemperatureRecord[] = data ? JSON.parse(data) : [];
  return allTemps.filter(t => t.patientId === patientId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

export const getLatestTemperature = (patientId: string): TemperatureRecord | undefined => {
  const temps = getTemperatures(patientId);
  return temps.length > 0 ? temps[temps.length - 1] : undefined;
};

export const getNotes = (patientId: string): DoctorNote[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTES);
  const allNotes: DoctorNote[] = data ? JSON.parse(data) : [];
  return allNotes.filter(n => n.patientId === patientId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// --- Modifiers ---

export const addPatient = (patient: Omit<Patient, 'id' | 'status'>): void => {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: Date.now().toString(),
    status: 'Active',
  };
  patients.push(newPatient);
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const addTemperature = (patientId: string, value: number, recordedBy: string): void => {
  const data = localStorage.getItem(STORAGE_KEYS.TEMPS);
  const allTemps: TemperatureRecord[] = data ? JSON.parse(data) : [];
  
  const newTemp: TemperatureRecord = {
    id: Date.now().toString(),
    patientId,
    value,
    timestamp: new Date().toISOString(),
    recordedBy
  };
  
  allTemps.push(newTemp);
  localStorage.setItem(STORAGE_KEYS.TEMPS, JSON.stringify(allTemps));
};

export const addDoctorNote = (patientId: string, note: string, doctorName: string): void => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTES);
  const allNotes: DoctorNote[] = data ? JSON.parse(data) : [];
  
  const newNote: DoctorNote = {
    id: Date.now().toString(),
    patientId,
    note,
    timestamp: new Date().toISOString(),
    doctorName
  };
  
  allNotes.push(newNote);
  localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(allNotes));
};

export const updatePatientStatus = (patientId: string, status: PatientStatus): void => {
  const patients = getPatients();
  const index = patients.findIndex(p => p.id === patientId);
  if (index !== -1) {
    patients[index].status = status;
    if (status === 'ReadyForDischarge') {
      patients[index].dischargeApprovedDate = new Date().toISOString();
    }
    if (status === 'Discharged' || status === 'Deceased') {
        patients[index].dischargeCompletedDate = new Date().toISOString();
    }
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }
};

// --- Business Logic / Stats ---

export const getBedStats = (): BedStats => {
  const patients = getPatients();
  const occupied = patients.filter(p => p.status === 'Active' || p.status === 'ReadyForDischarge').length;
  return {
    total: TOTAL_BEDS,
    occupied,
    available: TOTAL_BEDS - occupied
  };
};

export const getOutcomeStats = (): OutcomeStats => {
  const patients = getPatients();
  const active = patients.filter(p => p.status === 'Active' || p.status === 'ReadyForDischarge').length;
  const recovered = patients.filter(p => p.status === 'Discharged').length;
  const deceased = patients.filter(p => p.status === 'Deceased').length;
  const totalClosed = recovered + deceased;
  
  return {
    active,
    recovered,
    deceased,
    successRate: totalClosed > 0 ? Math.round((recovered / totalClosed) * 100) : 0
  };
};

// Logic: Check if last 3 days of temps are < 37.5
export const checkFeverFree = (patientId: string): boolean => {
  const temps = getTemperatures(patientId);
  if (temps.length === 0) return false;

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const recentTemps = temps.filter(t => new Date(t.timestamp) >= threeDaysAgo);
  
  // Needs at least some records in the last 3 days to verify
  if (recentTemps.length === 0) return false; 

  return recentTemps.every(t => t.value < 37.5);
};