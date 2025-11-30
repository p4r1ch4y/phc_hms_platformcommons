import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Activity, Heart, Thermometer, Scale, Ruler, Droplet } from 'lucide-react';
import api from '../../../api/client';
import { VoiceInput } from '../../../components/ui/VoiceInput';
import { calculateRisk, RiskLevel, type RiskAssessment } from '../../../utils/triage';

const RecordVitals = () => {
    const { patientId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        temperature: '',
        bloodPressure: '',
        pulse: '',
        weight: '',
        height: '',
        bloodSugar: '',
        triageNote: ''
    });

    useEffect(() => {
        // Fetch patient details to show name
        const fetchPatient = async () => {
            try {
                // Ideally we have a getPatient endpoint, or we pass state.
                // For now, let's assume we can fetch it or just show ID.
                // We haven't implemented getPatientById yet in frontend, but backend has it.
                // Let's skip name for now to save time or implement it quickly.
            } catch (err) {
                console.error(err);
            }
        };
        fetchPatient();
    }, [patientId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [risk, setRisk] = useState<RiskAssessment | null>(null);

    useEffect(() => {
        const vitals = {
            temperature: parseFloat(formData.temperature),
            bloodPressure: formData.bloodPressure,
            pulse: Number.isNaN(parseInt(formData.pulse)) ? undefined : parseInt(formData.pulse),
            bloodSugar: Number.isNaN(parseFloat(formData.bloodSugar)) ? undefined : parseFloat(formData.bloodSugar),
            weight: Number.isNaN(parseFloat(formData.weight)) ? undefined : parseFloat(formData.weight), // Not used for risk but part of input
            height: Number.isNaN(parseFloat(formData.height)) ? undefined : parseFloat(formData.height)
        };
        // Simple check to see if we have enough data to calculate something
        if (vitals.bloodPressure || vitals.temperature || vitals.bloodSugar || vitals.pulse) {
            setRisk(calculateRisk(vitals));
        }
    }, [formData]);

    const getRiskColor = (level: RiskLevel) => {
        switch (level) {
            case RiskLevel.CRITICAL: return 'bg-red-100 text-red-800 border-red-200';
            case RiskLevel.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200';
            case RiskLevel.MODERATE: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post(`/patients/${patientId}/vitals`, {
                ...formData,
                temperature: parseFloat(formData.temperature),
                pulse: parseInt(formData.pulse),
                weight: parseFloat(formData.weight),
                height: parseFloat(formData.height),
                bloodSugar: parseFloat(formData.bloodSugar),
                triageNote: formData.triageNote
            });
            navigate('/dashboard/patients');
        } catch (err: unknown) {
            console.error('Vitals recording error:', err);
            let message = 'Failed to record vitals';
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
                    <h1 className="text-2xl font-bold text-slate-900">Record Vitals</h1>
                    <p className="text-slate-500">Enter vital signs for Patient ID: {patientId}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Thermometer className="h-4 w-4 text-slate-400" />
                                        Temperature (°F)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="temperature"
                                        required
                                        value={formData.temperature}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="98.6"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-slate-400" />
                                        Blood Pressure (mmHg)
                                    </label>
                                    <input
                                        type="text"
                                        name="bloodPressure"
                                        required
                                        value={formData.bloodPressure}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="120/80"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Heart className="h-4 w-4 text-slate-400" />
                                        Pulse (bpm)
                                    </label>
                                    <input
                                        type="number"
                                        name="pulse"
                                        required
                                        value={formData.pulse}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="72"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Droplet className="h-4 w-4 text-slate-400" />
                                        Blood Sugar (mg/dL)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="bloodSugar"
                                        value={formData.bloodSugar}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="110"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Scale className="h-4 w-4 text-slate-400" />
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        required
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="70"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                                        <Ruler className="h-4 w-4 text-slate-400" />
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="height"
                                        required
                                        value={formData.height}
                                        onChange={handleChange}
                                        className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5"
                                        placeholder="170"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center justify-between">
                                    Clinical Observations / Triage Notes
                                    <VoiceInput onTranscript={(text) => setFormData(prev => ({ ...prev, triageNote: prev.triageNote + (prev.triageNote ? ' ' : '') + text }))} />
                                </label>
                                <textarea
                                    rows={3}
                                    name="triageNote"
                                    value={formData.triageNote}
                                    onChange={(e) => setFormData({ ...formData, triageNote: e.target.value })}
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                    placeholder="Additional observations..."
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard/patients')}
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
                                    {loading ? 'Saving...' : 'Save Vitals'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Risk Assessment Card */}
                    <div className={`rounded-xl border p-6 ${risk ? getRiskColor(risk.riskLevel) : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Smart Triage
                        </h3>
                        {risk ? (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm opacity-80 uppercase tracking-wider font-medium">Risk Level</div>
                                    <div className="text-2xl font-bold">{risk.riskLevel}</div>
                                </div>
                                <div>
                                    <div className="text-sm opacity-80 uppercase tracking-wider font-medium">Notes</div>
                                    <div className="font-medium">{risk.triageNote}</div>
                                </div>
                                {risk.riskLevel === RiskLevel.CRITICAL && (
                                    <div className="bg-white/50 p-3 rounded-lg text-sm font-medium">
                                        ⚠️ Immediate Doctor Attention Required
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm">Enter vitals to generate a risk assessment.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordVitals;
