"use client";

import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { Bell, Menu, Moon, Search, Sun, Type, User, Monitor, LogOut, Settings, Globe } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function TopNavbar() {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleTheme, increaseFontSize, decreaseFontSize, toggleSidebar, sidebarCollapsed } = useTheme();
    const { settings, setResult } = useSettings();
    const [ipAddress, setIpAddress] = useState<string>('Loading...');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const langRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Mock IP fetch
        fetch('https://api.ipify.org?format=json')
            .then(res => res.json())
            .then(data => setIpAddress(data.ip))
            .catch(() => setIpAddress('127.0.0.1'));

        // Close dropdowns on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
            if (langRef.current && !langRef.current.contains(event.target as Node)) {
                setShowLangMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className={`h-16 fixed top-0 right-0 ${sidebarCollapsed ? 'left-20' : 'left-72'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-40 flex items-center justify-between px-6 transition-all duration-300`}>
            {/* Left: Sidebar Toggle & Search */}
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors">
                    <Menu size={20} />
                </button>
                <div className="relative hidden md:block group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Global Search..."
                        className="pl-10 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900 w-64 transition-all"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* IP Address */}
                <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full shadow-sm">
                    <Monitor size={12} className="text-emerald-500" />
                    <span className="tracking-wide">{ipAddress}</span>
                </div>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden lg:block"></div>

                {/* Font Size */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                    <button onClick={decreaseFontSize} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"><Type size={14} /></button>
                    <button onClick={increaseFontSize} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 transition-colors"><Type size={18} /></button>
                </div>

                {/* Language / Currency Switcher */}
                <div className="relative" ref={langRef}>
                    <button
                        onClick={() => setShowLangMenu(!showLangMenu)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        title="Language & Currency"
                    >
                        <Globe size={20} />
                    </button>

                    {showLangMenu && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 p-4 animate-in fade-in slide-in-from-top-2 z-50">
                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Language</h3>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {['en', 'hi', 'gu', 'mr', 'bn', 'ar'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => { setResult('language', lang); setShowLangMenu(false); }}
                                        className={`px-2 py-1.5 text-sm rounded-md transition-colors ${settings.language === lang ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {lang === 'en' ? 'English' :
                                            lang === 'hi' ? 'हिंदी' :
                                                lang === 'gu' ? 'ગુજરાતી' :
                                                    lang === 'mr' ? 'मराठी' :
                                                        lang === 'bn' ? 'বাংলা' : 'العربية'}
                                    </button>
                                ))}
                            </div>

                            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Currency</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {['INR', 'USD', 'EUR', 'AED'].map(curr => (
                                    <button
                                        key={curr}
                                        onClick={() => { setResult('currency', curr); setShowLangMenu(false); }}
                                        className={`px-2 py-1.5 text-sm rounded-md transition-colors ${settings.currency === curr ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {curr}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                    {isDarkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 relative transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative ml-1" ref={profileRef}>
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 hover:opacity-80 transition-opacity"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-tight">{user?.name || 'User'}</p>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500 font-bold">{user?.role_name || 'Admin'}</p>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            )}
                        </div>
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 md:hidden">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                            </div>

                            <Link
                                href="/profile"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <User size={16} /> Profile
                            </Link>
                            <Link
                                href="/settings/roles"
                                onClick={() => setShowProfileMenu(false)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Settings size={16} /> Settings
                            </Link>
                            <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
