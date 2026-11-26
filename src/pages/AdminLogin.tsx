import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/chantan-db"
import { useTranslation } from 'react-i18next'

export default function AdminLogin() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setErr("")
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setErr("البريد الإلكتروني أو كلمة المرور غير صحيحة")
      else nav("/admin")
    } catch {
      setErr("حدث خطأ، حاول مرة أخرى")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4">
        <h1 className="text-3xl font-bold">{t("دخول المدير")}</h1>
        <Input type="email" required placeholder={t("البريد الإلكتروني")} value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
        <Input type="password" required placeholder={t("كلمة المرور")} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        {err && <p className="text-sm text-destructive">{t(err)}</p>}
        <Button type="submit" className="w-full" disabled={busy}>{busy ? "…" : t("دخول")}</Button>
      </form>
    </div>
  )
}
