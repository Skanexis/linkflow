import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Camera,
  Check,
  Code2,
  Github,
  Globe,
  Headphones,
  Instagram,
  Mail,
  MapPin,
  Palette,
  Play,
  Puzzle,
  ShoppingBag,
  Sparkles,
  Star,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const BRAND = {
  bg: "#030007",
  bgSoft: "#07030f",
  panel: "rgba(255, 255, 255, 0.04)",
  panelStrong: "rgba(255, 255, 255, 0.07)",
  border: "rgba(255, 255, 255, 0.09)",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.58)",
  soft: "rgba(255, 255, 255, 0.36)",
  teal: "#a855f7",
  amber: "#ec4899",
  coral: "#7c3aed",
};

type MockLink = {
  label: string;
  subtitle: string;
  icon: LucideIcon;
};

type MockWidget = {
  label: string;
  title: string;
  meta: string;
  icon: LucideIcon;
  color: string;
};

type SampleProfile = {
  name: string;
  username: string;
  role: string;
  color: string;
  color2: string;
  bg: string;
  initials: string;
  bio: string;
  font: string;
  badge: string;
  image: string;
  stat: string;
  links: MockLink[];
  widgets: MockWidget[];
};

const SAMPLE_PROFILES: SampleProfile[] = [
  {
    name: "Mira Vale",
    username: "miravale",
    role: "Electronic artist",
    color: "#14f195",
    color2: "#8b5cf6",
    bg: "linear-gradient(155deg, #03170f 0%, #071226 54%, #1b0b3a 100%)",
    initials: "MV",
    bio: "New single, tour dates, merch, and the late-night set archive.",
    font: "Chakra Petch",
    badge: "Synthwave FM",
    image: "linear-gradient(135deg, #14f195, #22d3ee 45%, #8b5cf6)",
    stat: "171 BPM",
    links: [
      { label: "Listen on Spotify", subtitle: "Latest single", icon: Headphones },
      { label: "Tour dates", subtitle: "Berlin, Milan, Paris", icon: Calendar },
      { label: "Merch drop", subtitle: "Limited vinyl bundle", icon: ShoppingBag },
    ],
    widgets: [
      { label: "Now playing", title: "Neon Afterglow", meta: "Mira Vale · 171 BPM", icon: Play, color: "#14f195" },
      { label: "Next show", title: "Warehouse 09", meta: "May 30 · Milan", icon: MapPin, color: "#8b5cf6" },
    ],
  },
  {
    name: "Noah Chen",
    username: "noahbuilds",
    role: "AI product engineer",
    color: "#38bdf8",
    color2: "#facc15",
    bg: "linear-gradient(155deg, #020617 0%, #0f172a 58%, #172554 100%)",
    initials: "NC",
    bio: "Shipping AI tools, teardown notes, open-source repos, and product templates.",
    font: "Sora",
    badge: "Builder OS",
    image: "linear-gradient(135deg, #38bdf8, #6366f1 52%, #facc15)",
    stat: "24K reads",
    links: [
      { label: "GitHub projects", subtitle: "Agents, SDK demos", icon: Github },
      { label: "Weekly build log", subtitle: "Product notes", icon: Mail },
      { label: "Book a consult", subtitle: "30 minute session", icon: Calendar },
    ],
    widgets: [
      { label: "Featured template", title: "Launch Stack v3", meta: "$39 · Notion + code", icon: Code2, color: "#38bdf8" },
      { label: "Newsletter", title: "The Build Loop", meta: "8,420 subscribers", icon: Mail, color: "#facc15" },
    ],
  },
  {
    name: "Lina Studio",
    username: "linastudio",
    role: "Visual creator",
    color: "#fb7185",
    color2: "#f97316",
    bg: "linear-gradient(155deg, #1f0a12 0%, #431407 58%, #111827 100%)",
    initials: "LS",
    bio: "Campaign work, behind-the-scenes videos, presets, and studio booking.",
    font: "Playfair Display",
    badge: "Editorial kit",
    image: "linear-gradient(135deg, #fb7185, #f97316 45%, #facc15)",
    stat: "12K views",
    links: [
      { label: "Latest video", subtitle: "Studio lighting setup", icon: Play },
      { label: "Preset shop", subtitle: "Color packs", icon: ShoppingBag },
      { label: "Instagram", subtitle: "Daily visual notes", icon: Instagram },
    ],
    widgets: [
      { label: "Video premiere", title: "Golden Hour Setup", meta: "12K views", icon: Camera, color: "#fb7185" },
      { label: "Studio slot", title: "Book June dates", meta: "4 sessions left", icon: Calendar, color: "#f97316" },
    ],
  },
];

const FEATURES = [
  {
    icon: Palette,
    title: "Theme studio",
    desc: "Backgrounds, buttons, icons, fonts, motion, and profile styles tuned from one editor.",
    color: BRAND.teal,
  },
  {
    icon: Zap,
    title: "Smart links",
    desc: "Schedule links, target devices, detect platforms, and keep the page focused.",
    color: BRAND.amber,
  },
  {
    icon: BarChart3,
    title: "Readable analytics",
    desc: "Clicks, devices, referrers, and top links without turning the dashboard into noise.",
    color: "#7dd3fc",
  },
  {
    icon: Sparkles,
    title: "Style presets",
    desc: "Start from polished presets and adjust details without fighting the interface.",
    color: "#c4b5fd",
  },
  {
    icon: Puzzle,
    title: "Live widgets",
    desc: "Music, countdowns, products, maps, chats, polls, and email capture in one page.",
    color: "#86efac",
  },
  {
    icon: Globe,
    title: "Public pages",
    desc: "Fast responsive pages that feel like a real micro-site, not a cramped list.",
    color: BRAND.coral,
  },
];

const COMPARISON = [
  { feature: "Custom backgrounds and gradients", us: true, linktree: false, biolink: false },
  { feature: "Multiple visual profile styles", us: true, linktree: false, biolink: false },
  { feature: "Interactive widget system", us: true, linktree: true, biolink: false },
  { feature: "Conditional smart links", us: true, linktree: false, biolink: false },
  { feature: "Deep analytics dashboard", us: true, linktree: true, biolink: true },
  { feature: "Drag and drop editor", us: true, linktree: true, biolink: true },
];

const STATS = [
  { value: "50K+", label: "Creators" },
  { value: "2M+", label: "Monthly visits" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "Starter plan" },
];

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [activeProfile, setActiveProfile] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveProfile((p) => (p + 1) % SAMPLE_PROFILES.length), 3600);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-dvh overflow-x-hidden"
      style={{
        background: BRAND.bg,
        color: BRAND.text,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ background: "rgba(3,0,7,0.84)", borderColor: BRAND.border }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <BrandMark size="md" />
            <span style={{ fontWeight: 800, fontSize: "18px" }}>LinkFlow</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onLogin}
              className="rounded-lg px-3 py-2 transition-colors hover:bg-white/5 sm:px-4"
              style={{ color: BRAND.muted, fontSize: "14px" }}
            >
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="rounded-lg px-4 py-2 transition-transform hover:-translate-y-0.5 sm:px-5"
              style={{ background: BRAND.text, color: "#101714", fontSize: "14px", fontWeight: 800 }}
            >
              Start free
            </button>
          </div>
        </div>
      </nav>

      <section
        className="relative px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:pb-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(246,242,232,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(246,242,232,0.045) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(125deg, rgba(37,208,178,0.12), transparent 34%), linear-gradient(235deg, rgba(245,184,75,0.1), transparent 36%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="mx-auto max-w-4xl text-center"
          >
            <span
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ background: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.26)", color: "#d8b4fe", fontSize: "13px", fontWeight: 700 }}
            >
              <Star size={13} fill="currentColor" />
              A focused micro-site builder for creators
            </span>

            <h1
              className="mx-auto mb-6 max-w-4xl"
              style={{
                fontSize: "clamp(42px, 8vw, 84px)",
                fontWeight: 900,
                lineHeight: 1.03,
                letterSpacing: 0,
              }}
            >
              One link that feels like your whole brand.
            </h1>

            <p className="mx-auto mb-8 max-w-2xl" style={{ color: BRAND.muted, fontSize: "18px", lineHeight: 1.7 }}>
              Build a public page with a calm editor, rich widgets, smart links, and analytics that stay easy to read.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-7 py-3.5 transition-transform hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.amber})`,
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: 900,
                  boxShadow: "0 18px 42px rgba(124,58,237,0.28)",
                }}
              >
                Create your page <ArrowRight size={17} />
              </button>
              <button
                onClick={onLogin}
                className="inline-flex items-center justify-center gap-2 rounded-lg border px-7 py-3.5 transition-colors hover:bg-white/5"
                style={{ borderColor: BRAND.border, color: BRAND.text, fontSize: "15px", fontWeight: 700 }}
              >
                Open dashboard
              </button>
            </div>
          </motion.div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.25fr_1fr] lg:items-end">
            {SAMPLE_PROFILES.map((profile, index) => (
              <motion.div
                key={profile.username}
                initial={{ opacity: 0, y: 24 }}
                animate={{
                  opacity: activeProfile === index ? 1 : 0.64,
                  y: activeProfile === index ? -8 : 0,
                  scale: activeProfile === index ? 1 : 0.98,
                }}
                transition={{ duration: 0.4 }}
                className={index === 1 ? "lg:mb-8" : ""}
              >
                <MiniProfileCard profile={profile} featured={activeProfile === index} />
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex justify-center gap-2">
            {SAMPLE_PROFILES.map((profile, index) => (
              <button
                key={profile.username}
                onClick={() => setActiveProfile(index)}
                className="rounded-full transition-all"
                style={{
                  width: activeProfile === index ? "28px" : "8px",
                  height: "8px",
                  background: activeProfile === index ? BRAND.teal : "rgba(246,242,232,0.22)",
                }}
                aria-label={`Show ${profile.name}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y px-4 py-7 sm:px-6" style={{ borderColor: BRAND.border, background: BRAND.bgSoft }}>
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p style={{ color: BRAND.text, fontSize: "28px", fontWeight: 900 }}>{stat.value}</p>
              <p style={{ color: BRAND.soft, fontSize: "13px" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <h2 style={{ color: BRAND.text, fontSize: "36px", fontWeight: 900, lineHeight: 1.12 }}>
              Powerful without feeling heavy.
            </h2>
            <p className="mt-3" style={{ color: BRAND.muted, fontSize: "16px", lineHeight: 1.65 }}>
              The interface keeps actions clear, surfaces the important numbers, and lets each creator page have its own personality.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                className="rounded-lg border p-5 transition-colors hover:bg-white/[0.075]"
                style={{ background: BRAND.panel, borderColor: BRAND.border }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border"
                  style={{ background: `${feature.color}18`, borderColor: `${feature.color}38`, color: feature.color }}
                >
                  <feature.icon size={20} />
                </div>
                <h3 style={{ color: BRAND.text, fontWeight: 800, fontSize: "16px" }}>{feature.title}</h3>
                <p className="mt-2" style={{ color: BRAND.muted, fontSize: "14px", lineHeight: 1.65 }}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6" style={{ background: BRAND.bgSoft }}>
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 style={{ color: BRAND.text, fontSize: "34px", fontWeight: 900, lineHeight: 1.14 }}>
              Built for pages people actually explore.
            </h2>
            <p className="mx-auto mt-3 max-w-xl" style={{ color: BRAND.muted, fontSize: "15px", lineHeight: 1.65 }}>
              More design control than a simple link list, less clutter than a full website builder.
            </p>
          </div>

          <div className="overflow-hidden rounded-lg border" style={{ borderColor: BRAND.border, background: BRAND.panel }}>
            <div className="grid grid-cols-4 px-4 py-4 sm:px-6" style={{ background: BRAND.panelStrong }}>
              <div style={{ color: BRAND.soft, fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0 }}>
                Feature
              </div>
              <div className="text-center">
                <span className="rounded-full px-3 py-1" style={{ background: "rgba(168,85,247,0.2)", color: "#d8b4fe", fontSize: "12px", fontWeight: 900 }}>
                  LinkFlow
                </span>
              </div>
              <div className="text-center" style={{ color: BRAND.soft, fontSize: "12px", fontWeight: 800 }}>
                Linktree
              </div>
              <div className="text-center" style={{ color: BRAND.soft, fontSize: "12px", fontWeight: 800 }}>
                Bio.link
              </div>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.feature} className="grid grid-cols-4 border-t px-4 py-3.5 sm:px-6" style={{ borderColor: "rgba(246,242,232,0.075)" }}>
                <div style={{ color: BRAND.muted, fontSize: "14px" }}>{row.feature}</div>
                <div className="flex justify-center">{row.us ? <CheckMark /> : <X size={16} color="rgba(246,242,232,0.18)" />}</div>
                <div className="flex justify-center">{row.linktree ? <Check size={16} color={BRAND.soft} /> : <X size={16} color="rgba(246,242,232,0.18)" />}</div>
                <div className="flex justify-center">{row.biolink ? <Check size={16} color={BRAND.soft} /> : <X size={16} color="rgba(246,242,232,0.18)" />}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 text-center sm:px-6 lg:py-24">
        <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mx-auto max-w-2xl">
          <h2 style={{ color: BRAND.text, fontSize: "40px", fontWeight: 900, lineHeight: 1.08, letterSpacing: 0 }}>
            Launch the page people remember.
          </h2>
          <p className="mx-auto mt-4 max-w-xl" style={{ color: BRAND.muted, fontSize: "16px", lineHeight: 1.65 }}>
            Start with a clean page, then add the links, widgets, and visuals your audience needs.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-8 py-3.5 transition-transform hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.amber})`,
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: 900,
            }}
          >
            Start for free <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>

      <footer className="border-t px-4 py-7 sm:px-6" style={{ borderColor: BRAND.border }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span style={{ color: BRAND.soft, fontSize: "14px", fontWeight: 700 }}>LinkFlow</span>
          </div>
          <p style={{ color: "rgba(246,242,232,0.24)", fontSize: "13px" }}>
            2026 LinkFlow. Built for creators and small teams.
          </p>
        </div>
      </footer>
    </div>
  );
}

function BrandMark({ size }: { size: "sm" | "md" }) {
  const box = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const icon = size === "sm" ? 11 : 15;

  return (
    <div
      className={`${box} flex items-center justify-center rounded-lg`}
      style={{
        background: `linear-gradient(135deg, ${BRAND.teal}, ${BRAND.amber})`,
        color: "#ffffff",
        boxShadow: "0 10px 28px rgba(124,58,237,0.25)",
      }}
    >
      <Sparkles size={icon} />
    </div>
  );
}

function CheckMark() {
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full" style={{ background: "rgba(168,85,247,0.2)", color: BRAND.teal }}>
      <Check size={13} />
    </span>
  );
}

function MiniProfileCard({ profile, featured }: { profile: SampleProfile; featured: boolean }) {
  return (
    <div
      className="relative h-full overflow-hidden rounded-[28px] border shadow-2xl"
      style={{
        background: "linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))",
        borderColor: featured ? `${profile.color}66` : BRAND.border,
        boxShadow: featured ? `0 28px 80px ${profile.color}18` : "0 16px 45px rgba(0,0,0,0.24)",
        padding: "10px",
      }}
    >
      <div
        className="relative overflow-hidden rounded-[22px]"
        style={{
          minHeight: featured ? "560px" : "500px",
          background: profile.bg,
          fontFamily: `'${profile.font}', Inter, system-ui, sans-serif`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 70%)",
          }}
        />
        <div
          className="absolute -right-16 top-8 h-48 w-48 rounded-full blur-3xl"
          style={{ background: `${profile.color}3d` }}
        />
        <div
          className="absolute -left-10 bottom-20 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `${profile.color2}32` }}
        />

        <div className="relative flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#ffbd2e" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <span
            className="rounded-full px-2.5 py-1"
            style={{ background: "rgba(0,0,0,0.24)", color: "rgba(255,255,255,0.72)", fontSize: "10px", fontWeight: 800 }}
          >
            linkflow.io/{profile.username}
          </span>
        </div>

        <div className="relative px-5 pb-5">
          <div
            className="mb-5 overflow-hidden rounded-2xl border"
            style={{ background: profile.image, borderColor: "rgba(255,255,255,0.16)", height: featured ? "132px" : "112px" }}
          >
            <div
              className="h-full w-full"
              style={{
                background:
                  "radial-gradient(circle at 22% 28%, rgba(255,255,255,0.52), transparent 18%), radial-gradient(circle at 72% 62%, rgba(0,0,0,0.22), transparent 26%), linear-gradient(120deg, rgba(255,255,255,0.18), transparent 44%)",
              }}
            />
          </div>

          <div className="mb-5 flex items-start gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: `linear-gradient(135deg, ${profile.color}, ${profile.color2})`,
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 900,
                boxShadow: `0 12px 28px ${profile.color}35`,
              }}
            >
              {profile.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h3 className="truncate" style={{ color: BRAND.text, fontWeight: 900, fontSize: featured ? "22px" : "19px", lineHeight: 1.1 }}>
                  {profile.name}
                </h3>
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: profile.color }} />
              </div>
              <p className="truncate" style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", fontWeight: 700 }}>
                {profile.role}
              </p>
              <p className="mt-2" style={{ color: "rgba(255,255,255,0.72)", fontSize: "12px", lineHeight: 1.45 }}>
                {profile.bio}
              </p>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div
              className="rounded-2xl border px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.12)" }}
            >
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: 800 }}>{profile.badge}</p>
              <p className="truncate" style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900 }}>
                {profile.stat}
              </p>
            </div>
            <div
              className="rounded-2xl border px-3 py-2.5"
              style={{ background: `${profile.color}18`, borderColor: `${profile.color}38` }}
            >
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", fontWeight: 800 }}>Live page</p>
              <p className="truncate" style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900 }}>
                Smart links
              </p>
            </div>
          </div>

          <div className="mb-4 space-y-2">
            {profile.widgets.map((widget) => {
              const Icon = widget.icon;
              return (
                <div
                  key={widget.title}
                  className="relative overflow-hidden rounded-2xl border px-3 py-3"
                  style={{ background: "rgba(255,255,255,0.09)", borderColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(14px)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `${widget.color}24`, color: widget.color }}>
                      <Icon size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate" style={{ color: "rgba(255,255,255,0.46)", fontSize: "10px", fontWeight: 800, textTransform: "uppercase" }}>
                        {widget.label}
                      </p>
                      <p className="truncate" style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900 }}>
                        {widget.title}
                      </p>
                      <p className="truncate" style={{ color: "rgba(255,255,255,0.48)", fontSize: "11px", fontWeight: 600 }}>
                        {widget.meta}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            {profile.links.map((link, index) => {
              const Icon = link.icon;
              const active = index === 0;
              return (
                <div
                  key={link.label}
                  className="flex items-center gap-3 rounded-2xl border px-3 py-3"
                  style={{
                    background: active ? `linear-gradient(135deg, ${profile.color}32, rgba(255,255,255,0.08))` : "rgba(255,255,255,0.06)",
                    borderColor: active ? `${profile.color}55` : "rgba(255,255,255,0.1)",
                  }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: active ? profile.color : "rgba(255,255,255,0.08)", color: "#ffffff" }}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate" style={{ color: "#ffffff", fontSize: "13px", fontWeight: 900 }}>{link.label}</p>
                    <p className="truncate" style={{ color: "rgba(255,255,255,0.45)", fontSize: "11px", fontWeight: 600 }}>{link.subtitle}</p>
                  </div>
                  <ArrowRight size={14} color="rgba(255,255,255,0.38)" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
