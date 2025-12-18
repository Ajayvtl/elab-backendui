"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Bell, Trash2, Send, Loader2, X, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [coupons, setCoupons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<any>({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        coupon_id: '',
        valid_from: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        expires_at: ''
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notifRes, couponRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/coupons')
            ]);
            setNotifications(notifRes.data.data);
            setCoupons(couponRes.data.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('message', formData.message);
            data.append('type', formData.type);
            data.append('target', formData.target);
            if (formData.coupon_id) data.append('coupon_id', formData.coupon_id);
            if (formData.valid_from) data.append('valid_from', formData.valid_from);
            if (formData.expires_at) data.append('expires_at', formData.expires_at);
            if (imageFile) data.append('image', imageFile);

            await api.post('/notifications', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Notification sent successfully");
            setShowModal(false);
            setFormData({
                title: '',
                message: '',
                type: 'info',
                target: 'all',
                coupon_id: '',
                valid_from: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
                expires_at: ''
            });
            setImageFile(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send notification");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this notification?")) return;
        try {
            await api.delete(`/notifications/${id}`);
            toast.success("Notification deleted");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete notification");
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Push Notifications</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage and send app notifications</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
                >
                    <Send size={18} />
                    Send Notification
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableHead>Title</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Coupon</TableHead>
                            <TableHead>Sent At</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableHeader>
                        <TableBody>
                            {notifications.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium text-slate-800 dark:text-white">{item.title}</TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 max-w-md truncate">{item.message}</TableCell>
                                    <TableCell>
                                        <div onClick={async () => {
                                            if (confirm(`Are you sure you want to ${item.is_active ? 'deactivate' : 'activate'} this notification?`)) {
                                                try {
                                                    await api.put(`/notifications/${item.id}/status`, { is_active: !item.is_active });
                                                    toast.success("Status updated");
                                                    fetchData();
                                                } catch (err) {
                                                    toast.error("Failed to update status")
                                                }
                                            }
                                        }} className="cursor-pointer">
                                            <Badge variant={item.is_active ? 'success' : 'neutral'}>
                                                {item.is_active ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {item.coupon_code ? (
                                            <span className="flex items-center gap-1 text-xs font-mono bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded">
                                                <Tag size={12} /> {item.coupon_code}
                                            </span>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm">
                                        {new Date(item.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {notifications.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">No notifications sent yet</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Send Notification</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Summer Sale!"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                                <textarea
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                    rows={3}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    placeholder="e.g. Get 20% off on all tests..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="info">Info</option>
                                        <option value="promo">Promo</option>
                                        <option value="alert">Alert</option>
                                        <option value="update">Update</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Audience</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                        value={formData.target}
                                        onChange={e => setFormData({ ...formData, target: e.target.value })}
                                    >
                                        <option value="all">All Users</option>
                                        <option value="website">Website Only</option>
                                        <option value="app">Mobile App Only</option>
                                        <option value="doctors">Doctors</option>
                                        <option value="tester">Tester App</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Coupon (Optional)</label>
                                    <select
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                        value={formData.coupon_id}
                                        onChange={e => {
                                            const couponId = e.target.value;
                                            setFormData((prev: any) => {
                                                const newState = { ...prev, coupon_id: couponId };
                                                if (couponId) {
                                                    const coupon = coupons.find(c => c.id.toString() === couponId);
                                                    if (coupon && coupon.valid_until) {
                                                        const couponExpiry = new Date(coupon.valid_until).toISOString().slice(0, 16);
                                                        // Ensure notification doesn't expire after coupon
                                                        if (!prev.expires_at || prev.expires_at > couponExpiry) {
                                                            newState.expires_at = couponExpiry;
                                                        }
                                                    }
                                                }
                                                return newState;
                                            });
                                        }}
                                    >
                                        <option value="">None</option>
                                        {coupons.filter(c => c.status === 'active' && (!c.valid_until || new Date(c.valid_until) > new Date())).map(c => (
                                            <option key={c.id} value={c.id}>{c.code} ({c.type === 'percentage' ? `${c.value}%` : `$${c.value}`})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    {/* Spacer or Image input logic */}
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image (Optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                        onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valid From</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                        value={formData.valid_from}
                                        onChange={e => setFormData({ ...formData, valid_from: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valid Until</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                        value={formData.expires_at}
                                        max={
                                            formData.coupon_id
                                                ? coupons.find(c => c.id.toString() === formData.coupon_id)?.valid_until?.slice(0, 16)
                                                : undefined
                                        }
                                        onChange={e => setFormData({ ...formData, expires_at: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={sending}
                                    className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex justify-center items-center gap-2"
                                >
                                    {sending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
