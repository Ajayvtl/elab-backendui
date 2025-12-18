"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Search, Loader2, Activity } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function TestsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            const response = await api.get('/lis/tests');
            setTests(response.data.data);
        } catch (error) {
            toast.error("Failed to load tests");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Lab Tests</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage individual tests and pricing</p>
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20">
                    <Plus size={18} />
                    Add Test
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search tests..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Sample Type</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {tests.map((test) => (
                                <TableRow key={test.id}>
                                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{test.code}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                                <Activity size={16} />
                                            </div>
                                            <span className="font-medium text-slate-800 dark:text-white">{test.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="neutral">{test.category_name}</Badge>
                                    </TableCell>
                                    <TableCell className="font-semibold text-slate-700 dark:text-slate-300">${test.price}</TableCell>
                                    <TableCell className="text-slate-600 dark:text-slate-400">{test.sample_type}</TableCell>
                                    <TableCell>
                                        <button className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium text-sm">Edit</button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
