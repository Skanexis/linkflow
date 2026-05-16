import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Zap, Palette, BarChart3, Globe, Puzzle, ArrowRight, Check, X, Star } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const SAMPLE_PROFILES = [
  {
    name: "Sofia K.",
    username: "sofiadesigns",
    color: "#7c3aed",
    bg: "linear-gradient(135deg, #1a0533 0%, #0d0221 100%)",
    initials: "SK",
    bio: "UX Designer 🎨 | Creating experiences",
    links: ["Portfolio", "Dribbble", "Instagram", "YouTube"],
  },
  {
    name: "Marcus J.",
    username: "marcustech",
    color: "#0ea5e9",
    bg: "linear-gradient(135deg, #0c1445 0%, #050d2e 100%)",
    initials: "MJ",
    bio: "Full Stack Dev ⚡ | Open Source",
    links: ["GitHub", "Blog", "Twitter", "LinkedIn"],
  },
  {
    name: "Aria Moon",
    username: "ariamoon",
    color: "#ec4899",
    bg: "linear-gradient(135deg, #3d0030 0%, #1a0018 100%)",
    initials: "AM",
    bio: "Content Creator 🌙 | 2M followers",
    links: ["Instagram", "TikTok", "YouTube", "Merch Store"],
  },
];

const FEATURES = [
  {
    icon: Palette,
    title: "Full Theme Control",
    desc: "Animated gradients, custom fonts, glass morphism — create your unique aesthetic",
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Zap,
    title: "Smart Links",
    desc: "Auto-detects platforms, conditional visibility by time/device, link scheduling",
    gradient: "from-yellow-500/20 to-orange-500/20",
    iconColor: "text-yellow-400",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    desc: "Track clicks, geo stats, device breakdown with real-time charts",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Sparkles,
    title: "Style Presets",
    desc: "Curated backgrounds, fonts, patterns, and profile styles you can tune by hand",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    icon: Puzzle,
    title: "Interactive Widgets",
    desc: "Music player, polls, countdowns, email capture, video previews",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    icon: Globe,
    title: "Multiple Layouts",
    desc: "Vertical, grid, carousel, masonry — not just another boring link list",
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-400",
  },
];

const COMPARISON = [
  { feature: "Custom backgrounds & gradients", us: true, linktree: false, biolink: false },
  { feature: "Animated theme effects", us: true, linktree: false, biolink: false },
  { feature: "Multiple layout modes", us: true, linktree: false, biolink: false },
  { feature: "Interactive widget system", us: true, linktree: true, biolink: false },
  { feature: "Curated style presets", us: true, linktree: false, biolink: false },
  { feature: "Conditional smart links", us: true, linktree: false, biolink: false },
  { feature: "Deep analytics dashboard", us: true, linktree: true, biolink: true },
  { feature: "Drag & drop editor", us: true, linktree: true, biolink: true },
];

const STATS = [
  { value: "50K+", label: "Creators" },
  { value: "2M+", label: "Monthly visitors" },
  { value: "99.9%", label: "Uptime" },
  { value: "Free", label: "Forever plan" },
];

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [activeProfile, setActiveProfile] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActiveProfile(p => (p + 1) % SAMPLE_PROFILES.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-full overflow-y-auto overflow-x-hidden bg-[#030007]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#030007]/80">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>
              LinkFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="text-white/60 hover:text-white transition-colors px-4 py-2"
              style={{ fontSize: "14px" }}
            >
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="bg-white text-black px-5 py-2 rounded-full hover:bg-white/90 transition-all"
              style={{ fontSize: "14px", fontWeight: 600 }}
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full opacity-25"
            style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)", animation: "pulse 4s ease-in-out infinite" }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)", animation: "pulse 4s ease-in-out infinite 2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #4f46e5 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                <span
                  className="inline-flex items-center gap-2 bg-violet-500/10 text-violet-300 px-4 py-1.5 rounded-full mb-6 border border-violet-500/20"
                  style={{ fontSize: "13px", fontWeight: 500 }}
                >
                  <Star size={13} fill="currentColor" />
                  More than a Linktree — it's your micro-site
                </span>

                <h1
                  className="text-white mb-6"
                  style={{
                    fontSize: "clamp(38px, 6vw, 76px)",
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Your entire world
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    one link away.
                  </span>
                </h1>

                <p className="text-white/55 mb-10 max-w-lg" style={{ fontSize: "18px", lineHeight: 1.7 }}>
                  Build a stunning personal micro-site with custom themes, interactive widgets, conditional links,
                  and analytics that actually tell you something.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button
                    onClick={onGetStarted}
                    className="flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full transition-all"
                    style={{
                      background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                      fontSize: "16px",
                      fontWeight: 600,
                      boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
                    }}
                  >
                    Create your free page <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={onLogin}
                    className="flex items-center justify-center gap-2 text-white px-8 py-4 rounded-full transition-all border border-white/10 hover:border-white/20 hover:bg-white/5"
                    style={{ fontSize: "16px" }}
                  >
                    Sign in to dashboard
                  </button>
                </div>

                <p className="text-white/25 mt-5" style={{ fontSize: "13px" }}>
                  Free forever · No credit card · Live in 2 minutes
                </p>
              </motion.div>
            </div>

            {/* Right: animated profile cards */}
            <div className="flex-shrink-0">
              <div className="relative" style={{ width: "280px", height: "400px" }}>
                {SAMPLE_PROFILES.map((p, i) => {
                  const offset = i - activeProfile;
                  const isActive = i === activeProfile;
                  return (
                    <motion.div
                      key={p.username}
                      animate={{
                        opacity: isActive ? 1 : 0.25,
                        scale: isActive ? 1 : 0.92,
                        y: offset * 16,
                        rotateY: offset * 8,
                        zIndex: isActive ? 10 : 10 - Math.abs(offset),
                      }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <MiniProfileCard profile={p} />
                    </motion.div>
                  );
                })}

                {/* Dots */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
                  {SAMPLE_PROFILES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveProfile(i)}
                      className="rounded-full transition-all"
                      style={{
                        width: i === activeProfile ? "20px" : "6px",
                        height: "6px",
                        background: i === activeProfile ? "#a855f7" : "rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/5 py-8 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-white" style={{ fontSize: "28px", fontWeight: 800 }}>{s.value}</p>
              <p className="text-white/40" style={{ fontSize: "13px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-white mb-4" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 700 }}>
                Everything you need to stand out
              </h2>
              <p className="text-white/50 max-w-xl mx-auto" style={{ fontSize: "17px" }}>
                Powerful features designed for creators, businesses, and everyone in between.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                viewport={{ once: true }}
                className="rounded-2xl p-6 border border-white/8 hover:border-white/15 transition-all cursor-default"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4`}
                >
                  <f.icon size={22} className={f.iconColor} />
                </div>
                <h3 className="text-white mb-2" style={{ fontWeight: 600, fontSize: "16px" }}>
                  {f.title}
                </h3>
                <p className="text-white/45" style={{ fontSize: "14px", lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 px-6" style={{ background: "rgba(255,255,255,0.01)" }}>
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-white mb-4" style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700 }}>
              See why creators upgrade to LinkFlow
            </h2>
          </motion.div>

          <div className="rounded-2xl overflow-hidden border border-white/8">
            <div
              className="grid grid-cols-4 px-6 py-4"
              style={{ background: "rgba(255,255,255,0.05)" }}
            >
              <div className="text-white/40" style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Feature
              </div>
              <div className="text-center">
                <span
                  className="text-violet-300 px-3 py-1 rounded-full"
                  style={{ fontSize: "12px", fontWeight: 700, background: "rgba(168, 85, 247, 0.2)" }}
                >
                  LinkFlow
                </span>
              </div>
              <div className="text-center text-white/30" style={{ fontSize: "12px", fontWeight: 600 }}>
                Linktree
              </div>
              <div className="text-center text-white/30" style={{ fontSize: "12px", fontWeight: 600 }}>
                Bio.link
              </div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className="grid grid-cols-4 px-6 py-3.5 border-t border-white/5"
              >
                <div className="text-white/65" style={{ fontSize: "14px" }}>
                  {row.feature}
                </div>
                <div className="flex justify-center">
                  {row.us ? (
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check size={13} className="text-green-400" />
                    </div>
                  ) : (
                    <X size={16} className="text-white/15" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.linktree ? (
                    <Check size={16} className="text-white/30" />
                  ) : (
                    <X size={16} className="text-white/15" />
                  )}
                </div>
                <div className="flex justify-center">
                  {row.biolink ? (
                    <Check size={16} className="text-white/30" />
                  ) : (
                    <X size={16} className="text-white/15" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <h2
            className="text-white mb-6"
            style={{ fontSize: "clamp(32px, 5vw, 58px)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            Ready to go{" "}
            <span style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              beyond Linktree?
            </span>
          </h2>
          <p className="text-white/50 mb-10" style={{ fontSize: "18px" }}>
            Join thousands of creators who've built stunning micro-sites with LinkFlow.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 text-white px-12 py-4 rounded-full transition-all"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
              fontSize: "18px",
              fontWeight: 600,
              boxShadow: "0 8px 40px rgba(124, 58, 237, 0.4)",
            }}
          >
            Start for free <ArrowRight size={20} />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={11} className="text-white" />
            </div>
            <span className="text-white/40" style={{ fontSize: "14px" }}>LinkFlow</span>
          </div>
          <p className="text-white/20" style={{ fontSize: "13px" }}>
            © 2026 LinkFlow. Built with ❤️ for creators.
          </p>
        </div>
      </footer>
    </div>
  );
}

function MiniProfileCard({ profile }: { profile: (typeof SAMPLE_PROFILES)[0] }) {
  return (
    <div
      className="w-full rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden"
      style={{ background: profile.bg, backdropFilter: "blur(20px)" }}
    >
      <div className="flex flex-col items-center text-center mb-5">
        <div
          className="rounded-full flex items-center justify-center text-white mb-3"
          style={{
            width: "72px",
            height: "72px",
            background: profile.color,
            fontSize: "22px",
            fontWeight: 700,
            boxShadow: `0 0 24px ${profile.color}60`,
          }}
        >
          {profile.initials}
        </div>
        <h3 className="text-white mb-0.5" style={{ fontWeight: 700, fontSize: "17px" }}>
          {profile.name}
        </h3>
        <p className="text-white/40" style={{ fontSize: "12px" }}>
          linkflow.io/{profile.username}
        </p>
        <p className="text-white/60 mt-2" style={{ fontSize: "12px" }}>
          {profile.bio}
        </p>
      </div>
      <div className="space-y-2">
        {profile.links.map((link) => (
          <div
            key={link}
            className="w-full py-2.5 rounded-full text-center text-white/75 border border-white/10 transition-all"
            style={{ background: `${profile.color}20`, fontSize: "12px", fontWeight: 500 }}
          >
            {link}
          </div>
        ))}
      </div>
    </div>
  );
}
