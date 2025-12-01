import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';

interface Medicine {
    id: string;
    name: string;
    manufacturer: string;
    unit: string;
    totalStock: number;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    batches: {
        id: string;
        batchNumber: string;
        expiryDate: string;
        quantity: number;
    }[];
}

const Pharmacy = () => {
    const [inventory, setInventory] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            const response = await api.get('/pharmacy/inventory');
            setInventory(response.data);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.batches.some(b => b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_STOCK': return 'bg-green-100 text-green-800';
            case 'LOW_STOCK': return 'bg-orange-100 text-orange-800';
            case 'OUT_OF_STOCK': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pharmacy Inventory</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage medicines, stock levels, and expiry dates.</p>
                </div>
                <Link
                    to="/dashboard/pharmacy/new"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Add Medicine
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by medicine name or batch number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 sm:text-sm border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-primary-500 focus:border-primary-500 py-2"
                    />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Inventory List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">Loading inventory...</div>
                ) : filteredInventory.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-slate-400">
                            <Package className="h-12 w-12" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No medicines found</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by adding new stock.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredInventory.map((item) => (
                            <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-200">
                                                                <Package className="h-5 w-5" />
                                                            </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.manufacturer} • {item.unit}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.totalStock} {item.unit}s</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Total Stock</div>
                                        </div>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                            {item.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>

                                {/* Batches */}
                                <div className="ml-14 bg-slate-50 dark:bg-slate-900 rounded-lg p-3 text-xs">
                                    <div className="grid grid-cols-3 gap-4 font-medium text-slate-500 mb-2">
                                        <div>Batch No.</div>
                                        <div>Expiry Date</div>
                                        <div className="text-right">Quantity</div>
                                    </div>
                                    <div className="space-y-2">
                                        {item.batches.map((batch) => (
                                            <div key={batch.id} className="grid grid-cols-3 gap-4 text-slate-700 dark:text-slate-200">
                                                <div className="font-mono">{batch.batchNumber}</div>
                                                <div className={new Date(batch.expiryDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                                                    {new Date(batch.expiryDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-right">{batch.quantity}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Pharmacy;
