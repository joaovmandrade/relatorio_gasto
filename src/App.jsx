import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

import Login from "./pages/Login"
import Register from "./pages/Register"
import { Dashboard } from "./components/Dashboard"
import Settings from "./pages/Settings"

function App() {
  const [session, setSession] = useState(null)
  const [screen, setScreen] = useState("login")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      },
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  // 🔥 LOGADO
  if (session) {
    if (screen === "settings") {
      return <Settings onBack={() => setScreen("dashboard")} />
    }

    return <Dashboard onOpenSettings={() => setScreen("settings")} />
  }

  // 🔥 NÃO LOGADO
  if (screen === "login") {
    return <Login onSwitchToRegister={() => setScreen("register")} />
  }

  return <Register onSwitchToLogin={() => setScreen("login")} />
}

export default App
