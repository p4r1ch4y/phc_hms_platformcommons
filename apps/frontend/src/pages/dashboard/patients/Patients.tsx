import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Activity, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    abhaId?: string;
    gender: string;
    dateOfBirth: string;
    phone?: string;
    address?: string;
    createdAt: string;
}

const Patients = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/patients');
            setPatients(response.data);
        } catch (err) {
            console.error('Failed to fetch patients:', err);
            setError('Failed to load patients');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.abhaId?.includes(searchTerm) ||
        p.phone?.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Patients</h1>
                    <p className="text-slate-500">Manage patient records and registrations.</p>
                </div>
                <Link
                    to="/dashboard/patients/new"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Register Patient
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, ABHA ID, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 py-2"
                    />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Patients Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading patients...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-slate-400">
                            <Users className="h-12 w-12" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No patients found</h3>
                        <p className="mt-1 text-sm text-slate-500">Get started by registering a new patient.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Name</th>
                                    <th className="px-6 py-3 font-medium">ABHA ID</th>
                                    <th className="px-6 py-3 font-medium">Gender/Age</th>
                                    <th className="px-6 py-3 font-medium">Contact</th>
                                    <th className="px-6 py-3 font-medium">Registered</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900">{patient.firstName} {patient.lastName}</div>
                                            <div className="text-xs text-slate-500">{patient.address || 'No address'}</div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-slate-600">
                                            {patient.abhaId || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {patient.gender}, {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}y
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {patient.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(patient.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-1 text-slate-400 hover:text-primary-600 transition-colors" title="View Details">
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                                <Link
                                                    to={`/dashboard/patients/${patient.id}/vitals`}
                                                    className="p-1 text-slate-400 hover:text-primary-600 transition-colors"
                                                    title="Record Vitals"
                                                >
                                                    <Activity className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Patients;
