import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, Stethoscope, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';

interface Consultation {
    id: string;
    patientId: string;
    patient: {
        firstName: string;
        lastName: string;
    };
    diagnosis: string;
    prescription: any;
    createdAt: string;
    status: 'PENDING' | 'COMPLETED';
}

const Consultations = () => {
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConsultations();
    }, []);

    const fetchConsultations = async () => {
        try {
            const response = await api.get('/consultations');
            setConsultations(response.data);
        } catch (err) {
            console.error('Failed to fetch consultations:', err);
            // Mock data for demo if API fails or is empty
            setConsultations([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
                    <p className="text-slate-500">Manage patient visits and prescriptions.</p>
                </div>
                <Link
                    to="/dashboard/consultations/new"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    New Consultation
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
                        placeholder="Search by patient name or diagnosis..."
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

            {/* Consultations List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading consultations...</div>
                ) : consultations.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-slate-400">
                            <Stethoscope className="h-12 w-12" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No consultations found</h3>
                        <p className="mt-1 text-sm text-slate-500">Start a new consultation for a patient.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {consultations.map((consultation) => (
                            <div key={consultation.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900">
                                            {consultation.patient?.firstName} {consultation.patient?.lastName}
                                        </h3>
                                        <p className="text-sm text-slate-500">{consultation.diagnosis}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <div className="text-sm text-slate-900 font-medium">
                                            {new Date(consultation.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(consultation.createdAt).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
                                        <FileText className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Consultations;
