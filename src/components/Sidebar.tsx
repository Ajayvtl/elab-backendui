"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSettings } from "@/context/SettingsContext";
import { IconMap } from "@/lib/iconMapping";
import api from "@/lib/api";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const { sidebarCollapsed } = useTheme();
    const { settings } = useSettings();
    const [menuItems, setMenuItems] = useState<any[]>([]);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get('/menus/my-menu');
                let items = response.data?.data;

                // Handle double-serialized JSON (string inside JSON)
                if (typeof items === 'string') {
                    try {
                        items = JSON.parse(items);
                    } catch (e) {
                        console.error("Failed to parse menu items string", e);
                        items = [];
                    }
                }

                if (Array.isArray(items)) {
                    setMenuItems(items);
                } else if (Array.isArray(response.data)) {
                    // Fallback for some old API formats
                    setMenuItems(response.data);
                } else {
                    console.warn("Received invalid menu data, using fallback", response.data);
                    setFallbackMenu();
                }
            } catch (error) {
                console.error("Failed to load menu", error);
                setFallbackMenu();
            }
        };

        const setFallbackMenu = () => {
            setMenuItems([
                { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
                { name: "Orders", href: "/orders", icon: "ShoppingCart" },
                {
                    name: "Logistics",
                    icon: "MapPin",
                    href: "/logistics",
                    children: [
                        { name: "Overview", href: "/logistics" },
                        { name: "Phlebotomists", href: "/logistics/phlebotomists" },
                    ]
                },
                { name: "Patients", href: "/patients", icon: "Users" },
                { name: "Staff", href: "/users", icon: "Users" },
                { name: "Support", href: "/support", icon: "Users" },
                {
                    name: "Admin",
                    icon: "Shield",
                    href: "/admin-panel",
                    children: [
                        {
                            name: "Lab Catalog",
                            icon: "FlaskConical",
                            href: "/lis",
                            children: [
                                { name: "Categories", href: "/lis/categories" },
                                { name: "Subcategories", href: "/lis/subcategories" },
                                { name: "Services (Tests)", href: "/lis/services" },
                                { name: "Packages", href: "/lis/packages" },
                            ]
                        },
                        { name: "Finance", href: "/finance", icon: "FileText" },
                        { name: "Coupons", href: "/settings/coupons", icon: "Tag" },
                        { name: "Roles", href: "/settings/roles", icon: "Shield" },
                    ]
                },
                {
                    name: "App Settings",
                    icon: "Smartphone",
                    href: "/app-settings",
                    children: [
                        { name: "Referrals", href: "/referrals", icon: "Users" },
                        { name: "Notifications", href: "/settings/notifications", icon: "Activity" },
                        { name: "Locations", href: "/settings/locations", icon: "MapPin" },
                        { name: "Gallery", href: "/settings/gallery", icon: "ImageIcon" },
                        { name: "Website", href: "/lis/website-catalog" },
                        { name: "Website Categories", href: "/lis/website-categories" },
                    ]
                }
            ]);
        };

        if (user) fetchMenu();
    }, [user]);

    const settingsItems = [
        { name: "General", href: "/settings/general", icon: "Settings" },
        { name: "Departments", href: "/settings/departments", icon: "Users" },
    ];

    const renderMenuItem = (item: any, level: number = 0) => {
        // Check if any child is active (recursive)
        const isChildActiveRecursive = (currentItem: any): boolean => {
            if (currentItem.children) {
                return currentItem.children.some((child: any) =>
                    pathname.startsWith(child.href) || isChildActiveRecursive(child)
                );
            }
            return false;
        };

        const isChildActive = isChildActiveRecursive(item);
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.children);

        // Base padding + level indentation
        const paddingLeftClass = level === 0 ? 'px-4' : level === 1 ? 'pl-12 pr-4' : 'pl-20 pr-4';

        // Resolve Icon
        // Item icon might be a string name or element. The API sends strings.
        const IconComponent = typeof item.icon === 'string' ? IconMap[item.icon] : null;
        const iconElement = IconComponent ? <IconComponent size={level === 0 ? 22 : 18} /> : (item.icon || <Shield size={18} />);

        if (item.children) {
            return (
                <div key={item.name} className="space-y-1">
                    <div
                        className={`flex items-center gap-4 ${paddingLeftClass} py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden cursor-default ${isChildActive
                            ? "bg-slate-800 text-white"
                            : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                    >
                        <span className={`relative z-10 ${isChildActive ? 'text-emerald-400' : ''}`}>
                            {iconElement}
                        </span>
                        {!sidebarCollapsed && <span className="relative z-10 font-medium tracking-wide whitespace-nowrap flex-1">{item.name}</span>}
                    </div>

                    {!sidebarCollapsed && (
                        <div className="space-y-1">
                            {item.children.map((child: any) => renderMenuItem(child, level + 1))}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                title={sidebarCollapsed ? item.name : ''}
                className={`flex items-center gap-4 ${paddingLeftClass} py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/20"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
                <span className={`relative z-10 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {iconElement}
                </span>
                {!sidebarCollapsed && <span className="relative z-10 font-medium tracking-wide whitespace-nowrap">{item.name}</span>}

                {/* Active Indicator */}
                {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full"></div>
                )}
            </Link>
        );
    };

    return (
        <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-slate-900 dark:bg-slate-950 text-white h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50 font-sans transition-all duration-300 border-r border-slate-800 dark:border-slate-900`}>
            {/* Logo Section */}
            <div className={`p-6 flex items-center gap-3 border-b border-slate-800/50 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0 overflow-hidden">
                    <img src={settings.logo} alt={settings.brand_name} className="w-full h-full object-contain p-1" />
                </div>
                {!sidebarCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{settings.brand_name}</h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Admin Console</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar">
                {!sidebarCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main Menu</p>}
                {menuItems?.map((item) => renderMenuItem(item as any))}

                <div className="mt-8 border-t border-slate-800/50 pt-4">
                    {!sidebarCollapsed && <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Settings</p>}
                    {settingsItems.map((item) => renderMenuItem(item as any))}
                </div>
            </nav>

            {/* User Profile / Logout */}
            <div className="p-3 border-t border-slate-800/50 bg-slate-900/50 dark:bg-slate-950/50 backdrop-blur-xl">
                <button
                    onClick={logout}
                    title="Sign Out"
                    className={`flex items-center gap-3 px-4 py-3 w-full text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 group ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                    <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={20} />
                    </div>
                    {!sidebarCollapsed && <span className="font-medium whitespace-nowrap">Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
