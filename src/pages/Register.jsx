import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  async function handleRegister(e) {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem")
      return
    }

    setLoading(true)

    // 🔥 1. cria usuário no auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    // 🔥 2. cria profile com nome
    const user = data.user

    if (user) {
      await supabase.from("profiles").insert([
        {
          id: user.id,
          name: name,
          item: "Carro", // default (pode mudar depois)
          total_value: 0,
        },
      ])
    }

    setSuccessMsg("Conta criada com sucesso! Faça login.")
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          📝 Criar conta
        </h2>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* NOME */}
          <input
            type="text"
            placeholder="Seu nome"
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email"
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* SENHA */}
          <input
            type="password"
            placeholder="Senha"
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* CONFIRMAR */}
          <input
            type="password"
            placeholder="Confirmar senha"
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* ERRO */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-2 rounded-md text-center">
              {errorMsg}
            </div>
          )}

          {/* SUCESSO */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-sm p-2 rounded-md text-center">
              {successMsg}
            </div>
          )}

          {/* BOTÃO */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        {/* TROCAR */}
        <p className="text-slate-400 text-sm text-center mt-4">
          Já tem conta?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-400 hover:underline"
          >
            Entrar
          </button>
        </p>
      </div>
    </div>
  )
}
