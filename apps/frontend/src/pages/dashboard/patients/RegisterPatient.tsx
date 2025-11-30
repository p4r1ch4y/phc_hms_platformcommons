import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Calendar, Phone, MapPin, CreditCard, Sparkles } from 'lucide-react';
import api from '../../../api/client';
import { OCRUploader } from '../../../components/ui/OCRUploader';

const RegisterPatient = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE',
        phone: '',
        address: '',
        abhaId: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOCRText = (text: string) => {
        const lines = text.split('\n');
        const updates: Partial<typeof formData> = {};

        // Simple heuristics for demo purposes
        // 1. Name detection (Look for "Name:" or assume first capitalized line)
        const nameLine = lines.find(l => l.toLowerCase().includes('name:')) ||
            lines.find(l => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(l.trim()));

        if (nameLine) {
            const cleanName = nameLine.replace(/name:/i, '').trim();
            const parts = cleanName.split(' ');
            if (parts.length >= 1) updates.firstName = parts[0];
            if (parts.length >= 2) updates.lastName = parts.slice(1).join(' ');
        }

        // 2. DOB/Age detection
        const dobLine = lines.find(l => l.toLowerCase().includes('dob') || l.match(new RegExp('\\d{2}[/-]\\d{2}[/-]\\d{4}')));
        if (dobLine) {
            const dateMatch = dobLine.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
            if (dateMatch) {
                // Convert DD/MM/YYYY to YYYY-MM-DD for input[type=date]
                updates.dateOfBirth = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
            }
        }

        // 3. Phone detection
        const phoneLine = lines.find(l => l.match(/[6-9]\d{9}/));
        if (phoneLine) {
            const phoneMatch = phoneLine.match(/[6-9]\d{9}/);
            if (phoneMatch) updates.phone = phoneMatch[0];
        }

        // 4. ABHA ID detection
        const abhaLine = lines.find(l => l.match(/\d{2}-\d{4}-\d{4}-\d{4}/));
        if (abhaLine) {
            const abhaMatch = abhaLine.match(/\d{2}-\d{4}-\d{4}-\d{4}/);
            if (abhaMatch) updates.abhaId = abhaMatch[0];
        }

        if (Object.keys(updates).length > 0) {
            setFormData(prev => ({ ...prev, ...updates }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/patients', formData);
            navigate('/dashboard/patients');
        } catch (err: unknown) {
            console.error('Registration error:', err);
            let message = 'Failed to register patient';
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
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/patients')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Register New Patient</h1>
                    <p className="text-slate-500 dark:text-slate-400">Enter patient details to create a new record.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Sidebar - OCR */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-gradient-to-br from-primary-50 to-white dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-primary-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-3 text-primary-800 font-semibold">
                            <Sparkles className="h-4 w-4" />
                            <h3>AI Auto-fill</h3>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                            Scan an ID card or previous prescription to auto-fill patient details.
                        </p>
                        <OCRUploader onTextExtracted={handleOCRText} />
                    </div>
                </div>

                {/* Main Form */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-6 space-y-8">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Personal Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-primary-600" />
                                Personal Information
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="Ramesh"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="Kumar"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Calendar className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            required
                                            value={formData.dateOfBirth}
                                            onChange={handleChange}
                                            className="block w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Contact & Identity */}
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-secondary-600" />
                                Identity & Contact
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ABHA ID (Ayushman Bharat Health Account)</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <CreditCard className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="abhaId"
                                            value={formData.abhaId}
                                            onChange={handleChange}
                                            className="block w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                            placeholder="12-3456-7890-1234"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">Optional but recommended for ABDM integration.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="block w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                                            <MapPin className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <textarea
                                            name="address"
                                            rows={3}
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="block w-full pl-10 rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                            placeholder="Village, Post Office, District"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard/patients')}
                                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-4 w-4" />
                                {loading ? 'Registering...' : 'Register Patient'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};


export default RegisterPatient;
