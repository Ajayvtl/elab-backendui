"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";
import { Plus, Loader2, Upload, Download, Activity, Search, FileSpreadsheet } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import * as XLSX from 'xlsx';

import ImportReviewModal from "@/components/lis/ImportReviewModal";

export default function ServicesPage() {
    const [services, setServices] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    // Derived state for modal
    const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState({
        test_name: '',
        price: '',
        category_id: '',
        subcategory_id: '',
        slug: '',
        is_active: true
    });

    // Import State
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importAnalysis, setImportAnalysis] = useState<any>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [serRes, catRes, subRes] = await Promise.all([
                api.get('/lab-catalog/services'),
                api.get('/lab-catalog/categories'),
                api.get('/lab-catalog/subcategories')
            ]);
            setServices(serRes.data.data);
            setCategories(catRes.data.data);
            setSubcategories(subRes.data.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    // Filter subcategories when category changes in form
    useEffect(() => {
        if (formData.category_id) {
            setFilteredSubcategories(subcategories.filter(s => s.category_id == formData.category_id));
        } else {
            setFilteredSubcategories([]);
        }
    }, [formData.category_id, subcategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/lab-catalog/services/${editingItem.service_id}`, formData);
                toast.success("Updated successfully");
            } else {
                await api.post('/lab-catalog/services', formData);
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
            await api.delete(`/lab-catalog/services/${id}`);
            toast.success("Deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete");
        }
    };

    const handleDownloadSample = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([
            { category_name: "Hematology", subcategory_name: "CBC / Blood Counts", test_name: "Complete Blood Count", price: 500, pre_test_condition: "Fasting required", is_active: "Active" },
            { category_name: "Biochemistry", subcategory_name: "Liver Function Test", test_name: "Bilirubin Total", price: 150, pre_test_condition: "No restrictions", is_active: "Active" }
        ]);
        XLSX.utils.book_append_sheet(wb, ws, "Services");
        XLSX.writeFile(wb, "services_sample.xlsx");
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'services');

        const toastId = toast.loading("Analyzing file...");
        try {
            const res = await api.post('/lab-catalog/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.dismiss(toastId);
            setImportAnalysis(res.data.data);
            setImportModalOpen(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Upload failed", { id: toastId });
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterSubcategory, setFilterSubcategory] = useState('');

    const filteredItems = services.filter(item => {
        const matchesSearch = item.test_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory ? item.category_id == filterCategory : true;
        const matchesSubcategory = filterSubcategory ? item.subcategory_id == filterSubcategory : true;
        return matchesSearch && matchesCategory && matchesSubcategory;
    });

    // Subcategory dropdown for filter
    const subcatsForFilter = subcategories.filter(s => !filterCategory || s.category_id == filterCategory);

    const handleDownloadCSV = () => {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(services.map(item => ({
            ID: item.service_id,
            TestName: item.test_name,
            Category: item.category_name,
            Subcategory: item.subcategory_name,
            Price: item.price,
            Status: item.is_active ? 'Active' : 'Inactive'
        })));
        XLSX.utils.book_append_sheet(wb, ws, "Services");
        XLSX.writeFile(wb, "services_export.csv");
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            {/* Import Analysis Modal */}
            {importAnalysis && (
                <ImportReviewModal
                    isOpen={importModalOpen}
                    onClose={() => setImportModalOpen(false)}
                    type="services"
                    analysisData={importAnalysis}
                    onSuccess={fetchData}
                />
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lab Services (Tests)</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage individual tests and prices</p>
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
                        onClick={() => {
                            setEditingItem(null);
                            setFormData({ test_name: '', price: '', category_id: '', subcategory_id: '', slug: '', is_active: true });
                            setShowModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        <Plus size={18} /> Add Service
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setFilterSubcategory(''); }}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                    >
                        <option value="">All Categories</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                    <select
                        value={filterSubcategory}
                        onChange={(e) => setFilterSubcategory(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                    >
                        <option value="">All Subcategories</option>
                        {subcatsForFilter.map(s => (
                            <option key={s.subcategory_id} value={s.subcategory_id}>{s.subcategory_name}</option>
                        ))}
                    </select>
                </div>

                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>Test Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Subcategory</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.map((item) => (
                                <TableRow key={item.service_id}>
                                    <TableCell className="font-medium text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-emerald-500" />
                                            {item.test_name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-500">{item.category_name}</TableCell>
                                    <TableCell className="text-slate-500">{item.subcategory_name}</TableCell>
                                    <TableCell className="font-mono text-slate-800 font-bold">₹{item.price}</TableCell>
                                    <TableCell>
                                        <Badge variant={item.is_active ? 'success' : 'neutral'}>{item.is_active ? 'Active' : 'Inactive'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3">
                                            <button onClick={() => {
                                                setEditingItem(item);
                                                setFormData({
                                                    test_name: item.test_name,
                                                    price: item.price,
                                                    category_id: item.category_id,
                                                    subcategory_id: item.subcategory_id,
                                                    slug: item.slug,
                                                    is_active: !!item.is_active
                                                });
                                                setShowModal(true);
                                            }} className="text-emerald-600 hover:text-emerald-700 font-medium text-sm">Edit</button>
                                            <button onClick={() => handleDelete(item.service_id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
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
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingItem ? 'Edit Service' : 'Add Service'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Category</label>
                                    <select required value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value, subcategory_id: '' })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900">
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subcategory</label>
                                    <select required value={formData.subcategory_id} onChange={e => setFormData({ ...formData, subcategory_id: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" disabled={!formData.category_id}>
                                        <option value="">Select Subcategory</option>
                                        {filteredSubcategories.map(s => (
                                            <option key={s.subcategory_id} value={s.subcategory_id}>{s.subcategory_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Test Name</label>
                                <input required value={formData.test_name} onChange={e => setFormData({ ...formData, test_name: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Slug (Optional)</label>
                                    <input value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900" placeholder="Auto-generated if empty" />
                                </div>
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
