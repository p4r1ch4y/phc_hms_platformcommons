import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, FileText, User, Calendar, Phone, MapPin, Edit2, X } from 'lucide-react';
import api from '../../../api/client';

interface Vitals {
    id: string;
    temperature?: number;
    bloodPressure?: string;
    pulse?: number;
    weight?: number;
    height?: number;
    bloodSugar?: number;
    spo2?: number;
    riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    triageNote?: string;
    recordedAt: string;
    recordedBy: string;
}

interface Consultation {
    id: string;
    diagnosis?: string;
    prescription?: string;
    status: string;
    createdAt: string;
    doctorId: string;
}

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    abhaId?: string;
    gender: string;
    dateOfBirth: string;
    phone?: string;
    address?: string;
    vitals: Vitals[];
    consultations: Consultation[];
}

const PatientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'vitals' | 'consultations'>('vitals');

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        abhaId: ''
    });

    const fetchPatientDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/patients/${id}`);
            setPatient(response.data);
            setEditForm({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                phone: response.data.phone || '',
                address: response.data.address || '',
                abhaId: response.data.abhaId || ''
            });
        } catch (err) {
            console.error('Failed to fetch patient details:', err);
            setError('Failed to load patient details');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPatientDetails();
    }, [fetchPatientDetails]);

    const handleUpdatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Updating patient with form data:', editForm);
        try {
            await api.put(`/patients/${id}`, {
                ...editForm,
                dateOfBirth: patient?.dateOfBirth, // Keep existing DOB and Gender for now
                gender: patient?.gender
            });
            setIsEditModalOpen(false);
            fetchPatientDetails(); // Refresh data
        } catch (err) {
            console.error('Failed to update patient:', err);
            alert('Failed to update patient details');
        }
    };

    const handleUpdateStatus = async (consultationId: string, newStatus: string) => {
        try {
            await api.put(`/consultations/${consultationId}/diagnosis`, {
                status: newStatus
            });
            fetchPatientDetails(); // Refresh data
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update consultation status');
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
            case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'MODERATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading patient details...</div>;
    if (error || !patient) return <div className="p-8 text-center text-red-500">{error || 'Patient not found'}</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto relative">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/patients')}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{patient.firstName} {patient.lastName}</h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {patient.gender}, {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}y
                            </span>
                            {patient.phone && (
                                <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> {patient.phone}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium bg-white shadow-sm"
                >
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">ABHA ID</label>
                        <div className="mt-1 font-mono text-slate-900">{patient.abhaId || 'Not Linked'}</div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date of Birth</label>
                        <div className="mt-1 text-slate-900 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {new Date(patient.dateOfBirth).toLocaleDateString()}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Address</label>
                        <div className="mt-1 text-slate-900 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {patient.address || 'No address provided'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex gap-6">
                    <button
                        onClick={() => setActiveTab('vitals')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'vitals'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Activity className="h-4 w-4" />
                        Vitals History
                    </button>
                    <button
                        onClick={() => setActiveTab('consultations')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'consultations'
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <FileText className="h-4 w-4" />
                        Consultations
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
                {activeTab === 'vitals' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">BP</th>
                                    <th className="px-6 py-3 font-medium">Pulse</th>
                                    <th className="px-6 py-3 font-medium">Temp</th>
                                    <th className="px-6 py-3 font-medium">SPO2</th>
                                    <th className="px-6 py-3 font-medium">Sugar</th>
                                    <th className="px-6 py-3 font-medium">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {patient.vitals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                            No vitals recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    patient.vitals.map((vital) => (
                                        <tr key={vital.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(vital.recordedAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{vital.bloodPressure || '-'}</td>
                                            <td className="px-6 py-4">{vital.pulse ? `${vital.pulse} bpm` : '-'}</td>
                                            <td className="px-6 py-4">{vital.temperature ? `${vital.temperature}°F` : '-'}</td>
                                            <td className="px-6 py-4">{vital.spo2 ? `${vital.spo2}%` : '-'}</td>
                                            <td className="px-6 py-4">{vital.bloodSugar ? `${vital.bloodSugar} mg/dL` : '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskColor(vital.riskLevel)}`}>
                                                    {vital.riskLevel}
                                                </span>
                                                {vital.triageNote && (
                                                    <div className="text-xs text-slate-500 mt-1 max-w-xs truncate" title={vital.triageNote}>
                                                        {vital.triageNote}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'consultations' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Diagnosis</th>
                                    <th className="px-6 py-3 font-medium">Prescription</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {patient.consultations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                            No consultations recorded yet.
                                        </td>
                                    </tr>
                                ) : (
                                    patient.consultations.map((consultation) => (
                                        <tr key={consultation.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(consultation.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">{consultation.diagnosis || '-'}</td>
                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={consultation.prescription}>
                                                {consultation.prescription || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${consultation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {consultation.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {consultation.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(consultation.id, 'COMPLETED')}
                                                        className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded hover:bg-primary-100 transition-colors"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Edit Patient Details</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdatePatient} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">First Name</label>
                                    <input
                                        type="text"
                                        value={editForm.firstName}
                                        onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700">Last Name</label>
                                    <input
                                        type="text"
                                        value={editForm.lastName}
                                        onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Phone Number</label>
                                <input
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Address</label>
                                <textarea
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">ABHA ID</label>
                                <input
                                    type="text"
                                    value={editForm.abhaId}
                                    onChange={(e) => setEditForm({ ...editForm, abhaId: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm font-mono"
                                    placeholder="XX-XXXX-XXXX-XXXX"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PatientDetails;
