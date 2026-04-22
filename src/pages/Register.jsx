import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Register({
  onSwitchToLogin,
  onStartRegistering,
  onRegistered,
}) {
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

    if (!name.trim()) {
      setErrorMsg("Informe seu nome")
      return
    }

    if (password.length < 6) {
      setErrorMsg("A senha deve ter pelo menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("As senhas não coincidem")
      return
    }

    setLoading(true)

    // Avisa o App que estamos registrando (bloqueia o auto-login)
    onStartRegistering?.()

    // 1. Cria o usuário
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setErrorMsg(
        error.message.includes("already registered")
          ? "Este email já está cadastrado"
          : error.message,
      )
      setLoading(false)
      return
    }

    const user = data.user

    // 2. Cria o profile com nome
    if (user) {
      const { error: profileError } = await supabase.from("profiles").upsert([
        {
          id: user.id,
          name: name.trim(),
          item: "",
          total_value: 0,
          monthly_goal: 0,
        },
      ])

      if (profileError) {
        console.error("Erro ao criar profile:", profileError)
        // Não bloqueia o fluxo — o usuário pode preencher depois em Settings
      }
    }

    // 3. Faz logout para não entrar automaticamente
    await supabase.auth.signOut()

    setLoading(false)
    setSuccessMsg("Conta criada com sucesso! Faça login para continuar.")

    setTimeout(() => {
      onRegistered?.()
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-1 text-center">
          📝 Criar conta
        </h2>
        <p className="text-slate-400 text-sm text-center mb-6">
          Preencha os dados para começar
        </p>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {/* NOME */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Nome completo</label>
            <input
              type="text"
              placeholder="Ex: João Silva"
              className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || !!successMsg}
            />
          </div>

          {/* EMAIL */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || !!successMsg}
            />
          </div>

          {/* SENHA */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Senha</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading || !!successMsg}
            />
          </div>

          {/* CONFIRMAR SENHA */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400">Confirmar senha</label>
            <input
              type="password"
              placeholder="Repita a senha"
              className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || !!successMsg}
            />
          </div>

          {/* ERRO */}
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-md text-center">
              {errorMsg}
            </div>
          )}

          {/* SUCESSO */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500 text-emerald-400 text-sm p-3 rounded-md text-center">
              ✅ {successMsg}
            </div>
          )}

          {/* BOTÃO */}
          {!successMsg && (
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold disabled:opacity-60"
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>
          )}
        </form>

        <p className="text-slate-400 text-sm text-center mt-5">
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
