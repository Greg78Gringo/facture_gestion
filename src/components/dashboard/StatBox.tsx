import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface InvoiceStats {
  total: number;
  imported: number;
  notImported: number;
  totalAmount: number;
}

interface StatBoxProps {
  title: string;
  stats: InvoiceStats;
  icon: React.ElementType;
  gradient: string;
}

const StatBox = ({ title, stats, icon: Icon, gradient }: StatBoxProps) => (
  <div className={`bg-gray-200 rounded-xl shadow-lg overflow-hidden ${gradient}`}>
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Icon className="h-6 w-6 text-white/80" />
      </div>
      <div className="grid grid-cols-2 gap-6">
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

export default StatBox;