import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  Globe,
  Palette,
  Puzzle,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const BRAND = {
  bg: "#030007",
  bgSoft: "#07030f",
  panel: "rgba(255, 255, 255, 0.04)",
  border: "rgba(255, 255, 255, 0.09)",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.58)",
  soft: "rgba(255, 255, 255, 0.36)",
  teal: "#a855f7",
  amber: "#ec4899",
  coral: "#7c3aed",
};

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

const STATS = [
  { value: "50K+", label: "Creators" },
  { value: "2M+", label: "Monthly visits" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "Starter plan" },
];

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
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
