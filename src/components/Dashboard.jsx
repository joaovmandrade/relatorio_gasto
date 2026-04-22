import React, { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"
import { FormularioPagamento } from "./FormularioPagamento"
import { HistoricoPagamentos } from "./HistoricoPagamentos"
import { Graficos } from "./Graficos"
import { Card, CardContent } from "./ui/Card"
import { formatCurrency } from "../utils/formatters"
import { CarFront } from "lucide-react"

const formatarMes = (data) => {
  const texto = data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function Dashboard({ onOpenSettings }) {
  const [payments, setPayments] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        // Busca profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        // Se não existe profile nenhum, manda pro settings
        if (profileError || !profileData) {
          onOpenSettings()
          return
        }

        // Só redireciona pro settings se item ou total_value não foram configurados
        // (total_value === 0 é válido como "não configurado" apenas se item tbm for vazio)
        if (!profileData.item || !profileData.total_value) {
          setProfile(profileData)
          onOpenSettings()
          return
        }

        setProfile(profileData)

        // Busca pagamentos
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false })

        if (paymentsError) {
          console.error("Erro ao buscar pagamentos:", paymentsError)
        }

        // Normaliza: a coluna no Supabase é "value", mas o código usa "amount"
        const mapped = (paymentsData || []).map((p) => ({
          ...p,
          amount: Number(p.value ?? p.amount ?? 0),
        }))

        setPayments(mapped)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Carregando...
      </div>
    )
  }

  const totalCarro = profile?.total_value || 0
  const item = profile?.item || "Item"
  const totalPago = payments.reduce((sum, p) => sum + p.amount, 0)
  const restante = Math.max(0, totalCarro - totalPago)
  const progresso = totalCarro > 0 ? (totalPago / totalCarro) * 100 : 0

  const hoje = new Date()

  const pagamentosMes = payments.filter((p) => {
    const d = new Date(p.date + "T00:00:00") // evita bug de timezone
    return (
      d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear()
    )
  })

  const totalMes = pagamentosMes.reduce((acc, p) => acc + p.amount, 0)
  const meta = profile?.monthly_goal || 0
  const progressoMeta = meta > 0 ? (totalMes / meta) * 100 : 0

  const mesesUnicos = new Set(
    payments.map((p) => {
      const d = new Date(p.date + "T00:00:00")
      return `${d.getMonth()}-${d.getFullYear()}`
    }),
  ).size

  const media = mesesUnicos > 0 ? totalPago / mesesUnicos : 0

  let previsao = null
  if (media > 0 && restante > 0) {
    const mesesRestantes = restante / media
    const dataFinal = new Date()
    dataFinal.setMonth(dataFinal.getMonth() + Math.ceil(mesesRestantes))
    previsao = formatarMes(dataFinal)
  }

  const handleAddPayment = async ({
    paymentDate,
    paymentValue,
    paymentMethod,
  }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("payments").insert([
      {
        date: paymentDate,
        value: Number(paymentValue),
        method: paymentMethod,
        user_id: user.id,
      },
    ])

    if (error) {
      console.error("Erro ao inserir pagamento:", error)
      return
    }

    // Recarrega pagamentos
    const { data: newData } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    setPayments(
      (newData || []).map((p) => ({
        ...p,
        amount: Number(p.value ?? p.amount ?? 0),
      })),
    )
  }

  const handleDeletePayment = async (id) => {
    const { error } = await supabase.from("payments").delete().eq("id", id)

    if (error) {
      console.error("Erro ao deletar pagamento:", error)
      return
    }

    setPayments((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl text-white font-bold flex items-center gap-2">
              <CarFront className="text-blue-500" />
              Dashboard {item}
            </h1>
          </div>

          <button
            onClick={onOpenSettings}
            className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-blue-400 hover:bg-slate-700"
          >
            ⚙️ Configurações
          </button>
        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-blue-600 text-white">
            <CardContent className="p-5">
              <p>Valor total</p>
              <h2 className="text-xl font-bold">
                {formatCurrency(totalCarro)}
              </h2>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="p-5">
              <p>Total pago</p>
              <h2 className="text-emerald-400 font-bold">
                {formatCurrency(totalPago)}
              </h2>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="p-5">
              <p>Restante</p>
              <h2 className="text-yellow-400 font-bold">
                {formatCurrency(restante)}
              </h2>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="p-5">
              <p>Progresso</p>
              <p>{progresso.toFixed(1)}%</p>
              <div className="h-2 bg-slate-700 rounded mt-2">
                <div
                  className="h-2 bg-green-500 rounded"
                  style={{ width: `${Math.min(progresso, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PREVISÃO + META */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs uppercase">
              Previsão de quitação
            </p>
            <h3 className="text-white text-lg font-bold">
              {previsao || "Sem dados"}
            </h3>
            <p className="text-slate-400 text-xs mt-2">
              Média: {formatCurrency(media)}
            </p>
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Meta mensal</span>
              <span>{formatCurrency(meta)}</span>
            </div>

            <p className="text-green-400 mt-2">
              {progressoMeta >= 100
                ? "Meta atingida 🎉"
                : `${progressoMeta.toFixed(0)}% da meta`}
            </p>

            <div className="h-2 bg-slate-700 rounded mt-2">
              <div
                className="h-2 bg-green-500 rounded"
                style={{ width: `${Math.min(progressoMeta, 100)}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Pago no mês: {formatCurrency(totalMes)}
            </p>
          </div>
        </div>

        {/* GRÁFICOS + FORM */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <Graficos
              totalCarro={totalCarro}
              totalPago={totalPago}
              pagamentos={payments}
            />
          </div>

          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <FormularioPagamento onAddPayment={handleAddPayment} />
          </div>
        </div>

        {/* HISTÓRICO */}
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <HistoricoPagamentos
            payments={payments}
            onDeletePayment={handleDeletePayment}
          />
        </div>
      </div>
    </div>
  )
}