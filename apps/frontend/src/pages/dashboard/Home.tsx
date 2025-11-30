

import { useState, useEffect } from 'react';
import { Users, Stethoscope, AlertTriangle, Activity, Plus, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatCardsSkeleton, TableSkeleton } from '../../components/ui/Skeleton';

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    abhaId?: string;
    gender: string;
}

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        newPatients: 0,
        todayConsultations: 0,
        pendingConsultations: 0
    });
    const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    interface MedicineSummary { id: string; name: string; totalStock?: number; unit?: string }
    interface HighRiskItem { patient: { id: string; firstName: string; lastName: string }; vital: { riskLevel?: string } }

    const [highRiskPatients, setHighRiskPatients] = useState<HighRiskItem[]>([]);
    const [lowStockMedicines, setLowStockMedicines] = useState<MedicineSummary[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setError(null);
                const [patientStats, consultationStats, patientsList, highRisk, lowStock] = await Promise.all([
                    api.get('/patients/stats'),
                    api.get('/consultations/stats'),
                    api.get('/patients'),
                    api.get('/patients/high-risk'),
                    api.get('/pharmacy/low-stock')
                ]);

                setStats({
                    ...patientStats.data,
                    ...consultationStats.data
                });

                // Get last 5 patients
                setRecentPatients(patientsList.data.slice(0, 5));
                setHighRiskPatients(highRisk.data);
                setLowStockMedicines(lowStock.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const statCards = [
        { name: 'Total Patients', value: stats.totalPatients, change: `+${stats.newPatients} today`, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
        { name: 'Today\'s Visits', value: stats.todayConsultations, change: 'Active', icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-100' },
        { name: 'Pending Consultations', value: stats.pendingConsultations, change: 'Queue', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
        { name: 'Low Stock Items', value: lowStockMedicines.length, change: 'Action needed', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
    ];

    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h2>
                    <p className="text-red-700 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Welcome back, here's what's happening at your PHC today.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/dashboard/ocr" className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <FileText className="h-5 w-5" />
                        Scan Report
                    </Link>
                    <Link to="/dashboard/patients/new" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm">
                        <Plus className="h-5 w-5" />
                        New Patient
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <StatCardsSkeleton count={4} />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => (
                        <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className={`${stat.bg} p-3 rounded-lg`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <span className={`text-sm font-medium ${stat.change.includes('+') ? 'text-green-600' : 'text-slate-500'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                <p className="text-sm text-slate-500 mt-1">{stat.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Patients */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-bold text-slate-900">Recent Patients</h2>
                        <Link to="/dashboard/patients" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
                    </div>
                    {loading ? (
                        <TableSkeleton rows={5} columns={4} />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Name</th>
                                        <th className="px-6 py-3 font-medium">ABHA ID</th>
                                        <th className="px-6 py-3 font-medium">Gender</th>
                                        <th className="px-6 py-3 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentPatients.length === 0 ? (
                                        <tr><td colSpan={4} className="p-4 text-center text-slate-500">No patients found</td></tr>
                                    ) : (
                                        recentPatients.map((patient) => (
                                            <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">{patient.firstName} {patient.lastName}</td>
                                                <td className="px-6 py-4 text-slate-500">{patient.abhaId || '-'}</td>
                                                <td className="px-6 py-4 text-slate-500">{patient.gender}</td>
                                                <td className="px-6 py-4">
                                                    <Link to={`/dashboard/patients/${patient.id}/vitals`} className="text-primary-600 hover:text-primary-700 font-medium">Record Vitals</Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Quick Actions / Alerts */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="font-bold text-slate-900 mb-4">Action Required</h2>
                    <div className="space-y-4">
                        {lowStockMedicines.length > 0 && lowStockMedicines.map((med: MedicineSummary) => (
                            <div key={med.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                                <div className="flex gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-red-900">Low Stock Alert</h3>
                                        <p className="text-xs text-red-700 mt-1">{med.name} is running low ({med.totalStock} {med.unit}).</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {highRiskPatients.length > 0 && highRiskPatients.map((item: HighRiskItem) => (
                            <div key={item.patient.id} className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <div className="flex gap-3">
                                    <Activity className="h-5 w-5 text-orange-600 shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-medium text-orange-900">Abnormal Vitals</h3>
                                        <p className="text-xs text-orange-700 mt-1">
                                            {item.patient.firstName} {item.patient.lastName} recorded {item.vital.riskLevel} risk vitals.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {lowStockMedicines.length === 0 && highRiskPatients.length === 0 && (
                            <div className="text-center text-slate-500 py-4 text-sm">
                                No urgent actions required.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
