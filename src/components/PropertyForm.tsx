import { useState } from "react"
import { ChevronDown, ChevronUp, ImagePlus, Trash2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase, chantanDB } from "@/lib/chantan-db"
import type { Property } from "@/lib/properties"
import { useTranslation } from "react-i18next"

const empty = {
  title_ar: "", title_fr: "", description_ar: "", description_fr: "", city: "",
  kind: "apartment", deal: "sale", price: 0, area: 0, rooms: 0, bathrooms: 0,
  images: [] as string[], video_url: "", featured: false,
}
const sel = "h-10 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground"

export default function PropertyForm({ initial, onDone, onCancel }: { initial?: Property | null; onDone: () => void; onCancel: () => void }) {
  const { t } = useTranslation()
  const [f, setF] = useState<any>(initial ? { ...empty, ...initial, images: [...(initial.images || [])], video_url: initial.video_url || "" } : { ...empty, images: [] })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }))

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setBusy(true)
    setMsg("")
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) { setMsg(t("يمكن رفع الصور فقط.")); continue }
        const uploaded = await chantanDB.storage.upload(file)
        setF((current: any) => ({ ...current, images: [...current.images, uploaded.url] }))
      }
    } catch (e: any) {
      setMsg(t("فشل رفع الصورة:") + " " + e.message)
    } finally {
      setBusy(false)
    }
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= f.images.length) return
    const images = [...f.images]
    ;[images[index], images[nextIndex]] = [images[nextIndex], images[index]]
    set("images", images)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setMsg("")
    try {
      const row = {
        title_ar: f.title_ar, title_fr: f.title_fr || f.title_ar,
        description_ar: f.description_ar, description_fr: f.description_fr,
        city: f.city, kind: f.kind, deal: f.deal,
        price: Number(f.price) || 0, area: Number(f.area) || null, rooms: Number(f.rooms) || null, bathrooms: Number(f.bathrooms) || null,
        images: f.images, video_url: f.video_url || null, featured: !!f.featured,
      }
      const result = initial ? await supabase.from("properties").update(row).eq("id", initial.id) : await supabase.from("properties").insert(row)
      if (result.error) throw result.error
      if (initial) {
        const removed = (initial.images || []).filter((src) => !f.images.includes(src))
        for (const src of removed) {
          const marker = "/storage/v1/object/public/chantan-public/"
          const encoded = src.split(marker)[1]?.split("?")[0]
          if (encoded) {
            try { await chantanDB.storage.delete(decodeURIComponent(encoded)) } catch { /* Keep the saved property change even if old-file cleanup fails. */ }
          }
        }
      }
      onDone()
    } catch (e: any) {
      setMsg(t("تعذر الحفظ:") + " " + (e?.message || t("حدث خطأ، حاول مرة أخرى")))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={save} className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold tracking-[.12em] text-primary">{t("DIRDARK")}</p><h2 className="mt-1 text-xl font-bold">{initial ? t("تعديل العقار") : t("عقار جديد")}</h2></div><Button type="button" variant="ghost" size="icon" aria-label={t("إغلاق")} onClick={onCancel}><X className="h-4 w-4" /></Button></div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">{t("العنوان بالعربية")}<Input required value={f.title_ar} onChange={(e) => set("title_ar", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium">{t("Titre en français")}<Input dir="ltr" value={f.title_fr} onChange={(e) => set("title_fr", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium">{t("الوصف بالعربية")}<Textarea rows={4} value={f.description_ar || ""} onChange={(e) => set("description_ar", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium">{t("Description en français")}<Textarea rows={4} dir="ltr" value={f.description_fr || ""} onChange={(e) => set("description_fr", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium">{t("المدينة")}<Input value={f.city || ""} onChange={(e) => set("city", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium">{t("رابط الفيديو (YouTube أو mp4)")}<Input dir="ltr" value={f.video_url} onChange={(e) => set("video_url", e.target.value)} /></label>
        <label className="space-y-1 text-sm font-medium"><span>{t("نوع العقار")}</span><select className={sel} value={f.kind} onChange={(e) => set("kind", e.target.value)}><option value="apartment">{t("شقة")}</option><option value="villa">{t("فيلا")}</option><option value="house">{t("منزل")}</option><option value="commercial">{t("محل تجاري")}</option><option value="land">{t("أرض")}</option></select></label>
        <label className="space-y-1 text-sm font-medium"><span>{t("نوع العرض")}</span><select className={sel} value={f.deal} onChange={(e) => set("deal", e.target.value)}><option value="sale">{t("للبيع")}</option><option value="reserve">{t("للحجز")}</option><option value="construction">{t("في طور البناء")}</option></select></label>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["price", t("السعر (درهم) — 84 مليون = 840000")], ["area", t("المساحة م²")], ["rooms", t("الغرف")], ["bathrooms", t("الحمامات")]].map(([k, label]) => <label key={String(k)} className="space-y-1 text-sm font-medium">{label}<Input type="number" min={0} value={f[String(k)] ?? 0} onChange={(e) => set(String(k), e.target.value)} /></label>)}</div>
      <section className="space-y-3 rounded-xl border border-border/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{t("صور العقار")}</h3><p className="text-xs text-muted-foreground">{t("رتّب الصور؛ الصورة الأولى تظهر كصورة رئيسية.")}</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><Upload className="h-4 w-4" />{busy ? t("جارٍ الرفع…") : t("رفع صور")}<input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => { void upload(e.target.files); e.currentTarget.value = "" }} /></label></div>
        {f.images.length === 0 ? <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-5 text-sm text-muted-foreground"><ImagePlus className="h-5 w-5" />{t("لم تُضف صوراً بعد.")}</div> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{f.images.map((src: string, i: number) => <div key={`${src}-${i}`} className="group overflow-hidden rounded-xl border border-border"><div className="relative aspect-[4/3]"><img src={src} alt={t("صورة العقار {{number}}", { number: i + 1 })} className="h-full w-full object-cover" />{i === 0 && <span className="absolute start-2 top-2 rounded-md bg-background/90 px-2 py-1 text-xs font-semibold">{t("رئيسية")}</span>}</div><div className="flex items-center justify-between gap-1 p-2"><span className="text-xs text-muted-foreground">{t("الصورة {{number}}", { number: i + 1 })}</span><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={t("تحريك للأعلى")} disabled={i === 0} onClick={() => moveImage(i, -1)}><ChevronUp className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" className="h-8 w-8" aria-label={t("تحريك للأسفل")} disabled={i === f.images.length - 1} onClick={() => moveImage(i, 1)}><ChevronDown className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={t("حذف الصورة")} onClick={() => set("images", f.images.filter((_: string, j: number) => j !== i))}><Trash2 className="h-4 w-4" /></Button></div></div></div>)}</div>}
      </section>
      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><input type="checkbox" checked={f.featured} onChange={(e) => set("featured", e.target.checked)} />{t("ضمن أفضل أربعة عروض")}</label>
      {msg && <p className="rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">{msg}</p>}
      <div className="flex flex-wrap gap-2"><Button type="submit" disabled={busy}>{busy ? t("جارٍ الحفظ…") : t("حفظ العقار")}</Button><Button type="button" variant="outline" onClick={onCancel}>{t("إلغاء")}</Button></div>
    </form>
  )
}
