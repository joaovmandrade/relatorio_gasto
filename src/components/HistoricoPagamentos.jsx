import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ListOrdered, ArrowDownUp } from 'lucide-react';

export function HistoricoPagamentos({ payments, onDeletePayment }) {
  const [sortOrder, setSortOrder] = useState('desc');

  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-blue-600" />
          Histórico de pagamentos
        </CardTitle>
        <button 
          onClick={toggleSort}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowDownUp className="h-4 w-4" />
          Ordenar por data
        </button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Método de pagamento</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium text-right">Total acumulado pago</th>
                <th className="px-4 py-3 font-medium text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Nenhum pagamento registrado ainda.
                  </td>
                </tr>
              ) : (
                sortedPayments.map((payment, index) => {
                  // Calculate cumulative total for this specific payment in the list
                  // To be accurate regardless of sorting, we calculate based on chronological order
                  const allChronological = [...payments].sort((a, b) => new Date(a.date) - new Date(b.date));
                  const chronologicalIndex = allChronological.findIndex(p => p.id === payment.id);
                  const cumulativeTotal = allChronological
                    .slice(0, chronologicalIndex + 1)
                    .reduce((sum, p) => sum + p.amount, 0);

                  return (
                    <tr key={payment.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">{formatDate(payment.date)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.method === 'Pix' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {payment.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#E5E7EB]">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {formatCurrency(cumulativeTotal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm("Tem certeza que deseja remover este pagamento?")) {
                              onDeletePayment(payment.id);
                            }
                          }}
                          className="px-3 py-1 bg-red-500 text-white rounded-md text-xs font-semibold hover:bg-red-600 transition-colors"
                        >
                          Remover
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
