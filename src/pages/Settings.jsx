// 👇 só altera o handleSave
const handleSave = async () => {
  setSaving(true)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from("profiles")
    .update({
      item: profile.item,
      total_value: Number(profile.total_value),
      monthly_goal: Number(profile.monthly_goal),
    })
    .eq("id", user.id)

  setSaving(false)

  // 🔥 REDIRECIONA PRO DASHBOARD
  onBack()
}