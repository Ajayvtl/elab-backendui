"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface SettingsContextType {
    settings: {
        site_name: string;
        brand_name: string;
        logo: string;
        contact_email: string;
        contact_phone: string;
        contact_address: string;
        currency: string;
        language: string;
    };
    loading: boolean;
    refreshSettings: () => void;
    formatCurrency: (amount: number) => string;
    t: (key: string) => string;
    setResult: (key: string, value: any) => void;
}

const translations: any = {
    en: {
        dashboard: "Dashboard",
        orders: "Orders",
        logistics: "Logistics",
        patients: "Patients",
        staff: "Staff",
        settings: "Settings",
        finance: "Finance",
        logout: "Sign Out"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        orders: "आर्डर",
        logistics: "रसद (Logistics)",
        patients: "रोगी",
        staff: "कर्मचारी",
        settings: "सेटिंग्स",
        finance: "वित्त",
        logout: "साइन आउट"
    },
    gu: { // Gujarati
        dashboard: "ડેશબોર્ડ",
        orders: "ઓર્ડર",
        logistics: "લોજિસ્ટિક્સ",
        patients: "દર્દીઓ",
        staff: "સ્ટાફ",
        settings: "સેટિંગ્સ",
        finance: "નાણાં",
        logout: "સાઇન આઉટ"
    },
    mr: { // Marathi
        dashboard: "डॅशबोर्ड",
        orders: "ऑर्डर",
        logistics: "लॉजिस्टिक्स",
        patients: "रुग्ण",
        staff: "कर्मचारी",
        settings: "सेटिंग्ज",
        finance: "वित्त",
        logout: "बाहेर पडा"
    },
    bn: { // Bengali
        dashboard: "ড্যাশবোর্ড",
        orders: "অর্ডার",
        logistics: "লজিস্টিকস",
        patients: "রোগী",
        staff: "স্টাফ",
        settings: "সেটিংস",
        finance: "অর্থ",
        logout: "সাইন আউট"
    },
    ar: { // Arabic
        dashboard: "لوحة القيادة",
        orders: "الطلبات",
        logistics: "الخدمات اللوجستية",
        patients: "المرضى",
        staff: "الموظفين",
        settings: "الإعدادات",
        finance: "المالية",
        logout: "تسجيل خروج"
    }
};

const currencies: any = {
    INR: { symbol: '₹', locale: 'en-IN' },
    USD: { symbol: '$', locale: 'en-US' },
    EUR: { symbol: '€', locale: 'de-DE' },
    AED: { symbol: 'AED', locale: 'ar-AE' }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState({
        site_name: 'Pathology Management',
        brand_name: 'Lab Admin',
        logo: '',
        contact_email: '',
        contact_phone: '',
        contact_address: '',
        currency: 'INR',
        language: 'en'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/public');
            if (response.data && response.data.data) {
                const data = response.data.data;
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    logo: data.logo ? (data.logo.startsWith('http') ? data.logo : `${process.env.NEXT_PUBLIC_API_URL}${data.logo}`) : prev.logo,
                    // Ensure defaults if API returns null/undefined
                    currency: data.currency || prev.currency,
                    language: data.language || prev.language
                }));
            }
        } catch (error) {
            console.error("Failed to load global settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Helper to update settings locally (and optionally save to API if we added an endpoint for that)
    const setResult = (key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        // Ideally we would also POST to API here to persist preference
    };

    const formatCurrency = (amount: number) => {
        const curr = currencies[settings.currency] || currencies['INR'];
        return new Intl.NumberFormat(curr.locale, {
            style: 'currency',
            currency: settings.currency,
            minimumFractionDigits: 2
        }).format(amount);
    };

    const t = (key: string) => {
        const lang = translations[settings.language] || translations['en'];
        return lang[key] || key;
    };

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, formatCurrency, t, setResult }}>
            {children}
            {/* Simple RTL handler */}
            <style jsx global>{`
                :root {
                    direction: ${settings.language === 'ar' ? 'rtl' : 'ltr'};
                }
                body {
                    direction: ${settings.language === 'ar' ? 'rtl' : 'ltr'};
                }
            `}</style>
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
