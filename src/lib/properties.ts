import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { supabase } from "@/lib/chantan-db"

export interface Property {
  id: string
  title_ar: string
  title_fr: string
  description_ar: string | null
  description_fr: string | null
  city: string | null
  kind: string
  deal: string
  price: number
  area: number | null
  rooms: number | null
  bathrooms: number | null
  images: string[]
  video_url: string | null
  featured: boolean
  created_at: string
}

export function useProperties() {
  const [items, setItems] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const reload = async () => {
    const { data } = await supabase.from("properties").select("*").order("created_at", { ascending: false })
    setItems((data as Property[]) || [])
    setLoading(false)
  }
  useEffect(() => { void reload() }, [])
  return { items, loading, reload }
}

export function useWhatsappNumber() {
  const [num, setNum] = useState("212600000000")
  useEffect(() => {
    supabase.from("site_settings").select("value").eq("key", "whatsapp").maybeSingle().then(({ data }) => {
      if (data?.value) setNum(String(data.value).replace(/\D/g, ""))
    })
  }, [])
  return num
}

// Pick the Arabic or French field depending on the active language
export function useLocalized() {
  const { i18n } = useTranslation()
  const fr = (i18n.language || "ar").startsWith("fr")
  return {
    fr,
    title: (p: Property) => (fr ? p.title_fr || p.title_ar : p.title_ar),
    desc: (p: Property) => (fr ? p.description_fr || p.description_ar : p.description_ar) || "",
  }
}

export function useFormatPrice() {
  const { t, i18n } = useTranslation()
  return (p: Property) => {
    const n = new Intl.NumberFormat((i18n.language || "ar").startsWith("fr") ? "fr-FR" : "ar-MA-u-nu-latn", { maximumFractionDigits: 2 }).format((p.price || 0) / 10000)
    return n + " " + t("مليون")
  }
}

export function useKindLabel() {
  const { t } = useTranslation()
  return (k: string) => {
    if (k === "villa") return t("فيلا")
    if (k === "house") return t("منزل")
    if (k === "commercial") return t("محل تجاري")
    if (k === "land") return t("أرض")
    return t("شقة")
  }
}

export function waLink(num: string, text: string) {
  return "https://wa.me/" + num + "?text=" + encodeURIComponent(text)
}

export function videoEmbed(url: string): { type: "iframe" | "video"; src: string } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/)
  if (yt) return { type: "iframe", src: "https://www.youtube.com/embed/" + yt[1] }
  return { type: "video", src: url }
}
