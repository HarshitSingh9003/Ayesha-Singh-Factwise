import React, { useState, useEffect } from 'react';
import { User, Patient, BedStats, OutcomeStats } from '../types';
import { getPatients, addPatient, updatePatientStatus, getBedStats, getOutcomeStats } from '../services/dataService';
import { Activity, Users, Bed, CheckCircle, AlertOctagon, UserPlus } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'admit' | 'discharges'>('overview');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bedStats, setBedStats] = useState<BedStats>({ total: 0, occupied: 0, available: 0 });
  const [outcomeStats, setOutcomeStats] = useState<OutcomeStats>({ active: 0, recovered: 0, deceased: 0, successRate: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Form State
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bedNumber: '',
    condition: ''
  });

  useEffect(() => {
    setPatients(getPatients());
    setBedStats(getBedStats());
    setOutcomeStats(getOutcomeStats());
  }, [refreshTrigger]);

  const handleAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.bedNumber) return;

    if (bedStats.available <= 0) {
        alert("No beds available!");
        return;
    }

    addPatient({
        name: newPatient.name,
        age: parseInt(newPatient.age) || 0,
        gender: newPatient.gender,
        bedNumber: newPatient.bedNumber,
        admissionDate: new Date().toISOString(),
        condition: newPatient.condition
    });
    setNewPatient({ name: '', age: '', gender: 'Male', bedNumber: '', condition: '' });
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('overview');
  };

  const handleFinalizeDischarge = (id: string, type: 'Discharged' | 'Deceased') => {
      if(confirm(`Confirm status change to ${type}? This will free up the bed.`)) {
          updatePatientStatus(id, type);
          setRefreshTrigger(prev => prev + 1);
      }
  };

  const dischargeQueue = patients.filter(p => p.status === 'ReadyForDischarge');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Hospital Administration</h1>
            <p className="text-gray-500">Manage admissions, discharges, and facility capacity.</p>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Overview</button>
            <button onClick={() => setActiveTab('admit')} className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'admit' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>Admit Patient</button>
            <button onClick={() => setActiveTab('discharges')} className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${activeTab === 'discharges' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                Discharges
                {dischargeQueue.length > 0 && <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{dischargeQueue.length}</span>}
            </button>
        </div>
      </header>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
          <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard icon={<Bed size={24} />} title="Bed Occupancy" value={`${bedStats.occupied}/${bedStats.total}`} subtext={`${bedStats.available} available`} color="blue" />
                  <StatCard icon={<Activity size={24} />} title="Success Rate" value={`${outcomeStats.successRate}%`} subtext={`${outcomeStats.recovered} recovered`} color="green" />
                  <StatCard icon={<Users size={24} />} title="Active Patients" value={outcomeStats.active} subtext="Currently treated" color="indigo" />
                  <StatCard icon={<AlertOctagon size={24} />} title="Deceased" value={outcomeStats.deceased} subtext="Total fatalities" color="red" />
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
                  <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                          <thead>
                              <tr className="border-b text-gray-500">
                                  <th className="py-3 px-4">Patient</th>
                                  <th className="py-3 px-4">Bed</th>
                                  <th className="py-3 px-4">Status</th>
                                  <th className="py-3 px-4">Date</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y">
                              {patients.slice(-5).reverse().map(p => (
                                  <tr key={p.id}>
                                      <td className="py-3 px-4 font-medium">{p.name}</td>
                                      <td className="py-3 px-4">{p.bedNumber}</td>
                                      <td className="py-3 px-4">
                                          <span className={`px-2 py-1 rounded text-xs ${
                                              p.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                                              p.status === 'Discharged' ? 'bg-green-100 text-green-700' :
                                              p.status === 'ReadyForDischarge' ? 'bg-yellow-100 text-yellow-700' :
                                              'bg-gray-100 text-gray-700'
                                          }`}>{p.status === 'ReadyForDischarge' ? 'Pending Discharge' : p.status}</span>
                                      </td>
                                      <td className="py-3 px-4 text-gray-500">{new Date(p.admissionDate).toLocaleDateString()}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* Admit Tab */}
      {activeTab === 'admit' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center"><UserPlus className="mr-2" /> Admit New Patient</h2>
              <form onSubmit={handleAdmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input required type="number" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Bed</label>
                        <input required type="text" placeholder="e.g. A-104" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={newPatient.bedNumber} onChange={e => setNewPatient({...newPatient, bedNumber: e.target.value})} />
                    </div>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Initial Condition</label>
                      <input required type="text" placeholder="e.g. High fever, difficulty breathing" className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500" value={newPatient.condition} onChange={e => setNewPatient({...newPatient, condition: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors mt-4">
                      Complete Admission
                  </button>
              </form>
          </div>
      )}

      {/* Discharges Tab */}
      {activeTab === 'discharges' && (
          <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Pending Discharge Approvals</h2>
              {dischargeQueue.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-xl border border-gray-100 text-gray-500">
                      No patients are currently waiting for discharge processing.
                  </div>
              ) : (
                  dischargeQueue.map(p => (
                      <div key={p.id} className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-yellow-400 flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-lg">{p.name}</h3>
                              <p className="text-gray-600">Bed: {p.bedNumber} • Approved by Doctor on: {p.dischargeApprovedDate ? new Date(p.dischargeApprovedDate).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div className="flex space-x-3">
                              <button 
                                onClick={() => handleFinalizeDischarge(p.id, 'Deceased')}
                                className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                              >
                                  Mark Deceased
                              </button>
                              <button 
                                onClick={() => handleFinalizeDischarge(p.id, 'Discharged')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                              >
                                  Complete Discharge
                              </button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, subtext, color }: any) => {
    const colorClasses: any = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <p className="text-xs text-gray-400 mt-1">{subtext}</p>
            </div>
        </div>
    );
}