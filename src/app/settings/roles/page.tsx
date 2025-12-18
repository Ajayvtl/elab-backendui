"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, Save, Shield, Check, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export default function RolesPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [rolePermissions, setRolePermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    // Modules list derived from permissions
    const modules = Array.from(new Set(permissions.map(p => p.module)));
    const actions = ['view', 'add', 'edit', 'delete', 'export'];
    const scopes = ['global', 'state', 'city', 'own'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/users/roles'),
                api.get('/users/permissions')
            ]);
            setRoles(rolesRes.data.data);
            setPermissions(permsRes.data.data);

            // Select first role by default
            if (rolesRes.data.data.length > 0) {
                handleRoleSelect(rolesRes.data.data[0]);
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = async (role: any) => {
        setSelectedRole(role);
        try {
            const res = await api.get(`/users/roles/${role.id}/permissions`);
            setRolePermissions(res.data.data);
        } catch (error) {
            toast.error("Failed to load role permissions");
        }
    };

    const togglePermission = (slug: string) => {
        if (selectedRole?.id === 1) return; // Prevent editing Super Admin

        setRolePermissions(prev => {
            if (prev.includes(slug)) {
                return prev.filter(p => p !== slug);
            } else {
                return [...prev, slug];
            }
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            await api.put(`/users/roles/${selectedRole.id}/permissions`, { permissions: rolePermissions });
            toast.success("Permissions updated successfully");
        } catch (error) {
            toast.error("Failed to update permissions");
        } finally {
            setSaving(false);
        }
    };

    const handleCreateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users/roles', newRole);
            toast.success("Role created");
            setShowCreateModal(false);
            setNewRole({ name: '', description: '' });
            fetchData();
        } catch (error) {
            toast.error("Failed to create role");
        }
    };

    const getPermissionSlug = (module: string, action: string, scope: string) => `${module}.${action}.${scope}`;

    const isSuperAdmin = selectedRole?.id === 1;

    return (
        <div className="p-8 max-w-[1600px] mx-auto h-[calc(100vh-64px)] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Roles & Permissions</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage user roles and granular access controls</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} />
                    Create Role
                </button>
            </div>

            <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
                {/* Roles List */}
                <div className="w-64 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                        Roles
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => handleRoleSelect(role)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center justify-between ${selectedRole?.id === role.id
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {role.name}
                                {role.id === 1 && <Shield size={14} className="text-emerald-500" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Permissions Matrix */}
                <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <h2 className="font-bold text-lg text-slate-800 dark:text-white">{selectedRole?.name} Permissions</h2>
                            {isSuperAdmin && (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs rounded-full flex items-center gap-1 font-medium">
                                    <AlertTriangle size={12} />
                                    Super Admin permissions are immutable
                                </span>
                            )}
                        </div>
                        {!isSuperAdmin && (
                            <button
                                onClick={handleSavePermissions}
                                disabled={saving}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-md"
                            >
                                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                Save Changes
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900 sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-4 font-bold border-b dark:border-slate-700">Module</th>
                                    {actions.map(action => (
                                        <th key={action} className="px-6 py-4 font-bold border-b dark:border-slate-700 text-center">{action}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {modules.map(module => (
                                    <tr key={module} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-800 dark:text-white capitalize border-r dark:border-slate-700 bg-slate-50/30 dark:bg-slate-900/30">
                                            {module.replace('_', ' ')}
                                        </td>
                                        {actions.map(action => (
                                            <td key={action} className="px-6 py-4 border-r dark:border-slate-700 last:border-r-0">
                                                <div className="flex flex-col gap-2">
                                                    {scopes.map(scope => {
                                                        const slug = getPermissionSlug(module, action, scope);
                                                        const isChecked = isSuperAdmin || rolePermissions.includes(slug);

                                                        // Check if this permission actually exists in our definitions
                                                        // Fallback: If permissions array is empty (API fail), show nothing.
                                                        // If permissions array has data but not this slug, don't show.
                                                        const exists = permissions.length > 0 && permissions.some(p => p.slug === slug);

                                                        // Debug: If permissions are loaded but 'exists' is false, it means mismatch.
                                                        // If permissions are empty, nothing shows.

                                                        if (!exists) return null;

                                                        return (
                                                            <label key={slug} className={`flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700/50`}>
                                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked
                                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                                                    }`}>
                                                                    {isChecked && <Check size={10} strokeWidth={4} />}
                                                                </div>
                                                                <input
                                                                    type="checkbox"
                                                                    className="hidden"
                                                                    checked={isChecked}
                                                                    onChange={() => togglePermission(slug)}
                                                                    disabled={isSuperAdmin}
                                                                />
                                                                <span className={`text-xs capitalize ${isChecked ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                                    {scope}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Create New Role</h2>
                        <form onSubmit={handleCreateRole} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                    value={newRole.name}
                                    onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                    rows={3}
                                    value={newRole.description}
                                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                >
                                    Create Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
