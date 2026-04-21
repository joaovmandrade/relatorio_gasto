import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

export default function Settings({ onBack }) {
  const [profile, setProfile] = useState({
    name: "",
    item: "",
    total_value: "",
    monthly_goal: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  // ===== LOAD PROFILE =====
  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile({
          name: data.name || "",
          item: data.item || "",
          total_value: data.total_value || "",
          monthly_goal: data.monthly_goal || "",
        })
      }

      setLoading(false)
    }

    loadProfile()
  }, [])

  // ===== SAVE =====
  const handleSave = async () => {
    setSaving(true)
    setErrorMsg("")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg("Usuário não autenticado")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        item: profile.item,
        total_value: Number(profile.total_value),
        monthly_goal: Number(profile.monthly_goal),
      })
      .eq("id", user.id)

    if (error) {
      console.error(error)
      setErrorMsg("Erro ao salvar. Tente novamente.")
      setSaving(false)
      return
    }

    setSaving(false)

    // 🔥 VAI PRO DASHBOARD
    onBack()
  }

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Carregando...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          ⚙️ Configurações
        </h2>

        <div className="flex flex-col gap-4">
          {/* NOME */}
          <input
            type="text"
            placeholder="Seu nome"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* ITEM */}
          <input
            type="text"
            placeholder="O que você está pagando"
            value={profile.item}
            onChange={(e) => setProfile({ ...profile, item: e.target.value })}
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* VALOR TOTAL */}
          <input
            type="number"
            placeholder="Valor total"
            value={profile.total_value}
            onChange={(e) =>
              setProfile({ ...profile, total_value: e.target.value })
            }
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* META MENSAL */}
          <input
            type="number"
            placeholder="Meta mensal"
            value={profile.monthly_goal}
            onChange={(e) =>
              setProfile({ ...profile, monthly_goal: e.target.value })
            }
            className="p-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* ERRO */}
          {errorMsg && (
            <div className="text-red-400 text-sm text-center">{errorMsg}</div>
          )}

          {/* BOTÃO SALVAR */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg text-white font-semibold"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>

          {/* LOGOUT */}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.reload()
            }}
            className="mt-2 bg-red-600 hover:bg-red-700 transition p-3 rounded-lg text-white font-semibold"
          >
            Sair da conta
          </button>

          {/* VOLTAR */}
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white text-sm mt-2"
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  )
}
