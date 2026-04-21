import React, { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/Card"
import { formatCurrency, formatDate } from "../utils/formatters"
import { ListOrdered, ArrowDownUp, Wallet, Trash2 } from "lucide-react"

export function HistoricoPagamentos({ payments, onDeletePayment }) {
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedPayment, setSelectedPayment] = useState(null)

  const sortedPayments = [...payments].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB
  })

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
  }

  const confirmDelete = () => {
    if (selectedPayment) {
      onDeletePayment(selectedPayment.id)
      setSelectedPayment(null)
    }
  }

  return (
    <>
      {/* 🔥 MODAL BONITO */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="bg-red-500/10 p-3 rounded-full">
                <Trash2 className="text-red-400" />
              </div>

              <h3 className="text-white font-semibold text-lg">
                Remover pagamento?
              </h3>

              <p className="text-slate-400 text-sm">
                Essa ação não pode ser desfeita.
              </p>

              <div className="flex gap-3 w-full mt-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="flex-1 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition"
                >
                  Cancelar
                </button>

                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card className="col-span-1 lg:col-span-2 bg-slate-800 border border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <ListOrdered className="h-5 w-5 text-blue-500" />
            Histórico de pagamentos
          </CardTitle>

          <button
            onClick={toggleSort}
            className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition"
          >
            <ArrowDownUp className="h-4 w-4" />
            Ordenar
          </button>
        </CardHeader>

        <CardContent>
          {sortedPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-md max-w-sm w-full">
                <Wallet className="h-8 w-8 text-slate-500 mx-auto mb-3" />

                <p className="text-lg text-white font-semibold mb-2">
                  Nenhum pagamento ainda
                </p>

                <p className="text-sm text-slate-400 mb-4">
                  Comece adicionando seu primeiro pagamento
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase border-b border-slate-700">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-center">Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {sortedPayments.map((payment) => {
                    const allChronological = [...payments].sort(
                      (a, b) => new Date(a.date) - new Date(b.date),
                    )

                    const index = allChronological.findIndex(
                      (p) => p.id === payment.id,
                    )

                    const total = allChronological
                      .slice(0, index + 1)
                      .reduce((sum, p) => sum + p.amount, 0)

                    return (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-700 hover:bg-slate-700/40 transition"
                      >
                        <td className="px-4 py-3 text-slate-300">
                          {formatDate(payment.date)}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.method === "Pix"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : payment.method === "Débito"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : payment.method === "Crédito"
                                    ? "bg-purple-500/20 text-purple-400"
                                    : "bg-slate-500/20 text-slate-400"
                            }`}
                          >
                            {payment.method}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-right text-white font-semibold">
                          {formatCurrency(payment.amount)}
                        </td>

                        <td className="px-4 py-3 text-right text-slate-400">
                          {formatCurrency(total)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-semibold hover:bg-red-500 hover:text-white transition"
                          >
                            Remover
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
