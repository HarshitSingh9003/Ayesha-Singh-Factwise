import React, { useState, useEffect, useMemo } from 'react';
import { User, Patient, TemperatureRecord, DoctorNote } from '../types';
import { getPatients, getTemperatures, addDoctorNote, updatePatientStatus, checkFeverFree, getNotes } from '../services/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ClipboardList, Stethoscope, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface DoctorDashboardProps {
  user: User;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ user }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Doctors see active and those waiting for discharge completion
    setPatients(getPatients().filter(p => p.status === 'Active' || p.status === 'ReadyForDischarge'));
  }, [refreshTrigger]);

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const closeDetail = () => {
    setSelectedPatient(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-80px)] overflow-hidden flex flex-col">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>
        <p className="text-gray-500">Review patient vitals and approve discharges.</p>
      </header>

      <div className="flex-1 flex overflow-hidden gap-6">
        {/* Patient List */}
        <div className="w-full md:w-1/3 overflow-y-auto pr-2 space-y-4">
          {patients.map(patient => (
            <div 
                key={patient.id} 
                onClick={() => handlePatientClick(patient)}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedPatient?.id === patient.id ? 'border-teal-500 bg-teal-50 ring-1 ring-teal-500' : 'bg-white border-gray-200'}`}
            >
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <p className="text-sm text-gray-500">Bed: {patient.bedNumber} • Age: {patient.age}</p>
                    </div>
                    {patient.status === 'ReadyForDischarge' && (
                        <CheckCircle size={20} className="text-green-500" />
                    )}
                </div>
                <div className="mt-2 text-xs text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded">
                    {patient.condition}
                </div>
            </div>
          ))}
        </div>

        {/* Detail View */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-y-auto p-6 relative">
            {selectedPatient ? (
                <PatientDetailView 
                    patient={selectedPatient} 
                    doctorName={user.name} 
                    onClose={closeDetail} 
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Stethoscope size={64} className="mb-4 opacity-20" />
                    <p>Select a patient to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// --- Subcomponent for Detail View ---

interface DetailProps {
    patient: Patient;
    doctorName: string;
    onClose: () => void;
}

const PatientDetailView: React.FC<DetailProps> = ({ patient, doctorName, onClose }) => {
    const [note, setNote] = useState('');
    const [temps, setTemps] = useState<TemperatureRecord[]>([]);
    const [historyNotes, setHistoryNotes] = useState<DoctorNote[]>([]);
    const [canDischarge, setCanDischarge] = useState(false);

    useEffect(() => {
        setTemps(getTemperatures(patient.id));
        setHistoryNotes(getNotes(patient.id));
        setCanDischarge(checkFeverFree(patient.id));
    }, [patient.id]);

    const handleAddNote = () => {
        if (!note.trim()) return;
        addDoctorNote(patient.id, note, doctorName);
        setHistoryNotes(getNotes(patient.id));
        setNote('');
    };

    const handleApproveDischarge = () => {
        if (confirm(`Approve discharge for ${patient.name}?`)) {
            updatePatientStatus(patient.id, 'ReadyForDischarge');
            onClose();
        }
    };

    // Format data for Recharts
    const chartData = useMemo(() => {
        return temps.map(t => ({
            time: new Date(t.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: new Date(t.timestamp).toLocaleString(),
            temp: t.value
        })).slice(-14); // Last 14 records
    }, [temps]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">{patient.name}</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        ID: {patient.id} • Bed: {patient.bedNumber} • Admitted: {new Date(patient.admissionDate).toLocaleDateString()}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                    <X size={24} />
                </button>
            </div>

            {/* Discharge Action Area */}
            {patient.status !== 'ReadyForDischarge' ? (
                 <div className={`p-4 rounded-xl border flex items-center justify-between ${canDischarge ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-3">
                        {canDischarge ? <CheckCircle className="text-green-600" /> : <AlertTriangle className="text-amber-500" />}
                        <div>
                            <h4 className={`font-semibold ${canDischarge ? 'text-green-900' : 'text-gray-900'}`}>
                                {canDischarge ? 'Eligible for Discharge' : 'Observation Required'}
                            </h4>
                            <p className="text-sm text-gray-600">
                                {canDischarge ? 'Patient has been fever-free for 3 days.' : 'Patient does not meet the 3-day fever-free criteria yet.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleApproveDischarge}
                        disabled={!canDischarge}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${canDischarge ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        Approve Discharge
                    </button>
                 </div>
            ) : (
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-800 flex items-center">
                    <CheckCircle className="mr-2" /> Discharge Approved. Waiting for Admin processing.
                </div>
            )}

            {/* Chart */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Temperature Trend (Last 7 Days)</h3>
                <div className="h-64 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="time" tick={{fontSize: 12}} />
                                <YAxis domain={[35, 42]} tick={{fontSize: 12}} />
                                <Tooltip labelClassName="text-gray-800" wrapperStyle={{ outline: 'none' }} />
                                <ReferenceLine y={37.5} stroke="red" strokeDasharray="3 3" label={{ value: 'Fever Threshold', position: 'insideTopRight', fill: 'red', fontSize: 12 }} />
                                <Line type="monotone" dataKey="temp" stroke="#0d9488" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400">No temperature data recorded.</div>
                    )}
                </div>
            </div>

            {/* Notes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Add Clinical Note</h3>
                    <textarea 
                        className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                        placeholder="Patient condition updates, treatment changes..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    ></textarea>
                    <button 
                        onClick={handleAddNote}
                        className="mt-2 w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
                    >
                        Save Note
                    </button>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3">History</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {historyNotes.map(n => (
                            <div key={n.id} className="bg-gray-50 p-3 rounded-lg border text-sm">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{n.doctorName}</span>
                                    <span>{new Date(n.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-800">{n.note}</p>
                            </div>
                        ))}
                        {historyNotes.length === 0 && <p className="text-gray-400 text-sm italic">No previous notes.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};