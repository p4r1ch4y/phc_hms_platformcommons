import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import api from '../../../api/client';

const AddMedicine = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        manufacturer: '',
        batchNumber: '',
        expiryDate: '',
        quantity: '',
        unit: 'Tablet',
        lowStockThreshold: '10'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let medicineId = '';

            try {
                const medResponse = await api.post('/pharmacy/medicines', {
                    name: formData.name,
                    manufacturer: formData.manufacturer,
                    unit: formData.unit,
                    lowStockThreshold: parseInt(formData.lowStockThreshold)
                });
                medicineId = medResponse.data.id;
            } catch (error: any) {
                if (error.response?.status === 400 && error.response?.data?.message === 'Medicine already exists') {
                    alert('Medicine already exists. Please use the "Add Batch" feature (to be implemented) or ensure unique name.');
                    setLoading(false);
                    return;
                }
                throw error;
            }

            await api.post('/pharmacy/batches', {
                medicineId,
                batchNumber: formData.batchNumber,
                expiryDate: formData.expiryDate,
                quantity: formData.quantity
            });

            navigate('/dashboard/pharmacy');
        } catch (error) {
            console.error('Failed to add medicine:', error);
            alert('Failed to save medicine. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/dashboard/pharmacy')}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-500" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Add New Medicine</h1>
                    <p className="text-slate-500">Register a new medicine and add initial stock.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Medicine Name</label>
                        <input
                            type="text"
                            required
                            className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                        <input
                            type="text"
                            className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                            value={formData.manufacturer}
                            onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Unit Type</label>
                            <select
                                className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                                value={formData.unit}
                                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                            >
                                <option value="Tablet">Tablet</option>
                                <option value="Capsule">Capsule</option>
                                <option value="Syrup">Syrup</option>
                                <option value="Injection">Injection</option>
                                <option value="Sachet">Sachet</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                            <input
                                type="number"
                                required
                                className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                                value={formData.lowStockThreshold}
                                onChange={e => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-sm font-medium text-slate-900 mb-4">Initial Batch Details</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Batch Number</label>
                                <input
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.batchNumber}
                                    onChange={e => setFormData({ ...formData, batchNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="block w-full rounded-lg border-slate-300 focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard/pharmacy')}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Medicine'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddMedicine;
