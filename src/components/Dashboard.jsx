import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FormularioPagamento } from './FormularioPagamento';
import { HistoricoPagamentos } from './HistoricoPagamentos';
import { Graficos } from './Graficos';
import { Card, CardContent } from './ui/Card';
import { formatCurrency } from '../utils/formatters';
import { CarFront, TrendingUp, HandCoins, PiggyBank } from 'lucide-react';

const VALOR_TOTAL_CARRO = 44500;

export function Dashboard() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      
      // Map 'value' from Supabase to 'amount' for legacy compatibility in other components
      const mappedData = data ? data.map(item => ({
        ...item,
        amount: item.value || item.amount
      })) : [];
      
      setPayments(mappedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async ({ paymentDate, paymentValue, paymentMethod }) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert([
          {
            date: paymentDate,
            value: Number(paymentValue),
            method: paymentMethod
          }
        ]);

      if (error) {
        console.error("Erro ao inserir pagamento:", error);
        return;
      }
      
      await fetchPayments();
      
    } catch (error) {
      console.error("Erro ao inserir pagamento:", error);
    }
  };

  const handleDeletePayment = async (id) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh to sync state with DB
      fetchPayments();
    } catch (error) {
      console.error(error);
    }
  };

  const totalPago = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const valorRestante = Math.max(0, VALOR_TOTAL_CARRO - totalPago);
  const percentualPago = (totalPago / VALOR_TOTAL_CARRO) * 100;

  // Previsão de quitação logic
  const groupPaymentsByMonth = () => {
    const monthlyTotals = {};
    payments.forEach(payment => {
      const date = new Date(payment.date);
      // Create a key in format "YYYY-MM"
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[key] = (monthlyTotals[key] || 0) + payment.amount;
    });
    return monthlyTotals;
  };

  const calculateEstimation = () => {
    const monthlyTotals = groupPaymentsByMonth();
    const numberOfMonthsWithPayments = Object.keys(monthlyTotals).length;
    
    if (numberOfMonthsWithPayments === 0) {
      return { msg: "Adicione mais pagamentos para calcular a previsão.", average: 0 };
    }

    const averageMonthly = totalPago / numberOfMonthsWithPayments;
    const monthsRemaining = Math.round(valorRestante / averageMonthly);
    
    if (monthsRemaining === 0 && valorRestante === 0) {
       return { msg: "Carro quitado!", average: averageMonthly };
    }

    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + monthsRemaining);
    
    const estimatedDate = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedDate = estimatedDate.charAt(0).toUpperCase() + estimatedDate.slice(1);
    
    return {
      msg: `${capitalizedDate}`,
      average: averageMonthly
    };
  };

  const estimation = calculateEstimation();

  // Meta mensal logic
  const META_MENSAL = 1000;
  
  const calculateCurrentMonthPayments = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return payments.reduce((sum, payment) => {
      const paymentDate = new Date(payment.date);
      if (paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear) {
        return sum + payment.amount;
      }
      return sum;
    }, 0);
  };

  const currentMonthPayments = calculateCurrentMonthPayments();
  const remainingGoal = Math.max(0, META_MENSAL - currentMonthPayments);

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
                  <div className="flex items-baseline gap-1">
                    <h3 className="text-[20px] font-[600] text-[#E5E7EB]">{percentualPago.toFixed(2)}%</h3>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <PiggyBank className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, percentualPago)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Algumas estatísticas novas - Previsão e Meta Mensal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <p className="text-sm mb-1" style={{ color: '#E5E7EB' }}>Previsão de quitação</p>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#FFFFFF' }}>
                  {Object.keys(groupPaymentsByMonth()).length > 0 ? `Quitação estimada: ${estimation.msg}` : estimation.msg}
                </h3>
                {estimation.average > 0 && (
                  <p style={{ color: '#CBD5F5', fontSize: '14px' }} className="mt-1">
                    Média mensal de pagamento: <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{formatCurrency(estimation.average)}</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-slate-500 text-sm font-medium">Meta mensal</p>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(META_MENSAL)}</span>
                </div>
                {remainingGoal === 0 ? (
                  <h3 className="text-xl font-bold text-emerald-600 mt-1">Meta atingida 🎉</h3>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Pago este mês:</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(currentMonthPayments)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Faltam:</span>
                      <span className="font-semibold text-amber-600">{formatCurrency(remainingGoal)}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${remainingGoal === 0 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (currentMonthPayments / META_MENSAL) * 100)}%` }}
                  />
                </div>
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
