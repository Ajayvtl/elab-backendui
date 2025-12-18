"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { LayoutDashboard, Users, FlaskConical, ShoppingCart, Loader2, TrendingUp, ArrowUpRight, Calendar, DollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { useSettings } from "@/context/SettingsContext";

interface DashboardStats {
  totalRevenue: number;
  ordersByStatus: Record<string, number>;
  activePhlebotomists: number;
  recentOrders: any[];
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const { t, formatCurrency, settings } = useSettings();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchStats();
    }
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoadingStats(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader2 className="animate-spin text-emerald-600 w-8 h-8" /></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900 p-8">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('dashboard')}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('welcome_back')}, <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{user.name}</span>. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
            <Calendar size={18} className="text-slate-400" />
            {new Date().toLocaleDateString(settings.language === 'en' ? 'en-US' : settings.language, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </header>

      {loadingStats ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-600 w-10 h-10" /></div>
      ) : stats ? (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<DollarSign size={24} />}
              label={t('total_revenue')}
              value={formatCurrency(stats.totalRevenue)}
              trend="+12.5%"
              color="from-emerald-500 to-teal-500"
              shadow="shadow-emerald-500/20"
            />
            <StatCard
              icon={<ShoppingCart size={24} />}
              label={t('pending_orders')}
              value={stats.ordersByStatus['placed'] || 0}
              trend="+5 new"
              color="from-blue-500 to-indigo-500"
              shadow="shadow-blue-500/20"
            />
            <StatCard
              icon={<FlaskConical size={24} />}
              label={t('completed_tests')}
              value={stats.ordersByStatus['completed'] || 0}
              trend="+8.2%"
              color="from-violet-500 to-purple-500"
              shadow="shadow-violet-500/20"
            />
            <StatCard
              icon={<Users size={24} />}
              label={t('active_staff')}
              value={stats.activePhlebotomists}
              trend="Online"
              color="from-orange-500 to-amber-500"
              shadow="shadow-orange-500/20"
            />
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-500" />
                {t('recent_orders')}
              </h2>
              <button className="text-sm font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors">
                {t('view_all')} <ArrowUpRight size={16} />
              </button>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="p-10 text-center text-slate-400 dark:text-slate-500">{t('no_data')}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableHead>{t('order_id')}</TableHead>
                  <TableHead>{t('customer')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {order.order_number}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold text-xs">
                            {order.user_name.charAt(0)}
                          </div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{order.user_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(order.total_amount)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'completed' ? 'success' :
                            order.status === 'cancelled' ? 'danger' :
                              order.status === 'processing' ? 'warning' :
                                order.status === 'confirmed' ? 'info' :
                                  'neutral'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-500 dark:text-slate-400 text-sm">{new Date(order.created_at).toLocaleDateString()}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-red-500 p-10 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
          Failed to load data. Please check your connection.
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, trend, color, shadow }: any) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white ${shadow} shadow-lg`}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full">
          {trend}
        </div>
      </div>

      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{value}</h3>
      </div>
    </div>
  );
}
