"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Search, Loader2, FlaskConical } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function LisPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        status: 'active'
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/lis/categories');
            setCategories(response.data.data);
        } catch (error) {
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-')
            };

            if (editingItem) {
                await api.put(`/lis/categories/${editingItem.id}`, payload);
                toast.success("Category updated");
            } else {
                await api.post('/lis/categories', payload);
                toast.success("Category created");
            }
            setShowModal(false);
            setEditingItem(null);
            setFormData({ name: '', description: '', slug: '', status: 'active' });
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/lis/categories/${id}`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lab Categories</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage test categories and departments</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setFormData({ name: '', description: '', slug: '', status: 'active' }); setShowModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} />
                    Add Category
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{category.id}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                                                <FlaskConical size={16} />
                                            </div>
                                            <span className="font-medium text-slate-800 dark:text-white">{category.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{category.description}</TableCell>
                                    <TableCell>
                                        <Badge variant={category.status === 'active' ? 'success' : 'neutral'}>
                                            {category.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingItem(category);
                                                    setFormData({
                                                        name: category.name,
                                                        description: category.description || '',
                                                        slug: category.slug,
                                                        status: category.status
                                                    });
                                                    setShowModal(true);
                                                }}
                                                className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button onClick={() => handleDelete(category.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-700">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (Optional)</label>
                                <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
