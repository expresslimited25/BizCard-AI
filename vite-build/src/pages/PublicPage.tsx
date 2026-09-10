import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Check, Globe, Loader2, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPublicBusiness } from "@/lib/queries";
import { buildTimeSlots, hexToRgba, readableOn, youtubeEmbed } from "@/lib/bizcard";

type PublicBusiness = Awaited<ReturnType<typeof getPublicBusiness>>;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PublicPage({ slug }: { slug: string }) {
  const [business, setBusiness] = useState<NonNullable<PublicBusiness> | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getPublicBusiness(slug).then((b) => {
      if (!b) setNotFound(true);
      else setBusiness(b);
      setLoading(false);
    });
  }, [slug]);

  // Track view
  useEffect(() => {
    if (business?.id) {
      supabase.rpc("increment_view_count", { business_id: business.id }).then(() => {}).catch?.(() => {});
    }
  }, [business?.id]);

  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;

  if (notFound || !business) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div>
          <h1 className="text-3xl font-extrabold">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">This business page doesn't exist or isn't published yet.</p>
          <a href="/" className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">Back to BizCard AI</a>
        </div>
      </div>
    );
  }

  const b = business;
  const text = readableOn(b.color_primary);
  const embed = youtubeEmbed(b.video_url);

  return (
    <div className="min-h-screen bg-background" style={{ "--biz": b.color_primary, "--biz-accent": b.color_accent } as React.CSSProperties}>
      {/* Hero */}
      <header className="relative overflow-hidden px-6 py-20 md:py-28" style={{
        background: b.cover
          ? `linear-gradient(160deg,${hexToRgba(b.color_primary,0.9)},${hexToRgba(b.color_accent,0.75)}),url(${b.cover}) center/cover`
          : `linear-gradient(160deg,${b.color_primary},${b.color_accent})`,
        color: text,
      }}>
        <motion.div initial="hidden" animate="show"
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mx-auto max-w-3xl text-center">
          {b.logo && (
            <motion.img variants={fadeUp} src={b.logo} alt={`${b.name} logo`}
              className="mx-auto mb-6 size-24 rounded-3xl border-2 border-white/50 object-cover shadow-xl" />
          )}
          <motion.p variants={fadeUp} className="text-xs font-bold tracking-[0.28em] uppercase opacity-80">{b.category}</motion.p>
          <motion.h1 variants={fadeUp} className="mt-3 text-4xl font-extrabold tracking-tight md:text-6xl">
            {b.ai_headline || b.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-4 text-lg opacity-90 md:text-xl">
            {b.ai_tagline || b.short_desc}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-8 flex flex-wrap justify-center gap-3">
            {b.booking?.enabled && (
              <a href="#book" className="hover-lift inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg"
                style={{ background: text, color: b.color_primary }}>
                <CalendarCheck className="size-4" />
                {b.booking.booking_type === "reservation" ? "Reserve a Table" : "Book Now"}
              </a>
            )}
            {b.website && (
              <a href={b.website} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-bold"
                style={{ borderColor: hexToRgba(text === "#ffffff" ? "#ffffff" : "#111827", 0.5) }}>
                <Globe className="size-4" /> Visit website
              </a>
            )}
          </motion.div>
        </motion.div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* About */}
        <Section title={`About ${b.name}`}>
          <p className="text-base leading-relaxed whitespace-pre-line text-muted-foreground">
            {b.ai_bio || b.long_desc || b.short_desc}
          </p>
        </Section>

        {/* Services */}
        {b.services.length > 0 && (
          <Section title="What we offer">
            <div className="grid gap-4 sm:grid-cols-2">
              {b.services.map((s, i) => (
                <motion.div key={s.title} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true, margin:"-60px" }} transition={{ duration:0.5, delay:i*0.06 }}
                  className="rounded-2xl border bg-card p-5">
                  <span className="mb-3 grid size-9 place-items-center rounded-xl"
                    style={{ background: hexToRgba(b.color_primary, 0.14), color: b.color_primary }}>
                    <Sparkles className="size-4" />
                  </span>
                  <h3 className="font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Video */}
        {embed && (
          <Section title="Watch our story">
            <div className="aspect-video overflow-hidden rounded-2xl border">
              <iframe src={embed} title={`${b.name} intro video`} className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          </Section>
        )}

        {/* Booking */}
        {b.booking?.enabled && <BookingSection business={b} />}

        {/* Contact */}
        <Section title="Get in touch">
          <div className="grid gap-3 sm:grid-cols-2">
            {b.phone && <ContactRow icon={<Phone className="size-4" />} label={b.phone} href={`tel:${b.phone}`} />}
            {b.email && <ContactRow icon={<Mail className="size-4" />} label={b.email} href={`mailto:${b.email}`} />}
            {b.website && <ContactRow icon={<Globe className="size-4" />} label={b.website} href={b.website} />}
            <ContactRow icon={<MapPin className="size-4" />} label={b.category} />
          </div>
          {b.socials.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {b.socials.map(s => (
                <a key={s.platform} href={s.url} target="_blank" rel="noreferrer"
                  className="hover-lift rounded-full border px-4 py-2 text-sm font-semibold capitalize"
                  style={{ borderColor: hexToRgba(b.color_primary, 0.35), color: b.color_primary }}>
                  {s.platform}
                </a>
              ))}
            </div>
          )}
        </Section>
      </main>

      <footer className="border-t px-6 py-10 text-center">
        <p className="text-sm font-semibold">{b.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Page built with <a href="/" className="font-semibold underline underline-offset-2">BizCard AI</a>
        </p>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity:0, y:28 }} whileInView={{ opacity:1, y:0 }}
      viewport={{ once:true, margin:"-80px" }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
      className="mb-14">
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight">{title}</h2>
      {children}
    </motion.section>
  );
}

function ContactRow({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string }) {
  const inner = (
    <span className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium">
      <span className="text-muted-foreground">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
  return href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{inner}</a> : inner;
}

function BookingSection({ business: b }: { business: NonNullable<PublicBusiness> }) {
  const settings = b.booking!;
  const slots = buildTimeSlots(settings.start_time, settings.end_time, settings.slot_duration_mins);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const dayOk = (value: string) => {
    if (!value) return true;
    const day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(`${value}T12:00`).getDay()];
    return settings.available_days.includes(day!);
  };

  const submit = async () => {
    if (!date || !slot || (settings.collect_name && !name.trim())) {
      toast.error("Please pick a date, a time and add your name."); return;
    }
    if (!dayOk(date)) { toast.error(`We're only open on ${settings.available_days.join(", ")}.`); return; }
    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert({
      business_id: b.id, customer_name: name.trim() || "Guest",
      customer_phone: settings.collect_phone ? phone.trim() || null : null,
      notes: settings.collect_notes ? notes.trim() || null : null,
      date, time_slot: slot,
    });
    setSubmitting(false);
    if (error) { toast.error("Could not send your request. Please try again."); return; }
    setDone(true);
  };

  const inputCls = "w-full rounded-xl border bg-card px-3 py-2 text-sm outline-none focus:border-primary transition";

  if (done) {
    return (
      <section id="book" className="mb-14">
        <motion.div initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }}
          className="rounded-2xl border p-8 text-center" style={{ background: hexToRgba(b.color_primary, 0.08) }}>
          <span className="mx-auto grid size-14 place-items-center rounded-2xl"
            style={{ background: b.color_primary, color: readableOn(b.color_primary) }}>
            <Check className="size-7" />
          </span>
          <h3 className="mt-4 text-xl font-extrabold">Request sent!</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {b.name} will confirm your {settings.booking_type} for {date} at {slot}.
          </p>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="book" className="mb-14 scroll-mt-8">
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight">
        {settings.booking_type === "reservation" ? "Reserve a table" : "Book an appointment"}
      </h2>
      <div className="space-y-5 rounded-2xl border bg-card p-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">Pick a date</label>
          <input type="date" className={inputCls} value={date}
            min={new Date().toISOString().slice(0, 10)} onChange={e => setDate(e.target.value)} />
          <p className="mt-2 text-xs text-muted-foreground">Open {settings.available_days.join(", ")}</p>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold">Pick a time</label>
          <div className="flex flex-wrap gap-2">
            {slots.map(s => (
              <button key={s} type="button" onClick={() => setSlot(s)}
                className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
                style={slot === s ? { background: b.color_primary, color: readableOn(b.color_primary), borderColor: b.color_primary } : undefined}>
                {s}
              </button>
            ))}
          </div>
        </div>
        {settings.collect_name && (
          <div>
            <label className="mb-2 block text-sm font-semibold">Your name</label>
            <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
        )}
        {settings.collect_phone && (
          <div>
            <label className="mb-2 block text-sm font-semibold">Phone</label>
            <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
          </div>
        )}
        {settings.collect_notes && (
          <div>
            <label className="mb-2 block text-sm font-semibold">Notes (optional)</label>
            <textarea className={`${inputCls} resize-none`} rows={3} value={notes}
              onChange={e => setNotes(e.target.value)} placeholder="Anything we should know?" />
          </div>
        )}
        <button onClick={() => void submit()} disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
          style={{ background: b.color_primary, color: readableOn(b.color_primary) }}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {settings.booking_type === "reservation" ? "Request reservation" : "Request appointment"}
        </button>
      </div>
    </section>
  );
}
