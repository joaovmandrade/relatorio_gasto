import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { PlusCircle } from 'lucide-react';

export function FormularioPagamento({ onAddPayment }) {
  const [data, setData] = useState('');
  const [valor, setValor] = useState('');
  const [metodo, setMetodo] = useState('Pix');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!data || !valor || !metodo) return;

    onAddPayment({
      paymentDate: data,
      paymentValue: valor,
      paymentMethod: metodo
    });

    setValor('');
    setMetodo('Pix');
    // Keep date as is or reset
  };

  return (
    <Card className="h-full bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white">
          <PlusCircle className="h-4 w-4 text-blue-500" />
          Adicionar pagamento
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* DATA */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Data</label>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
              className="bg-transparent border border-slate-600 text-white text-sm px-3 py-2 rounded-md w-full min-w-0 focus:border-blue-500"
            />
          </div>

          {/* VALOR */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Valor</label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
              className="bg-transparent border border-slate-600 text-white text-sm px-3 py-2 rounded-md focus:border-blue-500"
            />
          </div>

          {/* MÉTODO */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Método</label>
            <Select
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              required
              className="bg-transparent border border-slate-600 text-white text-sm px-3 py-2 rounded-md focus:border-blue-500"
            >
              <option className="bg-slate-800">Pix</option>
              <option className="bg-slate-800">Comissão</option>
            </Select>
          </div>

          {/* BOTÃO */}
          <Button
            type="submit"
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition"
          >
            Salvar
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
