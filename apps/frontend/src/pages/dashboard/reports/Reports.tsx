import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import { Activity, Users, FileText } from 'lucide-react';
import api from '../../../api/client';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Reports = () => {
    interface GenderDistributionItem { name: string; value: number; [key: string]: unknown }
    interface PatientStats { totalPatients?: number; newPatients?: number; genderDistribution?: GenderDistributionItem[]; ageDistribution?: Array<{ name: string; value: number }> }
    interface ConsultationStats { todayConsultations?: number; topDiagnoses?: Array<{ name: string; value: number }> }

    const [loading, setLoading] = useState(true);
    const [patientStats, setPatientStats] = useState<PatientStats | null>(null);
    const [consultationStats, setConsultationStats] = useState<ConsultationStats | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [pStats, cStats] = await Promise.all([
                    api.get('/patients/stats'),
                    api.get('/consultations/stats')
                ]);
                setPatientStats(pStats.data);
                setConsultationStats(cStats.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading reports...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
                <p className="text-slate-500">Key insights into PHC performance and patient health.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Patients</p>
                            <h3 className="text-2xl font-bold text-slate-900">{patientStats?.totalPatients}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 rounded-lg text-green-600">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">New Patients (Today)</p>
                            <h3 className="text-2xl font-bold text-slate-900">{patientStats?.newPatients}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Consultations Today</p>
                            <h3 className="text-2xl font-bold text-slate-900">{consultationStats?.todayConsultations}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Gender Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Patient Demographics (Gender)</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={patientStats?.genderDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                    label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {patientStats?.genderDistribution?.map((_, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Age Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Age Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={patientStats?.ageDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#8884d8" name="Patients" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Diagnoses */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6">Top 5 Diagnoses</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={consultationStats?.topDiagnoses} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={150} />
                                <Tooltip />
                                <Bar dataKey="value" fill="#82ca9d" name="Cases" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
