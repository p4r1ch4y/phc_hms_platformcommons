import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    Pill,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search
} from 'lucide-react';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Patients', href: '/dashboard/patients', icon: Users },
        { name: 'Consultations', href: '/dashboard/consultations', icon: Stethoscope },
        { name: 'Pharmacy', href: '/dashboard/pharmacy', icon: Pill },
        { name: 'Reports', href: '/dashboard/reports', icon: FileText },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-600 p-1.5 rounded-lg">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-heading font-bold text-lg text-slate-900">PHC Commons</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : 'text-slate-400'}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                            {user.firstName?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                                {user.firstName || 'User'} {user.lastName || ''}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user.role || 'Staff'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-slate-500 hover:text-slate-700"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div className="flex-1 max-w-lg mx-4 lg:mx-8 hidden sm:block">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 sm:text-sm border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-primary-500 focus:border-primary-500 py-2"
                                placeholder="Search patients, files, or help..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="h-6 w-6" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
