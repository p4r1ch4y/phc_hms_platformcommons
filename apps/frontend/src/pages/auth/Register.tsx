import { useState } from 'react';
import { Activity, Mail, Lock, User, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        address: '',
        adminName: '',
        adminEmail: '',
        adminPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/tenants', formData);

            // If the API returns success, redirect to login
            navigate('/login');
        } catch (err: unknown) {
            let message = 'Registration failed';
            if (err instanceof Error) message = err.message;
            else if (typeof err === 'object' && err !== null) {
                const maybe = err as { message?: unknown };
                if (typeof maybe.message === 'string') message = maybe.message;
            } else {
                message = String(err);
            }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-primary-600 p-2 rounded-xl">
                        <Activity className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900 dark:text-slate-100 font-heading">
                    Register your PHC
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                    Already registered?{' '}
                    <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-700">
                    <div className="mb-4 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-700 dark:text-yellow-200">
                        Note: Backend services for this monorepo may not be running in your local dev environment. To load real data start the API Gateway and services (see README).  <br /> Sorry for the inconvenience! The Dev is having trouble hosting the backend. Thanks for checking this app, and please reach out on GitHub if you have questions.
                    </div>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-200 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">PHC Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Building className="h-5 w-5 text-slate-400 dark:text-slate-400" />
                                </div>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                    placeholder="Primary Health Centre, Village X"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">PHC Slug (Unique ID)</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Activity className="h-5 w-5 text-slate-400 dark:text-slate-400" />
                                </div>
                                <input
                                    name="slug"
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                    placeholder="phc_village_x"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Address</label>
                            <div className="mt-1">
                                <input
                                    name="address"
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="block w-full sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2.5 px-3"
                                    placeholder="Full Address"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-200 pt-4">
                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">Admin Account</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Admin Name</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400 dark:text-slate-400" />
                                        </div>
                                        <input
                                            name="adminName"
                                            type="text"
                                            required
                                            value={formData.adminName}
                                            onChange={handleChange}
                                            className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                            placeholder="Dr. Name"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Admin Email</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400 dark:text-slate-400" />
                                        </div>
                                        <input
                                            name="adminEmail"
                                            type="email"
                                            required
                                            value={formData.adminEmail}
                                            onChange={handleChange}
                                            className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                            placeholder="admin@phc.org"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400 dark:text-slate-400" />
                                        </div>
                                        <input
                                            name="adminPassword"
                                            type="password"
                                            required
                                            value={formData.adminPassword}
                                            onChange={handleChange}
                                            className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2.5"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registering...' : 'Register PHC'}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
