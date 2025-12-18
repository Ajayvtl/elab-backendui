"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Plus, Loader2, Upload, Download, Tag, Search, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import * as XLSX from 'xlsx';

import ImportReviewModal from "@/components/lis/ImportReviewModal";

export default function SubcategoriesPage() {
    const [subcategories, setSubcategories] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        category_id: '',
        subcategory_name: '',
        is_active: true
    });

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importAnalysis, setImportAnalysis] = useState<any>(null);
    const [importCategoryId, setImportCategoryId] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subRes, catRes] = await Promise.all([
                api.get('/lab-catalog/subcategories'),
                api.get('/lab-catalog/categories')
            ]);
            setSubcategories(subRes.data.data);
            setCategories(catRes.data.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/lab-catalog/subcategories/${editingItem.subcategory_id}`, formData);
                toast.success("Updated successfully");
            } else {
                await api.post('/lab-catalog/subcategories', formData);
                toast.success("Created successfully");
            }
            setShowModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/lab-catalog/subcategories/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { category_name: "Hematology", subcategory_name: "CBC / Blood Counts", is_active: "Active" },
            { category_name: "Clinical Biochemistry", subcategory_name: "Liver Function Tests (LFT)", is_active: "Active" },
            { category_name: "Microbiology", subcategory_name: "Culture & Sensitivity", is_active: "Inactive" }
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Subcategories");
        XLSX.writeFile(wb, "subcategories_sample.xlsx");
    };

    // Import State logic moved up
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'subcategories');
        if (importCategoryId) formData.append('categoryId', importCategoryId);

        const toastId = toast.loading("Analyzing file...");
        try {
            const res = await api.post('/lab-catalog/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.dismiss(toastId);
            setImportAnalysis(res.data.data);
            setImportModalOpen(true);
            setShowUploadModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    const filteredItems = subcategories.filter(item => {
        const matchesSearch = item.subcategory_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory ? item.category_id == filterCategory : true;
        return matchesSearch && matchesCategory;
    });

    const handleDownloadCSV = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(subcategories.map(item => ({
            ID: item.subcategory_id,
            Category: item.category_name,
            Subcategory: item.subcategory_name,
            Status: item.is_active ? 'Active' : 'Inactive'
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Subcategories");
        XLSX.writeFile(wb, "subcategories_export.csv");
    };

    // ... (render)
    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Import Analysis Modal */}
            {importAnalysis && (
                <ImportReviewModal
                    isOpen={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                    type="subcategories"
                    analysisData={importAnalysis}
                    onSuccess={fetchData}
                />
            )}

            {/* Upload Settings Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm p-6 border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold mb-4">Import Subcategories</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Select Target Category</label>
                                <select
                                    value={importCategoryId}
                                    onChange={(e) => setImportCategoryId(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900"
                                >
                                    <option value="">-- Detect from File --</option>
                                    {categories.map(c => (
                                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    If selected, all items in the file will belong to this category.
                                </p>
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center gap-2"
                            >
                                <Upload size={18} /> Select File to Upload
                            </button>
                            <button onClick={() => setShowUploadModal(false)} className="w-full py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lab Subcategories</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage subgroups within categories</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownloadCSV} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                        <FileSpreadsheet size={18} /> Export CSV
                    </button>
                    <button onClick={handleDownloadSample} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                        <Download size={18} /> Sample
                    </button>
                    <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center gap-2 hover:bg-slate-50">
                        <Upload size={18} /> Import
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept=".xlsx,.xls,.csv" onChange={handleUpload} />

                    <button
                        onClick={() => { setEditingItem(null); setFormData({ category_id: categories[0]?.category_id || '', subcategory_name: '', is_active: true }); setShowModal(true); }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Add Subcategory
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search subcategories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>Category</TableHead>
                            <TableHead>Subcategory Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.subcategory_id}>
                                    <TableCell className="text-slate-500">{item.category_name}</TableCell>
                                    <TableCell className="font-medium text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-emerald-500" />
                                            {item.subcategory_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setFormData({ category_id: item.category_id, subcategory_name: item.subcategory_name, is_active: !!item.is_active });
                                                setShowModal(true);
                                            }} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Edit</button>
                                            <button onClick={() => handleDelete(item.subcategory_id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
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
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Subcategory' : 'Add Subcategory'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Parent Category</label>
                                <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900">
                                    <option value="">Select Category</option>
                                    {categories.map(c => (
                                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Subcategory Name</label>
                                <input required value={formData.subcategory_name} onChange={e => setFormData({ ...formData, subcategory_name: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
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
