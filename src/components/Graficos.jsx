import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

export function Graficos({ totalCarro, totalPago, pagamentos }) {
  const valorRestante = Math.max(0, totalCarro - totalPago);
  
  const progressoData = [
    { name: 'Pago', value: totalPago, color: '#10b981' }, // emerald-500
    { name: 'Restante', value: valorRestante, color: '#e2e8f0' }, // slate-200
  ];

  const totalPix = pagamentos
    .filter(p => p.method === 'Pix')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalComissao = pagamentos
    .filter(p => p.method === 'Comissão')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const metodoData = [
    { name: 'Pix', value: totalPix, color: '#10b981' }, // emerald-500
    { name: 'Comissão', value: totalComissao, color: '#3b82f6' }, // blue-500
  ].filter(item => item.value > 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
          <p className="font-medium text-slate-900">{payload[0].name}</p>
          <p className="text-slate-600">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Progresso do Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={progressoData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {progressoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-blue-600" />
            Estatísticas por método
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            {metodoData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metodoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {metodoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                Sem dados de pagamento
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
