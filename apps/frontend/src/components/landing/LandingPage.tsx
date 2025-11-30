import { Activity, Shield, Users, WifiOff, FileText, Heart, ChevronRight, CheckCircle2, Stethoscope, Pill, TestTube, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="min-h-screen flex flex-col font-sans">
            {/* Navbar */}
            <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-primary-600 p-1.5 rounded-lg">
                                <Activity className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-heading font-bold text-xl text-slate-900 dark:text-slate-100">PHC Commons</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Features</a>
                            <a href="#workflow" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Workflow</a>
                            <a href="#team" className="text-slate-600 dark:text-slate-300 hover:text-primary-600 font-medium">Team</a>
                            <Link to="/login" className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-b from-primary-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-primary-100 dark:border-slate-700 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                                <span className="flex h-2 w-2 rounded-full bg-secondary-500"></span>
                                <span className="text-sm font-medium text-slate-600">Built for Bharat's Healthcare Heroes</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-slate-900 dark:text-slate-100">
                                Simple, smart hospital management for <span className="text-primary-600">India's PHCs</span>
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-lg">
                                Digitize your Primary Health Centre with a platform designed for rural reality. Registration, vitals, consultation, and pharmacy <br/> all in one place, even offline.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2">
                                    See PHC Workflow <ChevronRight className="h-5 w-5" />
                                </Link>
                                <Link to="/register" className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-100 border border-slate-200 dark:border-slate-700 px-8 py-3.5 rounded-xl font-semibold transition-all flex items-center justify-center">
                                    Start Managing Your PHC
                                </Link>
                            </div>
                            <div className="mt-10 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <WifiOff className="h-4 w-4 text-secondary-500" />
                                    <span>Offline-first</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-secondary-500" />
                                    <span>Secure & Private</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-secondary-500" />
                                    <span>Multi-tenant</span>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Mockup */}
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary-200 to-secondary-200 rounded-3xl blur-2xl opacity-30"></div>
                                <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                    <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="text-xs font-medium text-slate-400">PHC Dashboard</div>
                                </div>
                                    <div className="p-6 grid grid-cols-2 gap-4">
                                    <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
                                        <div className="text-primary-600 text-sm font-medium mb-1">Today's Patients</div>
                                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">42</div>
                                        <div className="text-xs text-primary-500 mt-1">+12 from yesterday</div>
                                    </div>
                                    <div className="bg-secondary-50 dark:bg-secondary-900/20 p-4 rounded-xl border border-secondary-100 dark:border-secondary-800">
                                        <div className="text-secondary-600 text-sm font-medium mb-1">Pending Vitals</div>
                                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">8</div>
                                        <div className="text-xs text-secondary-500 mt-1">Nurse station active</div>
                                    </div>
                                    <div className="col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recent Activity</h3>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live Sync</span>
                                        </div>
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-center gap-3 text-sm">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                        {i === 1 ? <Stethoscope size={14} /> : i === 2 ? <Pill size={14} /> : <FileText size={14} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-slate-100">
                                                            {i === 1 ? 'Dr. Sharma completed consultation' : i === 2 ? 'Pharmacy dispensed medication' : 'Vitals recorded for Patient #1024'}
                                                        </div>
                                                        <div className="text-slate-400 text-xs">2 mins ago</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* AI Chip */}
                                <div className="absolute bottom-4 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                                    AI Risk Analysis Active
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story / Bharat-First Section */}
            <section className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">The Reality of Rural Healthcare</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                            PHC staff work tirelessly, often managing 100+ patients daily with paper registers. We built this platform to lift that burden.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FileText className="h-8 w-8 text-primary-500" />,
                                title: "Less Paperwork, More Care",
                                desc: "Automate registers and reports so doctors and nurses can focus on treating patients."
                            },
                            {
                                icon: <WifiOff className="h-8 w-8 text-secondary-500" />,
                                title: "Offline-First Design",
                                desc: "Works seamlessly without internet. Data syncs automatically when connectivity returns."
                            },
                            {
                                icon: <Heart className="h-8 w-8 text-accent-500" />,
                                title: "Health Records, Anywhere",
                                desc: "Secure digital records accessible across the PHC network, ensuring continuity of care."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
                                <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-xl flex items-center justify-center shadow-sm mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Product Features Section */}
            <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <span className="text-primary-600 font-semibold tracking-wide uppercase text-sm">Built for PHCs</span>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mt-2">End-to-End Hospital Management</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Patient Registration", desc: "Quick entry with ABHA ID support and OCR for ID cards.", icon: <Users /> },
                            { title: "Vitals & Screening", desc: "Record BP, Sugar, and BMI with NCD risk flagging.", icon: <Activity /> },
                            { title: "Doctor Consultation", desc: "Digital prescriptions and history at a glance.", icon: <Stethoscope /> },
                            { title: "Pharmacy & Lab", desc: "Inventory tracking and automated lab reports.", icon: <TestTube /> }
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary-300 transition-colors group">
                                <div className="text-slate-400 group-hover:text-primary-600 transition-colors mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{item.title}</h3>
                                <p className="text-slate-600 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="py-20 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-12 text-center">Empowering Every Team Member</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex gap-4 items-start">
                            <div className="bg-primary-100 p-3 rounded-lg text-primary-600">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Doctor</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">See patient history instantly. Prescribe with AI checks for drug interactions.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-secondary-100 p-3 rounded-lg text-secondary-600">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Nurse</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">Faster vitals recording. Automated alerts for high-risk patients.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="bg-accent-100 p-3 rounded-lg text-accent-600">
                                <Smartphone className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">ASHA Worker</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">Field data collection on mobile. Syncs automatically with the PHC.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Section */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-600 rounded-full blur-3xl opacity-20 -ml-20 -mb-20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">From Paper to Structured Data</h2>
                            <p className="text-slate-300 text-lg mb-8">
                                Our subtle AI features work in the background to reduce errors and save time, without getting in the way of care.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "OCR for handwritten prescriptions and lab reports",
                                    "Smart triage suggestions based on vitals",
                                    "Automated NCD risk scoring (Diabetes/Hypertension)",
                                    "Voice-to-text for easy clinical notes"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-secondary-400" />
                                        <span className="text-slate-200">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-12 w-12 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-slate-900 dark:text-slate-100" />
                                </div>
                                <div>
                                    <div className="font-medium text-white">Smart Scan</div>
                                    <div className="text-sm text-slate-400">Processing handwritten note...</div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-2 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                                <div className="h-2 bg-slate-700 rounded w-1/2 animate-pulse"></div>
                                <div className="h-2 bg-slate-700 rounded w-5/6 animate-pulse"></div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Extracted Data:</span>
                                    <span className="text-green-400 font-mono">BP: 140/90 | Sugar: 180</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-primary-600 p-1.5 rounded-lg">
                                    <Activity className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">PHC Commons</span>
                            </div>
                            <p className="text-slate-500 text-sm max-w-xs">
                                Empowering India's Primary Health Centres with simple, smart, and secure digital infrastructure.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-primary-600">Features</a></li>
                                <li><a href="#" className="hover:text-primary-600">Workflow</a></li>
                                <li><a href="#" className="hover:text-primary-600">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li><a href="#" className="hover:text-primary-600">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-primary-600">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
                        <p>© 2025 PHC Commons. Built for <a href="https://masaischool.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MasaiVerse</a> and <a href="https://www.platformcommons.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Platform Commons</a>  Hackaerena 2.0 Hackathon.</p>
                        <p>Design inspired by modern healthcare SaaS and <a href="https://www.platformcommons.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Platform Commons</a> Design and patterns.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;