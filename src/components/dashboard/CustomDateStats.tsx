import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';

interface InvoiceStats {
  total: number;
  imported: number;
  notImported: number;
  totalAmount: number;
}

interface CustomDateStatsProps {
  stats: InvoiceStats;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  onDateChange: (type: 'startDate' | 'endDate', value: string) => void;
}

const CustomDateStats = ({ stats, dateRange, onDateChange }: CustomDateStatsProps) => (
  <div className="bg-gray-200 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden">
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Période personnalisée</h2>
        <Calendar className="h-6 w-6 text-white/80" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Du
          </label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => onDateChange('startDate', e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">
            Au
          </label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => onDateChange('endDate', e.target.value)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-sm text-white mb-1">Total factures</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-sm text-white mb-1">Montant total</p>
          <p className="text-2xl font-bold text-white">
            {stats.totalAmount.toFixed(2)} €
          </p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg p-3 text-center">
          <CheckCircle className="h-5 w-5 text-white mb-1" />
          <p className="text-sm text-white">Importées</p>
          <p className="text-xl font-bold text-white">{stats.imported}</p>
        </div>
        <div className="flex flex-col items-center justify-center bg-white/10 rounded-lg p-3 text-center">
          <XCircle className="h-5 w-5 text-white mb-1" />
          <p className="text-sm text-white">Non importées</p>
          <p className="text-xl font-bold text-white">{stats.notImported}</p>
        </div>
      </div>
    </div>
  </div>
);

export default CustomDateStats