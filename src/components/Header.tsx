import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from "./LanguageToggle"

export default function Header({ overlay = false }: { overlay?: boolean }) {
  const { t } = useTranslation()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40)
    on()
    window.addEventListener("scroll", on, { passive: true })
    return () => window.removeEventListener("scroll", on)
  }, [])
  const transparent = overlay && !scrolled
  return (
    <header
      className={
        "fixed inset-x-0 top-0 z-50 transition-all duration-200 " +
        (transparent ? "on-media bg-gradient-to-b from-black/55 to-transparent" : "bg-background/85 backdrop-blur border-b border-border/60")
      }
    >
      <div className="container flex h-14 items-center justify-between gap-2 md:h-16">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <img src="/assets/logo.webp" alt={t("Dirdark.com")} className="h-10 w-auto rounded-md bg-white object-contain md:h-12" />
        </Link>
        <nav className="flex items-center gap-3 text-xs text-foreground sm:gap-6 sm:text-sm">
          <a href="/#listings" className="transition-colors hover:text-primary">{t("العقارات")}</a>
          <a href="/#contact" className="transition-colors hover:text-primary">{t("اتصل بنا")}</a>
          <span id="lang-slot" />
        <LanguageToggle />
        </nav>
      </div>
    </header>
  )
}
