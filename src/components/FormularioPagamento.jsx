import React, { useState } from "react"
import { supabase } from "../lib/supabase"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"
import { Select } from "./ui/Select"
import { PlusCircle } from "lucide-react"

export function FormularioPagamento({ onAddPayment }) {
  const [data, setData] = useState("")
  const [valor, setValor] = useState("")
  const [metodo, setMetodo] = useState("Pix")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!data || !valor || !metodo) return

    setLoading(true)

    // 🔥 pega usuário logado
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 🔥 envia já com user_id
    await onAddPayment({
      paymentDate: data,
      paymentValue: parseFloat(valor),
      paymentMethod: metodo,
    })

    setValor("")
    setMetodo("Pix")

    setLoading(false)
  }

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
              className="bg-transparent border border-slate-600 text-white text-sm px-3 py-2 rounded-md w-full focus:border-blue-500"
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
              <option className="bg-slate-800">Débito</option>
              <option className="bg-slate-800">Crédito</option>
              <option className="bg-slate-800">Outro</option>
            </Select>
          </div>

          {/* BOTÃO */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-md transition"
          >
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}