"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Loader2, Package, Search } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function PackagesPage() {
    const [packages, setPackages] = useState<any[]>([]); // Added back
    const [loading, setLoading] = useState(true); // Added back
    const [showModal, setShowModal] = useState(false); // Added back
    const [editingItem, setEditingItem] = useState<any>(null); // Added back

    const [tests, setTests] = useState<any[]>([]); // All available tests
    // Form Data with new fields
    const [formData, setFormData] = useState({
        package_name: '',
        description: '',
        price: '',
        slug: '',
        is_active: true,
        is_featured: false,
        is_popular: false,
        testIds: [] as number[]
    });

    useEffect(() => {
        fetchData();
        fetchTests();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/packages');
            setPackages(res.data.data);
        } catch (error) {
            toast.error("Failed to load packages");
        } finally {
            setLoading(false);
        }
    };

    const fetchTests = async () => {
        try {
            const res = await api.get('/lab-catalog/services');
            setTests(res.data.data);
        } catch (e) { console.error("Failed to load tests"); }
    };

    // ... handle submit ...
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/packages/${editingItem.package_id}`, formData);
                toast.success("Updated successfully");
            } else {
                await api.post('/packages', formData);
                toast.success("Created successfully");
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save");
        }
    };

    // ... handle delete ...
    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/packages/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    // Helper to toggle test selection
    const toggleTest = (testId: number) => {
        setFormData(prev => {
            const currentIds = prev.testIds || [];
            const exists = currentIds.includes(testId);
            if (exists) {
                return { ...prev, testIds: currentIds.filter(id => id !== testId) };
            } else {
                return { ...prev, testIds: [...currentIds, testId] };
            }
        });
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Health Packages</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage health packages and bundles</p>
                </div>
                <button
                    onClick={() => {
                        setEditingItem(null);
                        setFormData({
                            package_name: '',
                            description: '',
                            price: '',
                            slug: '',
                            is_active: true,
                            is_featured: false,
                            is_popular: false,
                            testIds: []
                        });
                        setShowModal(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} /> Add Package
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>Package Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Counts</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {packages.map((item) => (
                                <TableRow key={item.package_id}>
                                    <TableCell className="font-medium text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-emerald-500" />
                                            {item.package_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono font-bold">₹{item.price}</TableCell>
                                    <TableCell>{item.test_count || 0} Tests</TableCell>
                                    <TableCell>
                                        <Badge variant={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setFormData({
                                                    package_name: item.package_name,
                                                    description: item.description || '',
                                                    price: item.price,
                                                    slug: item.slug || '',
                                                    is_active: !!item.is_active,
                                                    is_featured: !!item.is_featured,
                                                    is_popular: !!item.is_popular,
                                                    testIds: item.tests ? item.tests.map((t: any) => t.service_id) : []
                                                });
                                                setShowModal(true);
                                            }} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Edit</button>
                                            <button onClick={() => handleDelete(item.package_id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {packages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">No packages found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Package' : 'Add Package'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Package Name</label>
                                    <input required value={formData.package_name} onChange={e => setFormData({ ...formData, package_name: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Included Tests ({formData.testIds?.length || 0})</label>
                                <div className="h-48 overflow-y-auto border rounded-lg bg-slate-50 dark:bg-slate-900 p-2">
                                    {tests.map(test => (
                                        <label key={test.service_id} className={`flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer ${(formData.testIds || []).includes(test.service_id) ? 'bg-emerald-50 dark:bg-emerald-900/10' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={(formData.testIds || []).includes(test.service_id)}
                                                onChange={() => toggleTest(test.service_id)}
                                                className="rounded text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm">{test.test_name}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Tests will be displayed in the order selected (drag-and-drop coming soon).</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug (Optional)</label>
                                    <input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" placeholder="Auto-generated" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Status</label>
                                    <select value={formData.is_active ? "1" : "0"} onChange={e => setFormData({ ...formData, is_active: e.target.value === "1" })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900">
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 pt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({ ...formData, is_featured: e.target.checked })} />
                                        <span className="text-sm font-medium">Featured</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.is_popular} onChange={e => setFormData({ ...formData, is_popular: e.target.checked })} />
                                        <span className="text-sm font-medium">Popular</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg border hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
