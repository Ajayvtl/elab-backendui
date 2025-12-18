"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import { useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CreateUserContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedRole = searchParams.get('role');
    const [roles, setRoles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role_id: ''
    });

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/users/roles');
            setRoles(response.data.data);
        } catch (error) {
            toast.error("Failed to load roles");
        }
    };

    // When roles load, if we have a preselected role name (like 'patient'), find its ID
    useEffect(() => {
        if (roles.length > 0 && preselectedRole) {
            const role = roles.find(r => r.name.toLowerCase() === preselectedRole.toLowerCase() || r.name.toLowerCase() === 'user');
            if (role) {
                setFormData(prev => ({ ...prev, role_id: role.id }));
            }
        }
    }, [roles, preselectedRole]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users', formData);
            toast.success("User created successfully");

            // Check selected role name to redirect correctly
            const selectedRole = roles.find(r => r.id == Number(formData.role_id));
            const roleName = selectedRole?.name?.toLowerCase();

            if (roleName === 'user' || roleName === 'patient') {
                router.push('/patients');
            } else {
                router.push('/users');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <Link href={preselectedRole === 'patient' ? "/patients" : "/users"} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-2 mb-6 transition-colors">
                <ArrowLeft size={18} /> {preselectedRole === 'patient' ? "Back to Patients" : "Back to Staff"}
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Create New {preselectedRole === 'patient' ? 'Patient' : 'User'}</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                placeholder="john@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
                            <select
                                required
                                value={formData.role_id}
                                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                            >
                                <option value="">Select Role</option>
                                {roles.map(role => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                            Create {preselectedRole === 'patient' ? 'Patient' : 'User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreateUserPage() {
    return (
        <Suspense fallback={<div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>}>
            <CreateUserContent />
        </Suspense>
    );
}
