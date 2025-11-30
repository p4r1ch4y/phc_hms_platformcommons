import { useState } from 'react';
import { User, Shield, Database, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import api from '../../../api/client';

const Settings = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [seeding, setSeeding] = useState(false);
    const [seedStatus, setSeedStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSeedData = async () => {
        if (!confirm('This will add dummy data to your PHC. Are you sure?')) return;

        setSeeding(true);
        setSeedStatus(null);

        try {
            await api.post('/tenants/seed');
            setSeedStatus({
                type: 'success',
                message: 'Successfully seeded PHC with dummy data! Check Patients and Pharmacy.'
            });
        } catch (error: unknown) {
            console.error('Seed error:', error);
            let message = 'Failed to seed data. Please try again.';
            if (error instanceof Error) message = error.message;
            else if (typeof error === 'object' && error !== null) {
                const maybe = error as { response?: { data?: { message?: unknown } } };
                if (typeof maybe.response?.data?.message === 'string') message = maybe.response.data.message;
            } else {
                message = String(error);
            }
            setSeedStatus({ type: 'error', message });
        } finally {
            setSeeding(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage your account and PHC preferences.</p>
            </div>

            {/* Profile Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <User className="h-5 w-5 text-primary-600" />
                        Profile Information
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Full Name</label>
                        <div className="text-slate-900 dark:text-slate-100 font-medium">{user.name || user.firstName + ' ' + user.lastName}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Email Address</label>
                        <div className="text-slate-900 dark:text-slate-100 font-medium">{user.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Role</label>
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {user.role}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Tenant ID</label>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-xs">{user.tenantId || 'N/A'}</div>
                    </div>
                </div>
            </div>

            {/* Admin Zone */}
            {(user.role === 'HOSPITAL_ADMIN' || user.role === 'SUPER_ADMIN') && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-600" />
                            Admin Controls
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <h3 className="text-md font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                                <Database className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                                Test Data Seeding
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Populate your PHC with dummy patients, consultations, and medicines for testing purposes.
                                <br />
                                <span className="text-amber-600 font-medium">Note: This is for testing only.</span>
                            </p>

                            <button
                                onClick={handleSeedData}
                                disabled={seeding}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                            >
                                {seeding ? (
                                    <>
                                        <Loader className="h-4 w-4 animate-spin" />
                                        Seeding Data...
                                    </>
                                ) : (
                                    <>
                                        <Database className="h-4 w-4" />
                                        Seed My PHC
                                    </>
                                )}
                            </button>

                            {seedStatus && (
                                <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${seedStatus.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                    }`}>
                                    {seedStatus.type === 'success' ? (
                                        <CheckCircle className="h-5 w-5 shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 shrink-0" />
                                    )}
                                    <p className="text-sm">{seedStatus.message}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
