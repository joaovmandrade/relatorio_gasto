import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

import Login from "./pages/Login"
import Register from "./pages/Register"
import { Dashboard } from "./components/Dashboard"
import Settings from "./pages/Settings"

function App() {
  const [session, setSession] = useState(null)
  const [screen, setScreen] = useState("login")
  const [initializing, setInitializing] = useState(true)
  // Controla se estamos no fluxo de cadastro (impede auto-login)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitializing(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        // Se o usuário acabou de se cadastrar, o Supabase faz login automático.
        // Bloqueamos isso para manter o fluxo de registro.
        if (registering) {
          return
        }

        setSession(newSession)

        if (!newSession) {
          setScreen("login")
        }
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [registering])

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Carregando...
      </div>
    )
  }

  // LOGADO
  if (session) {
    if (screen === "settings") {
      return <Settings onBack={() => setScreen("dashboard")} />
    }
    return <Dashboard onOpenSettings={() => setScreen("settings")} />
  }

  // NÃO LOGADO — CADASTRO
  if (screen === "register") {
    return (
      <Register
        onSwitchToLogin={() => {
          setRegistering(false)
          setScreen("login")
        }}
        onStartRegistering={() => setRegistering(true)}
        onRegistered={() => {
          setRegistering(false)
          setScreen("login")
        }}
      />
    )
  }

  // NÃO LOGADO — LOGIN
  return <Login onSwitchToRegister={() => setScreen("register")} />
}

export default App