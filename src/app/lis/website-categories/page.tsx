"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Search, Loader2, Globe, Edit, Trash2, Activity, Heart, Shield, User, Award, CheckCircle, Zap, Thermometer, Stethoscope, Microscope, Brain, Bone, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";

// Map of common Lucide icons
const IconMap: any = {
    Activity, Heart, Shield, User, Award, CheckCircle,
    Zap, Thermometer, Stethoscope, Microscope, Brain, Bone, Eye
};

export default function WebsiteCategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        tab_name: '',
        name_hi: '',
        name_gu: '',
        icon: 'Activity',
        color_class: 'bg-blue-100 text-blue-600'
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/website-catalog/tabs');
            setCategories(response.data.data);
        } catch (error) {
            toast.error("Failed to load website categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/website-catalog/tabs/${editingItem.tab_id}`, formData);
                toast.success("Updated successfully");
            } else {
                await api.post('/website-catalog/tabs', formData);
                toast.success("Created successfully");
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will delete the tab and all items inside it.")) return;
        try {
            await api.delete(`/website-catalog/tabs/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({
            tab_name: item.tab_name,
            name_hi: item.name_hi || '',
            name_gu: item.name_gu || '',
            icon: item.icon || 'Activity',
            color_class: item.color_class || 'bg-blue-100 text-blue-600'
        });
        setShowModal(true);
    };

    const filteredCategories = categories.filter(item =>
        item.tab_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Website Categories</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage categories displayed on the website homepage</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setFormData({ tab_name: '', name_hi: '', name_gu: '', icon: 'Activity', color_class: 'bg-blue-100 text-blue-600' }); setShowModal(true); }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} /> Add Category
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                            <TableHead>Hindi Name</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Sort Order</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((item) => (
                                <TableRow key={item.tab_id}>
                                    <TableCell className="font-mono text-xs text-slate-500">{item.tab_id}</TableCell>
                                    <TableCell className="font-medium text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-emerald-500" />
                                            {item.tab_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.name_hi}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{item.icon}</span>
                                            {IconMap[item.icon] && (() => {
                                                const Icon = IconMap[item.icon];
                                                return <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />;
                                            })()}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.sort_order}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <button onClick={() => handleEdit(item)} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1">
                                                <Edit size={14} /> Edit
                                            </button>
                                            <button onClick={() => handleDelete(item.tab_id)} className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1">
                                                <Trash2 size={14} /> Delete
                                            </button>
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 border border-slate-100 dark:border-slate-700 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name (English)</label>
                                <input required value={formData.tab_name} onChange={e => setFormData({ ...formData, tab_name: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name (Hindi)</label>
                                <input value={formData.name_hi} onChange={e => setFormData({ ...formData, name_hi: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Name (Gujarati)</label>
                                <input value={formData.name_gu} onChange={e => setFormData({ ...formData, name_gu: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Icon Name (Lucide)</label>
                                <input value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" placeholder="e.g. Activity, Heart, User..." />
                                <p className="text-xs text-slate-500 mt-1">Use icon names from Lucide React library</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Color Class (Tailwind)</label>
                                <input value={formData.color_class} onChange={e => setFormData({ ...formData, color_class: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" placeholder="e.g. bg-blue-100 text-blue-600" />
                                <div className={`mt-2 p-2 rounded text-sm ${formData.color_class}`}>Preview</div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
