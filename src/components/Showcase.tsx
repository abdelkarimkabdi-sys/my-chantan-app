import { useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { ArrowUpRight, Bath, BedDouble, ChevronLeft, ChevronRight, Hand, MapPin, Ruler, Search } from "lucide-react"
import { useProperties, useLocalized, useFormatPrice } from "@/lib/properties"

function GlassCard({ p, big, title, price }: { p: any; big?: boolean; title: string; price: string }) {
  const { t } = useTranslation()
  return (
    <Link to={"/property/" + p.id} className="group relative block h-full min-h-[220px] overflow-hidden rounded-2xl bg-muted md:min-h-[260px] md:rounded-3xl">
      <img src={p.images?.[0] || "/assets/hero.webp"} alt={title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-x-1.5 bottom-1.5 flex items-end justify-between gap-1.5 rounded-lg bg-white/80 p-1.5 text-neutral-900 backdrop-blur-md sm:inset-x-2 sm:bottom-2 sm:p-2 md:p-2.5">
        <div className="min-w-0">
          <p className={(big ? "text-base sm:text-lg md:text-xl" : "text-xs sm:text-sm md:text-base") + " font-extrabold text-primary"}>{price}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-neutral-700"><MapPin className="h-3.5 w-3.5 shrink-0" />{title}{p.city ? " · " + p.city : ""}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-neutral-700">
            {p.area ? <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5" />{p.area} {t("م²")}</span> : null}
            {p.rooms ? <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{p.rooms}</span> : null}
            {p.bathrooms ? <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{p.bathrooms}</span> : null}
          </div>
        </div>
        <span className={(big ? "flex" : "hidden sm:flex") + " h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"}><ArrowUpRight className="h-4 w-4 rtl:-scale-x-100" /></span>
      </div>
    </Link>
  )
}

export default function Showcase() {
  const { t } = useTranslation()
  const { items, loading } = useProperties()
  const loc = useLocalized()
  const formatPrice = useFormatPrice()
  const [deal, setDeal] = useState<string>("all")
  const [q, setQ] = useState("")
  const stripRef = useRef<HTMLDivElement>(null)
  const scrollStrip = (dir: number) => stripRef.current?.scrollBy({ left: dir * Math.round(stripRef.current.clientWidth * 0.8), behavior: "smooth" })
  const top = items.filter((p) => p.featured).slice(0, 4)
  const topIds = new Set(top.map((p) => p.id))
  const rest = useMemo(() => {
    const s = q.trim().toLocaleLowerCase()
    return items.filter((p) => !topIds.has(p.id) && (deal === "all" || (deal === "ready" ? p.deal !== "construction" : p.deal === deal)) && (!s || `${p.title_ar} ${p.title_fr} ${p.city || ""}`.toLocaleLowerCase().includes(s)))
  }, [items, deal, q, top.length])
  const tabs: { k: string; label: string }[] = [
    { k: "all", label: t("كل العروض") }, { k: "ready", label: t("شقق جاهزة") }, { k: "construction", label: t("شقق في طور البناء") },
  ]
  const spans = ["col-span-2 md:row-span-2", "", "", "col-span-2"]

  return (
    <>
      {(loading || top.length > 0) && (
        <section id="featured" className="container py-10 md:py-24">
          <div className="mb-6 grid gap-3 md:mb-10 md:gap-4 md:grid-cols-2 md:items-end">
            <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl md:text-5xl">{t("اكتشف")} <span className="text-primary">{t("أفضل عروضنا")}</span></h2>
            <p className="text-sm leading-7 text-muted-foreground">{t("مجموعة مختارة من الشقق الأوسع مساحةً ضمن العروض المرسلة.")}</p>
          </div>
          {loading && <p className="text-muted-foreground">{t("جارٍ تحميل العروض…")}</p>}
          <div className="grid grid-cols-2 auto-rows-[210px] gap-3 sm:auto-rows-[240px] md:auto-rows-[260px] md:grid-cols-4 md:gap-4">
            {top.map((p, i) => <div key={p.id} className={spans[i]}><GlassCard p={p} big={i === 0} title={loc.title(p)} price={formatPrice(p)} /></div>)}
          </div>
        </section>
      )}

      <section id="listings" className="py-10 md:py-24">
        <div className="container">
          <h2 className="text-center text-2xl font-extrabold sm:text-3xl md:text-4xl">{t("بقية العروض")}</h2>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-background p-1">
              {tabs.map((tab) => <button key={tab.k} onClick={() => setDeal(tab.k)} className={"rounded-full px-4 py-1.5 text-sm font-semibold transition-colors " + (deal === tab.k ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{tab.label}</button>)}
            </div>
            <div className="relative w-full max-w-xs"><Search className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("بحث")} className="h-10 w-full rounded-full border border-border bg-background pe-10 ps-4 text-sm outline-none focus:border-primary" /></div>
          </div>
        </div>
        {rest.length > 1 && <p className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-primary md:hidden"><Hand className="h-4 w-4 animate-pulse" />{t("اسحب لرؤية المزيد")}</p>}
        <div className="relative">
          {rest.length > 1 && <>
            <button type="button" aria-label="prev" onClick={() => scrollStrip(-1)} className="absolute left-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:left-6"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" aria-label="next" onClick={() => scrollStrip(1)} className="absolute right-2 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95 md:right-6"><ChevronRight className="h-5 w-5" /></button>
          </>}
          <div ref={stripRef} className="mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:px-[max(1rem,calc((100vw-1280px)/2))]">
            {rest.map((p) => <div key={p.id} className="h-80 w-[70vw] max-w-xs shrink-0 snap-start md:w-80"><GlassCard p={p} title={loc.title(p)} price={formatPrice(p)} /></div>)}
          </div>
        </div>
        {!loading && rest.length === 0 && <p className="container mt-4 text-center text-muted-foreground">{t("لا توجد عروض أخرى حالياً.")}</p>}
      </section>
    </>
  )
}
