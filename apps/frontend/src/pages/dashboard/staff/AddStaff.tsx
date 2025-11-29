import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, User, Mail, Lock, Shield } from 'lucide-react';
import api from '../../../api/client';

const AddStaff = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'DOCTOR'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/staff', formData);
            navigate('/dashboard/staff');
        } catch (err: any) {
            console.error('Add staff error:', err);
            setError(err.response?.data?.message || 'Failed to add staff');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/staff')}
                    className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add Staff Member</h1>
                    <p className="text-slate-500">Create a new account for your PHC team.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <User className="h-4 w-4 text-slate-400" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                placeholder="e.g. Dr. Rajesh Kumar"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Mail className="h-4 w-4 text-slate-400" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                placeholder="doctor@phc.org"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Lock className="h-4 w-4 text-slate-400" />
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                placeholder="••••••••"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                <Shield className="h-4 w-4 text-slate-400" />
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                            >
                                <option value="DOCTOR">Doctor</option>
                                <option value="NURSE">Nurse</option>
                                <option value="PHARMACIST">Pharmacist</option>
                                <option value="LAB_TECHNICIAN">Lab Technician</option>
                                <option value="ASHA">ASHA Worker</option>
                                <option value="HOSPITAL_ADMIN">Admin</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/staff')}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStaff;
