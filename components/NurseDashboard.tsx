import React, { useState, useEffect } from 'react';
import { User, Patient, TemperatureRecord } from '../types';
import { getPatients, addTemperature, getLatestTemperature } from '../services/dataService';
import { Thermometer, User as UserIcon, CheckCircle, Clock } from 'lucide-react';

interface NurseDashboardProps {
  user: User;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({ user }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [tempInput, setTempInput] = useState<{ [key: string]: string }>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Only show Active patients to nurses
    setPatients(getPatients().filter(p => p.status === 'Active' || p.status === 'ReadyForDischarge'));
  }, [refreshTrigger]);

  const handleAddTemp = (patientId: string) => {
    const val = parseFloat(tempInput[patientId]);
    if (!isNaN(val) && val > 30 && val < 45) {
      addTemperature(patientId, val, user.name);
      setTempInput({ ...tempInput, [patientId]: '' });
      setRefreshTrigger(prev => prev + 1);
    } else {
      alert("Please enter a valid temperature (30-45°C)");
    }
  };

  const isTempTakenToday = (patientId: string): boolean => {
    const latest = getLatestTemperature(patientId);
    if (!latest) return false;
    const today = new Date().toDateString();
    const tempDate = new Date(latest.timestamp).toDateString();
    return today === tempDate;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Nurse Dashboard</h1>
        <p className="text-gray-500">Welcome, {user.name}. Here are your assigned patients.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map(patient => {
            const tempDone = isTempTakenToday(patient.id);
            const latestTemp = getLatestTemperature(patient.id);
            
            return (
                <div key={patient.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{patient.name}</h3>
                                    <span className="text-sm text-gray-500">Bed: <span className="font-medium text-gray-700">{patient.bedNumber}</span></span>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${tempDone ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {tempDone ? 'Temp Logged' : 'Pending'}
                            </span>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Last Temp: <span className="font-semibold">{latestTemp ? `${latestTemp.value}°C` : 'N/A'}</span></p>
                            {latestTemp && <p className="text-xs text-gray-400">{new Date(latestTemp.timestamp).toLocaleString()}</p>}
                        </div>
                    </div>

                    <div className="mt-4 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Add Today's Temp (°C)</label>
                        <div className="flex space-x-2">
                            <input 
                                type="number" 
                                step="0.1"
                                placeholder="36.5"
                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={tempInput[patient.id] || ''}
                                onChange={(e) => setTempInput({...tempInput, [patient.id]: e.target.value})}
                            />
                            <button 
                                onClick={() => handleAddTemp(patient.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center"
                                title="Save Temperature"
                            >
                                <Thermometer size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            );
        })}
        {patients.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
                No active patients assigned.
            </div>
        )}
      </div>
    </div>
  );
};