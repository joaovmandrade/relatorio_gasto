import React, { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { FormularioPagamento } from "./FormularioPagamento"
import { HistoricoPagamentos } from "./HistoricoPagamentos"
import { Graficos } from "./Graficos"
import { Card, CardContent } from "./ui/Card"
import { formatCurrency } from "../utils/formatters"
import { CarFront, TrendingUp, HandCoins, PiggyBank } from "lucide-react"

const VALOR_TOTAL_CARRO = 44500

export function Dashboard() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("date", { ascending: false })

      if (error) throw error

      const mappedData = data
        ? data.map((item) => ({
            ...item,
            amount: item.value || item.amount,
          }))
        : []

      setPayments(mappedData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleAddPayment = async ({
    paymentDate,
    paymentValue,
    paymentMethod,
  }) => {
    try {
      const { error } = await supabase.from("payments").insert([
        {
          date: paymentDate,
          value: Number(paymentValue),
          method: paymentMethod,
        },
      ])

      if (error) return
      await fetchPayments()
    } catch (error) {
      console.error(error)
    }
  }

  const handleDeletePayment = async (id) => {
    try {
      const { error } = await supabase.from("payments").delete().eq("id", id)

      if (error) throw error
      fetchPayments()
    } catch (error) {
      console.error(error)
    }
  }

  const totalPago = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const valorRestante = Math.max(0, VALOR_TOTAL_CARRO - totalPago)
  const percentualPago = (totalPago / VALOR_TOTAL_CARRO) * 100

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="animate-pulse text-lg">Carregando dados...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <CarFront className="h-8 w-8 text-blue-500" />
            Dashboard do Veículo
          </h1>
          <p className="text-slate-400">
            Controle total dos seus pagamentos 🚀
          </p>
        </header>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* TOTAL CARRO */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg hover:scale-[1.02] transition">
            <CardContent className="p-6">
              <p className="text-blue-100 text-sm">Valor total</p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(VALOR_TOTAL_CARRO)}
              </h3>
            </CardContent>
          </Card>

          {/* TOTAL PAGO */}
          <Card className="bg-slate-800 border border-slate-700 shadow-md hover:shadow-xl transition">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm">Total pago</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(totalPago)}
              </h3>
            </CardContent>
          </Card>

          {/* RESTANTE */}
          <Card className="bg-slate-800 border border-slate-700 shadow-md hover:shadow-xl transition">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm">Restante</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">
                {formatCurrency(valorRestante)}
              </h3>
            </CardContent>
          </Card>

          {/* PROGRESSO */}
          <Card className="bg-slate-800 border border-slate-700 shadow-md hover:shadow-xl transition">
            <CardContent className="p-6">
              <p className="text-slate-400 text-sm">Progresso</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {percentualPago.toFixed(2)}%
              </h3>

              <div className="mt-4 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, percentualPago)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CONTEÚDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GRÁFICOS */}
          <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-md">
            <Graficos
              totalCarro={VALOR_TOTAL_CARRO}
              totalPago={totalPago}
              pagamentos={payments}
            />
          </div>

          {/* FORM */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-md">
            <FormularioPagamento onAddPayment={handleAddPayment} />
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-md">
          <HistoricoPagamentos
            payments={payments}
            onDeletePayment={handleDeletePayment}
          />
        </div>
      </div>
    </div>
  )
}