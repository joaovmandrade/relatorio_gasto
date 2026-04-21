import { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

import Login from "./pages/Login"
import Register from "./pages/Register"
import { Dashboard } from "./components/Dashboard"

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

  if (session) {
    return <Dashboard />
  }

  if (screen === "login") {
    return <Login onSwitchToRegister={() => setScreen("register")} />
  }

  return <Register onSwitchToLogin={() => setScreen("login")} />
}

export default App