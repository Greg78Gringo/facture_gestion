import React, { useEffect, useState } from 'react';
import { Eye, FileSpreadsheet, Filter, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { utils, writeFile } from 'xlsx';

interface Facture {
  id: number;
  nfacture: string;
  date_facture: string;
  description: string;
  quantite: number;
  montant_total: number;
  importe: boolean;
  url_facture: string;
  user_id: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const Factures = () => {
  const [factures, setFactures] = useState<Facture[]>([]);
  const [filtreImporte, setFiltreImporte] = useState<boolean | null>(null);
  const [selectedFactures, setSelectedFactures] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: '',
    endDate: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadFactures();
    }
  }, [user, filtreImporte, dateRange]);

  const loadFactures = async () => {
    let query = supabase
      .from('facture_btp')
      .select('*')
      .eq('user_id', user?.id);

    if (filtreImporte !== null) {
      query = query.eq('importe', filtreImporte);
    }

    if (dateRange.startDate) {
      query = query.gte('date_facture', dateRange.startDate);
    }
    if (dateRange.endDate) {
      query = query.lte('date_facture', dateRange.endDate);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Erreur lors du chargement des factures:', error);
      return;
    }

    setFactures(data || []);
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedFactures(prev => 
      prev.includes(id) 
        ? prev.filter(factureId => factureId !== id)
        : [...prev, id]
    );
  };

  const updateInvoiceStatus = async (invoiceIds: number[]) => {
    const { error } = await supabase
      .from('facture_btp')
      .update({ importe: true })
      .in('id', invoiceIds);

    if (error) {
      console.error('Erreur lors de la mise à jour des statuts:', error);
      return false;
    }
    return true;
  };

  const exportToExcel = async () => {
    const selectedData = factures.filter(facture => 
      selectedFactures.includes(facture.id)
    );

    // Create Excel file
    const ws = utils.json_to_sheet(selectedData.map(facture => ({
      'N° Facture': facture.nfacture,
      'Date': format(new Date(facture.date_facture), 'dd/MM/yyyy'),
      'Description': facture.description,
      'Quantité': facture.quantite,
      'Montant': facture.montant_total.toFixed(2) + ' €',
      'Statut': facture.importe ? 'Importée' : 'Non importée'
    })));

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Factures');
    writeFile(wb, 'factures_export.xlsx');

    // Update status in database
    const success = await updateInvoiceStatus(selectedFactures);
    if (success) {
      // Refresh the factures list
      await loadFactures();
      // Clear selection
      setSelectedFactures([]);
    }
  };

  const resetFilters = () => {
    setFiltreImporte(null);
    setDateRange({ startDate: '', endDate: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Factures</h1>
        <div className="flex space-x-4">
          <button
            onClick={exportToExcel}
            disabled={selectedFactures.length === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              selectedFactures.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            <FileSpreadsheet className="h-5 w-5" />
            <span>Exporter en Excel</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 leading-tight focus:outline-none focus:border-blue-500"
                value={filtreImporte === null ? '' : filtreImporte.toString()}
                onChange={(e) => setFiltreImporte(e.target.value === '' ? null : e.target.value === 'true')}
              >
                <option value="">Tous les statuts</option>
                <option value="true">Importées</option>
                <option value="false">Non importées</option>
              </select>
              <Filter className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <Calendar className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <div className="relative">
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
              <Calendar className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={resetFilters}
            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedFactures.length === factures.length}
                  onChange={() => {
                    if (selectedFactures.length === factures.length) {
                      setSelectedFactures([]);
                    } else {
                      setSelectedFactures(factures.map(f => f.id));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                N° Facture
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {factures.map((facture) => (
              <tr key={facture.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedFactures.includes(facture.id)}
                    onChange={() => handleCheckboxChange(facture.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {facture.nfacture}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(facture.date_facture), 'dd MMMM yyyy', { locale: fr })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {facture.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {facture.quantite}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {facture.montant_total.toFixed(2)} €
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    facture.importe
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {facture.importe ? 'Importée' : 'Non importée'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <a
                    href={facture.url_facture}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="h-5 w-5" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Factures;