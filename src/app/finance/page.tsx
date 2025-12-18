"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Search, Loader2, FileText, Download, DollarSign, CreditCard } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useSettings } from "@/context/SettingsContext";

export default function FinancePage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' or 'payments'
    const { formatCurrency, t } = useSettings();

    useEffect(() => {
        fetchFinanceData();
    }, [activeTab]);

    const fetchFinanceData = async () => {
        setLoading(true);
        try {
            // Mocking for now as I suspect the list endpoints are missing
            setInvoices([]);
        } catch (error) {
            // toast.error("Failed to load finance data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Finance</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage invoices and track payments</p>
                </div>
                <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('invoices')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'invoices' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Invoices
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'payments' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        Payments
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={<FileText size={24} />}
                    label={t('total_invoiced')}
                    value={formatCurrency(12450)}
                    color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
                />
                <StatCard
                    icon={<DollarSign size={24} />}
                    label={t('received')}
                    value={formatCurrency(10200)}
                    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                />
                <StatCard
                    icon={<CreditCard size={24} />}
                    label={t('pending')}
                    value={formatCurrency(2250)}
                    color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300"
                />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
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
                            <TableHead>Order #</TableHead>
                            <TableHead>{t('amount')}</TableHead>
                            <TableHead>{t('status')}</TableHead>
                            <TableHead>{t('date')}</TableHead>
                            <TableHead>{t('actions')}</TableHead>
                        </TableHeader>
                        <TableBody>
                            {/* Placeholder Data */}
                            <TableRow>
                                <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">INV-2024-001</TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">ORD-2024-1001</TableCell>
                                <TableCell className="font-medium text-slate-800 dark:text-white">{formatCurrency(150.00)}</TableCell>
                                <TableCell>
                                    <Badge variant="success">PAID</Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400">Oct 24, 2024</TableCell>
                                <TableCell>
                                    <button className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                        <Download size={18} />
                                    </button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">INV-2024-002</TableCell>
                                <TableCell className="text-slate-700 dark:text-slate-300">ORD-2024-1005</TableCell>
                                <TableCell className="font-medium text-slate-800 dark:text-white">{formatCurrency(320.00)}</TableCell>
                                <TableCell>
                                    <Badge variant="warning">PENDING</Badge>
                                </TableCell>
                                <TableCell className="text-slate-500 dark:text-slate-400">Oct 25, 2024</TableCell>
                                <TableCell>
                                    <button className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                        <Download size={18} />
                                    </button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{label}</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
                </div>
            </div>
        </div>
    );
}
