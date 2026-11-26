import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { BedDouble, Bath, Ruler, MessageCircle, MapPin, CalendarCheck } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/chantan-db"
import { Property, useLocalized, useFormatPrice, useKindLabel, useWhatsappNumber, waLink, videoEmbed } from "@/lib/properties"

export default function PropertyDetail() {
  const { id } = useParams()
  const { t } = useTranslation()
  const loc = useLocalized()
  const price = useFormatPrice()
  const kindLabel = useKindLabel()
  const wa = useWhatsappNumber()
  const [p, setP] = useState<Property | null>(null)
  const [done, setDone] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    supabase.from("properties").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setP((data as Property) || null)
      setDone(true)
    })
  }, [id])

  if (!p) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container pt-32">{done ? <Link to="/" className="text-primary">{t("العودة إلى العقارات")}</Link> : "…"}</div>
      </div>
    )
  }
  const title = loc.title(p)
  const vid = p.video_url ? videoEmbed(p.video_url) : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container pb-16 pt-28">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-[var(--radius)]">
              <img src={p.images?.[active]} alt={title} className="aspect-[3/2] w-full object-cover" />
            </div>
            {p.images?.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {p.images.map((src, i) => (
                  <button key={i} onClick={() => setActive(i)} className={"h-20 w-28 shrink-0 overflow-hidden rounded-md transition-opacity " + (i === active ? "opacity-100 ring-2 ring-primary" : "opacity-60 hover:opacity-100")}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {vid && (
              <div className="mt-8">
                <h2 className="mb-3 text-xl font-semibold">{t("فيديو العقار")}</h2>
                {vid.type === "iframe"
                  ? <iframe src={vid.src} title={title} className="aspect-video w-full rounded-[var(--radius)]" allowFullScreen />
                  : <video src={vid.src} controls className="aspect-video w-full rounded-[var(--radius)] bg-muted" />}
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm text-primary">{kindLabel(p.kind)} · {p.deal === "reserve" ? t("للحجز") : p.deal === "construction" ? t("في طور البناء") : t("للبيع")}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">{title}</h1>
            <p className="mt-2 flex items-center gap-1 text-foreground/70"><MapPin className="h-4 w-4" />{p.city}</p>
            <div className="mt-6 text-3xl font-bold text-primary">{price(p)}</div>
            <div className="mt-6 grid grid-cols-3 gap-4 border-y border-border/60 py-4 text-sm text-foreground/70">
              <span className="flex items-center gap-1"><Ruler className="h-4 w-4" />{p.area || "—"} م²</span>
              <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{p.rooms ?? "—"}</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{p.bathrooms ?? "—"}</span>
            </div>
            <p className="mt-6 leading-relaxed text-foreground/80">{loc.desc(p)}</p>
            <div className="mt-8 flex flex-col gap-3">
              <Button asChild size="lg" className="border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5b]"><a href={waLink(wa, t("مرحباً، أود الاستفسار عن العقار: {{title}}", { title }))} target="_blank" rel="noreferrer"><MessageCircle className="me-2 h-5 w-5" />{t("استفسر عبر واتساب")}</a></Button>
              <Button asChild size="lg" variant="outline"><a href={waLink(wa, t("مرحباً، أود حجز زيارة للعقار: {{title}}", { title }))} target="_blank" rel="noreferrer"><CalendarCheck className="me-2 h-5 w-5" />{t("احجز زيارة")}</a></Button>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
