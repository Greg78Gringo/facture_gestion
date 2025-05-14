import React, { useState, useEffect } from 'react';
import { FileText, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import StatBox from '../components/dashboard/StatBox';
import CustomDateStats from '../components/dashboard/CustomDateStats';

interface InvoiceStats {
  total: number;
  imported: number;
  notImported: number;
  totalAmount: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [weeklyStats, setWeeklyStats] = useState<InvoiceStats>({
    total: 0,
    imported: 0,
    notImported: 0,
    totalAmount: 0
  });
  const [monthlyStats, setMonthlyStats] = useState<InvoiceStats>({
    total: 0,
    imported: 0,
    notImported: 0,
    totalAmount: 0
  });
  const [customStats, setCustomStats] = useState<InvoiceStats>({
    total: 0,
    imported: 0,
    notImported: 0,
    totalAmount: 0
  });
  const [customDateRange, setCustomDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchStats = async (startDate: Date, endDate: Date) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('facture_btp')
      .select('*')
      .eq('user_id', user.id)
      .gte('date_facture', format(startDate, 'yyyy-MM-dd'))
      .lte('date_facture', format(endDate, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching stats:', error);
      return null;
    }

    const stats: InvoiceStats = {
      total: data.length,
      imported: data.filter(invoice => invoice.importe).length,
      notImported: data.filter(invoice => !invoice.importe).length,
      totalAmount: data.reduce((sum, invoice) => sum + invoice.montant_total, 0)
    };

    return stats;
  };

  useEffect(() => {
    const loadWeeklyStats = async () => {
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const stats = await fetchStats(weekStart, weekEnd);
      if (stats) setWeeklyStats(stats);
    };

    const loadMonthlyStats = async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const stats = await fetchStats(monthStart, monthEnd);
      if (stats) setMonthlyStats(stats);
    };

    if (user) {
      loadWeeklyStats();
      loadMonthlyStats();
    }
  }, [user]);

  useEffect(() => {
    const loadCustomStats = async () => {
      if (!customDateRange.startDate || !customDateRange.endDate) return;
      const stats = await fetchStats(
        new Date(customDateRange.startDate),
        new Date(customDateRange.endDate)
      );
      if (stats) setCustomStats(stats);
    };

    if (user) {
      loadCustomStats();
    }
  }, [user, customDateRange]);

  const handleDateChange = (type: 'startDate' | 'endDate', value: string) => {
    setCustomDateRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  return (
    <div className="space-y-6 bg-gray-200 -m-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatBox 
          title="Cette semaine" 
          stats={weeklyStats}
          icon={FileText}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatBox 
          title="Ce mois" 
          stats={monthlyStats}
          icon={Calendar}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <CustomDateStats
          stats={customStats}
          dateRange={customDateRange}
          onDateChange={handleDateChange}
        />
      </div>
    </div>
  );
};

export default Dashboard;