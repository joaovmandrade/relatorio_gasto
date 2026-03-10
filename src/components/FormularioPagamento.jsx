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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-blue-600" />
          Adicionar pagamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Data</label>
            <Input 
              type="date" 
              value={data}
              onChange={(e) => setData(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Valor (R$)</label>
            <Input 
              type="number" 
              step="0.01"
              min="0.01"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Método de pagamento</label>
            <Select value={metodo} onChange={(e) => setMetodo(e.target.value)} required>
              <option value="Pix">Pix</option>
              <option value="Comissão">Comissão</option>
            </Select>
          </div>

          <Button type="submit" className="w-full mt-2">
            Salvar pagamento
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
