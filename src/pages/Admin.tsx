import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Building2, Check, ChevronDown, ChevronUp, LogOut, MessageCircle, Pencil, Plus, Search, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/chantan-db"
import { Property, useProperties } from "@/lib/properties"
import PropertyForm from "@/components/PropertyForm"
import { useTranslation } from "react-i18next"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function Admin() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [state, setState] = useState<"loading" | "ok" | "denied">("loading")
  const { items, loading, reload } = useProperties()
  const [editing, setEditing] = useState<Property | null>(null)
  const [adding, setAdding] = useState(false)
  const [wa, setWa] = useState("")
  const [saved, setSaved] = useState(false)
  const [settingsMsg, setSettingsMsg] = useState("")
  const [search, setSearch] = useState("")
  const [pendingDelete, setPendingDelete] = useState<Property | null>(null)
  const [busyId, setBusyId] = useState("")
  const [featureMsg, setFeatureMsg] = useState("")

  useEffect(() => {
    let active = true
    void (async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error || !data.session) { nav("/admin/login"); return }
      const { data: isAdmin, error: roleError } = await supabase.rpc("sp_is_admin")
      if (!active) return
      setState(!roleError && isAdmin ? "ok" : "denied")
    })()
    void supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle().then(({ data }) => {
      if (active) setWa(data?.value || "")
    })
    return () => { active = false }
  }, [nav])

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase()
    if (!q) return items
    return items.filter((p) => `${p.title_ar} ${p.title_fr} ${p.city || ""}`.toLocaleLowerCase().includes(q))
  }, [items, search])
  const featuredCount = items.filter((p) => p.featured).length

  const remove = async () => {
    if (!pendingDelete) return
    setBusyId(pendingDelete.id)
    const { error } = await supabase.from("properties").delete().eq("id", pendingDelete.id)
    setBusyId("")
    if (error) setFeatureMsg(t("تعذر حذف العقار:") + " " + error.message)
    else { setPendingDelete(null); void reload() }
  }

  const toggleFeatured = async (p: Property) => {
    setFeatureMsg("")
    setBusyId(p.id)
    const { error } = await supabase.from("properties").update({ featured: !p.featured }).eq("id", p.id)
    setBusyId("")
    if (error) setFeatureMsg(t("تعذر تحديث العروض المميزة:") + " " + error.message)
    else void reload()
  }

  const saveWa = async () => {
    setSettingsMsg("")
    const { error } = await supabase.from("site_settings").upsert({ key: "whatsapp", value: wa.replace(/\D/g, "") })
    if (error) { setSettingsMsg(t("تعذر حفظ رقم واتساب:") + " " + error.message); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }
  const logout = async () => { await supabase.auth.signOut(); nav("/admin/login") }

  if (state === "loading") return <div className="min-h-screen bg-background p-10 text-foreground">{t("جارٍ التحقق من صلاحية الدخول…")}</div>
  if (state === "denied") return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold">{t("ليس لديك صلاحية الدخول.")}</h1>
        <Button onClick={logout}>{t("تسجيل الخروج")}</Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90">
        <div className="container flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></span><div><p className="text-xs font-semibold tracking-[.16em] text-primary">{t("DIRDARK")}</p><h1 className="text-xl font-bold">{t("إدارة العقارات")}</h1></div></div>
          <div className="flex gap-2"><Button asChild variant="outline"><Link to="/">{t("عرض الموقع")}</Link></Button><Button variant="outline" onClick={logout}><LogOut className="me-1 h-4 w-4" />{t("خروج")}</Button></div>
        </div>
      </header>

      <main className="container max-w-6xl space-y-8 py-8 md:py-12">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">{t("إجمالي العقارات")}</p><p className="mt-2 text-3xl font-extrabold">{items.length}</p></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">{t("العروض المميزة")}</p><p className="mt-2 text-3xl font-extrabold">{featuredCount}<span className="text-base font-medium text-muted-foreground"> / 4</span></p></div>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm text-muted-foreground">{t("رقم واتساب العام")}</p><p dir="ltr" className="mt-2 truncate text-lg font-bold">{wa || t("لم يُحدد بعد")}</p></div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageCircle className="h-5 w-5" /></span><div><h2 className="text-lg font-bold">{t("رقم واتساب للتواصل")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("يُستخدم الرقم العام في أزرار التواصل بالموقع.")}</p></div></div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="w-full max-w-sm text-sm font-medium">{t("رقم واتساب (مع رمز الدولة)")}<Input dir="ltr" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="2126XXXXXXXX" className="mt-1.5" /></label><Button onClick={saveWa} disabled={!wa.trim()}>{saved ? <><Check className="me-2 h-4 w-4" />{t("تم الحفظ")}</> : t("حفظ الرقم")}</Button></div>
          {settingsMsg && <p className="mt-3 text-sm text-destructive">{settingsMsg}</p>}
        </section>

        <section className="space-y-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold tracking-[.12em] text-primary">{t("إدارة المحتوى")}</p><h2 className="mt-1 text-2xl font-extrabold">{t("جميع العقارات")}</h2></div><Button onClick={() => { setEditing(null); setAdding(true); window.scrollTo({ top: 0, behavior: "smooth" }) }}><Plus className="me-1.5 h-4 w-4" />{t("إضافة عقار")}</Button></div>
          {(adding || editing) && <PropertyForm initial={editing} onCancel={() => { setAdding(false); setEditing(null) }} onDone={() => { setAdding(false); setEditing(null); void reload() }} />}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">{t("اختر أربعة عقارات لتظهر في قسم العروض المميزة.")}</p><div className="relative w-full sm:max-w-xs"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("ابحث بالاسم أو المدينة")} className="ps-9" /></div></div>
          {featureMsg && <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{featureMsg}</p>}
          {loading ? <p className="rounded-xl border border-border p-6 text-muted-foreground">{t("جارٍ تحميل العقارات…")}</p> : filtered.length === 0 ? <p className="rounded-xl border border-border p-8 text-center text-muted-foreground">{items.length ? t("لا توجد نتائج مطابقة.") : t("لا توجد عقارات بعد. أضف أول عقار للبدء.")}</p> : (
            <div className="grid gap-4 lg:grid-cols-2">
              {filtered.map((p) => <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                <div className="flex gap-4 p-4 sm:p-5">
                  <img src={p.images?.[0] || "/assets/hero.webp"} alt={p.title_ar} className="h-24 w-28 shrink-0 rounded-xl object-cover sm:h-28 sm:w-36" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold">{p.deal === "reserve" ? t("للحجز") : p.deal === "construction" ? t("في طور البناء") : t("للبيع")}</span>{p.featured && <span className="inline-flex items-center gap-1 rounded-md bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary"><Star className="h-3.5 w-3.5" />{t("مميز")}</span>}</div>
                    <h3 className="mt-2 truncate text-lg font-bold">{p.title_ar || p.title_fr}</h3><p className="mt-1 truncate text-sm text-muted-foreground">{p.city || t("المدينة غير محددة")}</p><p className="mt-2 font-extrabold text-primary">{new Intl.NumberFormat("ar-MA-u-nu-latn", { maximumFractionDigits: 2 }).format((p.price || 0) / 10000)} {t("مليون")}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-4 py-3 sm:px-5">
                  <p className="text-xs text-muted-foreground">{t("{{count}} صورة", { count: p.images?.length || 0 })}{p.video_url ? " · " + t("يتضمن فيديو") : ""}</p>
                  <div className="flex flex-wrap gap-2"><Button size="sm" variant={p.featured ? "secondary" : "outline"} disabled={busyId === p.id} onClick={() => void toggleFeatured(p)}><Star className="me-1.5 h-4 w-4" />{p.featured ? t("إزالة التمييز") : t("تمييز")}</Button><Button size="icon" variant="outline" aria-label={t("تعديل العقار")} onClick={() => { setAdding(false); setEditing(p); window.scrollTo({ top: 0, behavior: "smooth" }) }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="outline" aria-label={t("حذف العقار")} onClick={() => setPendingDelete(p)}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
              </article>)}
            </div>
          )}
        </section>
      </main>
      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => { if (!open && !busyId) setPendingDelete(null) }}>
        <AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>{t("حذف هذا العقار؟")}</AlertDialogTitle><AlertDialogDescription>{t("سيُحذف العقار من قائمة الموقع، ولا يمكن التراجع عن هذا الإجراء.")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("إلغاء")}</AlertDialogCancel><AlertDialogAction onClick={(e) => { e.preventDefault(); void remove() }} disabled={!!busyId}>{busyId ? t("جارٍ الحذف…") : t("تأكيد الحذف")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
