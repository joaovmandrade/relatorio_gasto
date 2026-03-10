import React, { useState, useEffect } from 'react';
import { FormularioPagamento } from './FormularioPagamento';
import { HistoricoPagamentos } from './HistoricoPagamentos';
import { Graficos } from './Graficos';
import { Card, CardContent } from './ui/Card';
import { formatCurrency } from '../utils/formatters';
import { CarFront, TrendingUp, HandCoins, PiggyBank } from 'lucide-react';

const VALOR_TOTAL_CARRO = 44500;
const API_URL = 'http://localhost:3001/payments';

export function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Falha ao carregar pagamentos');
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async (payment) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payment),
      });

      if (!response.ok) throw new Error('Falha ao salvar pagamento');
      
      const newPayment = await response.json();
      
      // Update local state directly to be optimistic, then re-sort if needed, 
      // or just re-fetch to ensure sync with DB. Re-fetching is safer.
      fetchPayments();
      
    } catch (error) {
      console.error('Erro ao adicionar pagamento:', error);
      alert('Erro ao salvar no servidor.');
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Falha ao deletar pagamento');
      
      // Refresh to sync state with DB
      fetchPayments();
    } catch (error) {
      console.error('Erro ao deletar pagamento:', error);
      alert('Erro ao excluir no servidor.');
    }
  };

  const totalPago = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const valorRestante = Math.max(0, VALOR_TOTAL_CARRO - totalPago);
  const percentualPago = Math.min(100, (totalPago / VALOR_TOTAL_CARRO) * 100);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando dados...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CarFront className="h-8 w-8 text-blue-600" />
            Dashboard do Veículo
          </h1>
          <p className="text-slate-500 mt-2">Acompanhe os pagamentos (Salvo no Banco de Dados).</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Valor total do carro</p>
                  <h3 className="text-2xl font-bold">{formatCurrency(VALOR_TOTAL_CARRO)}</h3>
                </div>
                <div className="p-3 bg-white/10 rounded-lg">
                  <CarFront className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Total pago</p>
                  <h3 className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPago)}</h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Valor restante</p>
                  <h3 className="text-2xl font-bold text-amber-600">{formatCurrency(valorRestante)}</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <HandCoins className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Percentual pago</p>
                  <h3 className="text-2xl font-bold text-slate-900">{percentualPago.toFixed(1)}%</h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentualPago}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Graficos totalCarro={VALOR_TOTAL_CARRO} totalPago={totalPago} pagamentos={payments} />
          </div>
          <div className="lg:col-span-1">
            <FormularioPagamento onAddPayment={handleAddPayment} />
          </div>
        </div>

        {/* History Table */}
        <div className="grid grid-cols-1">
          <HistoricoPagamentos payments={payments} onDeletePayment={handleDeletePayment} />
        </div>

      </div>
    </div>
  );
}
