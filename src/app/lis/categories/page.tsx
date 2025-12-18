"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Plus, Search, Loader2, FlaskConical, Upload, Download, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import * as XLSX from 'xlsx';

import ImportReviewModal from "@/components/lis/ImportReviewModal";

export default function CategoriesPage() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        category_name: '',
        is_active: true
    });

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importAnalysis, setImportAnalysis] = useState<any>(null);

    // Upload Refs
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/lab-catalog/categories');
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
            if (editingItem) {
                await api.put(`/lab-catalog/categories/${editingItem.category_id}`, formData);
                toast.success("Updated successfully");
            } else {
                await api.post('/lab-catalog/categories', formData);
                toast.success("Created successfully");
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will fail if there are active subcategories.")) return;
        try {
            await api.delete(`/lab-catalog/categories/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    // --- Bulk Import ---
    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { category_name: "Hematology", is_active: 1 },
            { category_name: "Biochemistry", is_active: 1 }
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, "categories_sample.xlsx");
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'categories');

        const toastId = toast.loading("Analyzing file...");
        try {
            const res = await api.post('/lab-catalog/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.dismiss(toastId);
            setImportAnalysis(res.data.data);
            setImportModalOpen(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [searchQuery, setSearchQuery] = useState('');

    const filteredCategories = categories.filter(item =>
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDownloadCSV = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(categories.map(({ category_id, category_name, is_active }) => ({
            ID: category_id,
            Name: category_name,
            Status: is_active ? 'Active' : 'Inactive'
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, "categories_export.csv");
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lab Categories</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage main categories (Departments)</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownloadCSV} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                        <FileSpreadsheet size={18} /> Export CSV
                    </button>
                    <button onClick={handleDownloadSample} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                        <Download size={18} /> Sample
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                        <Upload size={18} /> Import
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept=".xlsx,.xls,.csv" onChange={handleUpload} />

                    <button
                        onClick={() => { setEditingItem(null); setFormData({ category_name: '', is_active: true }); setShowModal(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Add Category
                    </button>
                </div>
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
                            <TableHead>Category Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((item) => (
                                <TableRow key={item.category_id}>
                                    <TableCell className="font-mono text-xs text-slate-500">{item.category_id}</TableCell>
                                    <TableCell className="font-medium text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <FlaskConical className="w-4 h-4 text-emerald-500" />
                                            {item.category_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setFormData({ category_name: item.category_name, is_active: !!item.is_active });
                                                setShowModal(true);
                                            }} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Edit</button>
                                            <button onClick={() => handleDelete(item.category_id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
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
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Category' : 'Add Category'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input required value={formData.category_name} onChange={e => setFormData({ ...formData, category_name: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select value={formData.is_active ? "1" : "0"} onChange={e => setFormData({ ...formData, is_active: e.target.value === "1" })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900">
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
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
