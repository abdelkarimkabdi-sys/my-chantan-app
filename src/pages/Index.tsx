import { useTranslation } from "react-i18next"
import { ArrowLeft, MessageCircle } from "lucide-react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Showcase from "@/components/Showcase"
import { Button } from "@/components/ui/button"
import { useWhatsappNumber, waLink } from "@/lib/properties"

export default function Index() {
  const { t } = useTranslation()
  const wa = useWhatsappNumber()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header overlay />
      <main>
        <section className="on-media relative overflow-hidden bg-primary-foreground pt-14 text-foreground md:pt-16">
          <img src="/properties/apartment-1-interior.webp" alt={t("داخل شقة معروضة للبيع في آيت ملول")} className="absolute inset-0 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-l from-primary-foreground/95 via-primary-foreground/80 to-primary-foreground/40" />
          <div className="container relative flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between md:py-7">
            <div className="max-w-xl">
              <p className="text-xs tracking-[.18em] text-primary">{t("عقارات آيت ملول")}</p>
              <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">{t("دارك تبدأ من هنا")}</h1>
            </div>
            <div className="flex flex-row gap-2">
              <Button asChild size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 md:flex-none"><a href="#featured">{t("اكتشف العروض")}<ArrowLeft className="ms-2 h-4 w-4 rtl:rotate-180" /></a></Button>
              <Button asChild size="sm" variant="outline" className="flex-1 border-transparent bg-[#25D366] text-white hover:bg-[#1ebe5b] hover:text-white md:flex-none"><a href={waLink(wa, t("مرحباً، أبحث عن شقة للبيع في آيت ملول."))} target="_blank" rel="noreferrer"><MessageCircle className="me-2 h-4 w-4" />{t("تواصل عبر واتساب")}</a></Button>
            </div>
          </div>
        </section>

        <Showcase />

        <section id="contact" className="container py-10 md:py-24">
          <div className="on-media relative overflow-hidden rounded-3xl bg-primary-foreground px-5 py-8 text-foreground md:px-12 md:py-14">
            <div className="absolute inset-y-0 end-0 w-1/3 border-s border-primary/20 bg-primary/5" />
            <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div><p className="text-sm tracking-[.16em] text-primary">{t("تواصل معنا")}</p><h2 className="mt-2 text-2xl font-extrabold md:text-4xl">{t("احجز موعد زيارة لشقتك القادمة")}</h2><p className="mt-3 text-foreground/70">{t("أرسل لنا رسالة واتساب للاستفسار عن أي عرض أو ترتيب زيارة.")}</p></div>
              <Button asChild size="lg" className="w-full shrink-0 bg-[#25D366] text-white hover:bg-[#1ebe5b] md:w-auto"><a href={waLink(wa, t("مرحباً، أود حجز زيارة لشقة في آيت ملول."))} target="_blank" rel="noreferrer"><MessageCircle className="me-2 h-5 w-5" />{t("احجز زيارة")}</a></Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
