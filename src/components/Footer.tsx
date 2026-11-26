import { Link } from "react-router-dom"
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="border-t border-border/60 py-10">
      <div className="container flex flex-col items-center justify-between gap-3 text-sm text-foreground/70 md:flex-row">
        <span>{t("© 2026 DIRDARK")}</span>
        <span>{t("وكالة عقارية — شقق، فيلات ومحلات")}</span>
        <Link to="/admin" className="transition-colors hover:text-primary">{t("لوحة التحكم")}</Link>
      </div>
    </footer>
  )
}
