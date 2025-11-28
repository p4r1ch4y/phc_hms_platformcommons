import { useState, useEffect } from 'react';
import { Plus, Search, Filter, User, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../api/client';

interface Staff {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

const StaffList = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            // Use the new backend endpoint
            const response = await api.get('/auth/staff');
            setStaff(response.data);
        } catch (err) {
            console.error('Failed to fetch staff:', err);
            // Fallback for demo if backend not fully connected/auth issue
            setStaff([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'DOCTOR': return 'bg-blue-100 text-blue-800';
            case 'NURSE': return 'bg-pink-100 text-pink-800';
            case 'PHARMACIST': return 'bg-green-100 text-green-800';
            case 'LAB_TECHNICIAN': return 'bg-purple-100 text-purple-800';
            case 'HOSPITAL_ADMIN': return 'bg-slate-100 text-slate-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Staff Management</h1>
                    <p className="text-slate-500">Manage doctors, nurses, and other PHC staff.</p>
                </div>
                <Link
                    to="/dashboard/staff/new"
                    className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Add Staff
                </Link>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 sm:text-sm border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 py-2"
                    />
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium">
                    <Filter className="h-4 w-4" />
                    Filters
                </button>
            </div>

            {/* Staff List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading staff...</div>
                ) : filteredStaff.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="mx-auto h-12 w-12 text-slate-400">
                            <User className="h-12 w-12" />
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-slate-900">No staff found</h3>
                        <p className="mt-1 text-sm text-slate-500">Add your first staff member.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredStaff.map((member) => (
                            <div key={member.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-slate-900">{member.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Mail className="h-3 w-3" />
                                            {member.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadge(member.role)}`}>
                                        {member.role.replace('_', ' ')}
                                    </span>
                                    <div className="text-right text-xs text-slate-400">
                                        Joined {new Date(member.createdAt).toLocaleDateString()}
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

export default StaffList;
