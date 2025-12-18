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
    };
    loading: boolean;
    refreshSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState({
        site_name: 'GreenCross Pathology',
        brand_name: 'GreenCross',
        logo: '/logo1.png', // Default fallback
        contact_email: '',
        contact_phone: '',
        contact_address: ''
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings/public'); // Use public endpoint if available, or secure one if logged in
            // Actually, for sidebar we are usually logged in. But let's try the public one for now or authenticated one.
            // Since Sidebar is inside AuthProvider, we can use authenticated route if token exists. 
            // However, to be safe, let's just use the one we have.
            if (response.data && response.data.data) {
                const data = response.data.data;
                setSettings(prev => ({
                    ...prev,
                    ...data,
                    // If logo comes from DB, ensure it has full URL if relative
                    logo: data.logo ? (data.logo.startsWith('http') ? data.logo : `${process.env.NEXT_PUBLIC_API_URL}${data.logo}`) : prev.logo
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

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
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
