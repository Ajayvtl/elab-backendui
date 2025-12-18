"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import TopNavbar from "./TopNavbar";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";

function LayoutContent({ children, isAuthPage }: { children: React.ReactNode, isAuthPage: boolean }) {
    const { sidebarCollapsed } = useTheme();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {!isAuthPage && <Sidebar />}
            {!isAuthPage && <TopNavbar />}
            <main className={`${!isAuthPage ? (sidebarCollapsed ? 'ml-20' : 'ml-72') : ''} ${!isAuthPage ? 'mt-16' : ''} min-h-screen transition-all duration-300`}>
                {children}
            </main>
        </div>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname === '/login' || pathname === '/register';

    return (
        <ThemeProvider>
            <LayoutContent isAuthPage={isAuthPage}>
                {children}
            </LayoutContent>
        </ThemeProvider>
    );
}
