import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search, User, Stethoscope, Pill, Globe } from 'lucide-react';
import api from '../../../api/client';
import { VoiceInput } from '../../../components/ui/VoiceInput';

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    abhaId?: string;
    homePhc?: string; // Added for global search results
}

const NewConsultation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Patient Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searching, setSearching] = useState(false);
    const [isGlobalSearch, setIsGlobalSearch] = useState(false);

    const [formData, setFormData] = useState({
        diagnosis: '',
        symptoms: '',
        notes: '',
        prescription: ''
    });

    // Debounced search for patients
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.length > 2) {
                setSearching(true);
                setPatients([]); // Clear previous results
                try {
                    if (isGlobalSearch) {
                        // Global Search by ABHA ID
                        try {
                            const response = await api.get(`/patients/search?abhaId=${searchTerm}`);
                            setPatients([response.data]);
                        } catch (err: unknown) {
                            const maybe = err as { response?: { status?: number } };
                            if (maybe.response?.status === 404) {
                                setPatients([]); // Not found
                            } else {
                                console.error(err);
                            }
                        }
                    } else {
                        // Local Search
                        const response = await api.get('/patients');
                        const filtered = response.data.filter((p: Patient) =>
                            `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.abhaId?.includes(searchTerm)
                        );
                        setPatients(filtered);
                    }
                } catch (err) {
                    console.error(err);
                } finally {
                    setSearching(false);
                }
            } else {
                setPatients([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, isGlobalSearch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPatient) {
            setError('Please select a patient first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.post('/consultations', {
                patientId: selectedPatient.id,
                diagnosis: formData.diagnosis,
                prescription: formData.prescription,
                notes: formData.notes
            });
            navigate('/dashboard/consultations');
                } catch (err: unknown) {
            console.error('Consultation error:', err);
            let message = 'Failed to create consultation';
            if (err instanceof Error) message = err.message;
            else if (typeof err === 'object' && err !== null) {
                const maybe = err as { response?: { data?: { message?: unknown } } };
                if (typeof maybe.response?.data?.message === 'string') message = maybe.response.data.message;
            } else {
                message = String(err);
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/consultations')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">New Consultation</h1>
                    <p className="text-slate-500">Diagnose and prescribe for a patient.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Patient Selection */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-primary-600" />
                            Select Patient
                        </h3>

                        {!selectedPatient ? (
                            <div className="space-y-4">
                                {/* Search Mode Toggle */}
                                <div className="flex bg-slate-100 p-1 rounded-lg">
                                    <button
                                        onClick={() => setIsGlobalSearch(false)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isGlobalSearch ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Local Search
                                    </button>
                                    <button
                                        onClick={() => setIsGlobalSearch(true)}
                                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1 ${isGlobalSearch ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Globe className="h-3 w-3" />
                                        Global Search
                                    </button>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder={isGlobalSearch ? "Enter exact ABHA ID..." : "Search name or ABHA ID..."}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-9 rounded-lg border-slate-300 text-sm focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {searching ? (
                                        <div className="text-center text-xs text-slate-500 py-2">Searching...</div>
                                    ) : patients.length > 0 ? (
                                        patients.map(patient => (
                                            <button
                                                key={patient.id}
                                                onClick={() => {
                                                    setSelectedPatient(patient);
                                                    setPatients([]);
                                                    setSearchTerm('');
                                                }}
                                                className="w-full text-left p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
                                            >
                                                <div className="font-medium text-slate-900 group-hover:text-primary-600">
                                                    {patient.firstName} {patient.lastName}
                                                </div>
                                                <div className="text-xs text-slate-500 font-mono">
                                                    {patient.abhaId || 'No ABHA ID'}
                                                </div>
                                                {patient.homePhc && (
                                                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium">
                                                        <Globe className="h-3 w-3" />
                                                        {patient.homePhc}
                                                    </div>
                                                )}
                                            </button>
                                        ))
                                    ) : searchTerm.length > 2 ? (
                                        <div className="text-center text-xs text-slate-500 py-2">No patients found</div>
                                    ) : (
                                        <div className="text-center text-xs text-slate-400 py-4">
                                            {isGlobalSearch ? "Enter full ABHA ID to search globally" : "Type to search patients"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-primary-900">
                                            {selectedPatient.firstName} {selectedPatient.lastName}
                                        </div>
                                        <div className="text-xs text-primary-700 font-mono mt-1">
                                            {selectedPatient.abhaId}
                                        </div>
                                        {selectedPatient.homePhc && (
                                            <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-white text-primary-700 text-xs font-medium border border-primary-100">
                                                <Globe className="h-3 w-3" />
                                                From: {selectedPatient.homePhc}
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Consultation Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}



                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4 text-slate-400" />
                                        Diagnosis / Symptoms
                                    </span>
                                    <VoiceInput onTranscript={(text) => setFormData(prev => ({ ...prev, diagnosis: prev.diagnosis + (prev.diagnosis ? ' ' : '') + text }))} />
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="e.g. Acute Viral Fever, High Temperature, Body Ache"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                    <Pill className="h-4 w-4 text-slate-400" />
                                    Prescription (One per line)
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.prescription}
                                    onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono"
                                    placeholder="Paracetamol 500mg - 1-0-1 - 3 days&#10;Cetirizine 10mg - 0-0-1 - 3 days"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                                    Clinical Notes
                                    <VoiceInput onTranscript={(text) => setFormData(prev => ({ ...prev, notes: prev.notes + (prev.notes ? ' ' : '') + text }))} />
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Additional observations..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard/consultations')}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedPatient}
                                    className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="h-4 w-4" />
                                    {loading ? 'Saving...' : 'Complete Consultation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewConsultation;
