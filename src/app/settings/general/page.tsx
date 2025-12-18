"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Save, Loader2, Phone, Mail, MapPin, Globe, Upload, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function GeneralSettings() {
    const [settings, setSettings] = useState({
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        site_name: 'GreenCross Pathology',
        brand_name: 'GreenCross',
        logo: ''
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            const data = response.data.data;
            if (data) {
                setSettings(prev => ({ ...prev, ...data }));
                if (data.logo) {
                    // Prepend API URL if it's a relative path and not already absolute/data URI
                    const logoUrl = data.logo.startsWith('http') ? data.logo : `${process.env.NEXT_PUBLIC_API_URL}${data.logo}`;
                    setLogoPreview(logoUrl);
                }
            }
        } catch (error) {
            // toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            Object.entries(settings).forEach(([key, value]) => {
                if (key !== 'logo') formData.append(key, value);
            });
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            await api.post('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Settings updated successfully");
            // Refresh to confirm saved state
            fetchSettings();
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-emerald-600" /></div>;

    return (
        <div className="p-8 max-w-[1000px] mx-auto">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">General Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Manage site-wide contact information and details.</p>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-8">
                <form onSubmit={handleSave} className="space-y-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                        <Globe size={18} /> Site Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Site Title (SEO)</label>
                            <input
                                type="text"
                                value={settings.site_name}
                                onChange={e => setSettings({ ...settings, site_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand Name (Display)</label>
                            <input
                                type="text"
                                value={settings.brand_name}
                                onChange={e => setSettings({ ...settings, brand_name: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website Logo</label>
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                                ) : (
                                    <ImageIcon className="text-slate-400" />
                                )}
                            </div>
                            <div>
                                <input
                                    type="file"
                                    id="logo-upload"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                                <label
                                    htmlFor="logo-upload"
                                    className="cursor-pointer bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors inline-flex items-center gap-2 text-sm font-medium"
                                >
                                    <Upload size={16} /> Choose Logo
                                </label>
                                <p className="text-xs text-slate-500 mt-2">Recommended: 200x200px PNG/SVG</p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2 pt-4">
                        <Phone size={18} /> Contact Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Email</label>
                            <input
                                type="email"
                                value={settings.contact_email}
                                onChange={e => setSettings({ ...settings, contact_email: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                placeholder="info@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                            <input
                                type="text"
                                value={settings.contact_phone}
                                onChange={e => setSettings({ ...settings, contact_phone: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                                placeholder="+91 123 456 7890"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Address</label>
                        <textarea
                            value={settings.contact_address}
                            onChange={e => setSettings({ ...settings, contact_address: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900"
                            placeholder="123 Medical Center, Health Street..."
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 font-medium ml-auto"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
