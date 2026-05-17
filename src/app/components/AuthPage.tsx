import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Eye, EyeOff, ArrowLeft, Chrome } from "lucide-react";

const AUTH_THEME = {
  bg: "#030007",
  panel: "rgba(255, 255, 255, 0.045)",
  panelStrong: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.1)",
  text: "#ffffff",
  muted: "rgba(255, 255, 255, 0.58)",
  soft: "rgba(255, 255, 255, 0.32)",
  teal: "#a855f7",
  amber: "#ec4899",
  coral: "#ef4444",
};

interface AuthPageProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  error?: string | null;
  notice?: string | null;
  pendingVerificationEmail?: string | null;
  onAuth: (input: { mode: "login" | "register"; email: string; password: string; username?: string }) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
  onSocialAuth: (provider: "google") => Promise<void>;
  onBack: () => void;
}

function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Weak", color: "#ef4444" },
    { score: 2, label: "Fair", color: "#f59e0b" },
    { score: 3, label: "Good", color: "#3b82f6" },
    { score: 4, label: "Strong", color: "#22c55e" },
  ];
  return map[score];
}

export function AuthPage({ mode, onModeChange, error, notice, pendingVerificationEmail, onAuth, onResendVerification, onSocialAuth, onBack }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const pwStrength = mode === "register" ? getPasswordStrength(password) : null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.includes("@")) errs.email = "Enter a valid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (mode === "register" && username.length < 3) errs.username = "Username must be at least 3 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onAuth({ mode, email, password, username });
    setLoading(false);
  };

  const handleResendVerification = async () => {
    const targetEmail = pendingVerificationEmail || email;
    if (!targetEmail.includes("@")) {
      setErrors((current) => ({ ...current, email: "Enter the email you registered with" }));
      return;
    }
    setResending(true);
    await onResendVerification(targetEmail);
    setResending(false);
  };

  return (
    <div
      className="relative flex min-h-dvh items-start justify-center overflow-x-hidden px-3 py-6 sm:px-4 sm:py-10 md:items-center md:py-16"
      style={{
        background: AUTH_THEME.bg,
        backgroundImage:
          "linear-gradient(rgba(168,85,247,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,0.045) 1px, transparent 1px)",
        backgroundSize: "42px 42px",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(125deg, rgba(124,58,237,0.22), transparent 34%), linear-gradient(235deg, rgba(236,72,153,0.16), transparent 36%)",
        }}
      />
      <div
        className="fixed inset-x-0 bottom-0 h-40 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(3,0,7,0.94), transparent)" }}
      />

      <div className="pointer-events-none fixed left-1/2 top-8 hidden w-[min(760px,calc(100vw-32px))] -translate-x-1/2 grid-cols-3 gap-3 md:grid">
        {["Design", "Links", "Analytics"].map((label, index) => (
          <div
            key={label}
            className="rounded-lg border px-4 py-3"
            style={{
              background: "rgba(246,242,232,0.045)",
              borderColor: "rgba(246,242,232,0.08)",
              color: index === 0 ? AUTH_THEME.teal : index === 1 ? AUTH_THEME.amber : AUTH_THEME.coral,
              fontSize: "12px",
              fontWeight: 800,
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <button
          onClick={onBack}
          className="mb-5 flex items-center gap-2 transition-colors sm:mb-8"
          style={{ color: AUTH_THEME.muted, fontSize: "14px" }}
        >
          <ArrowLeft size={15} /> Back to home
        </button>

        <div
          className="rounded-lg border p-5 shadow-2xl sm:p-8"
          style={{ background: AUTH_THEME.panel, borderColor: AUTH_THEME.border, backdropFilter: "blur(24px)", boxShadow: "0 24px 70px rgba(0,0,0,0.32)" }}
        >
          {/* Logo */}
          <div className="mb-6 flex items-center gap-2 sm:mb-8">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)", color: "#ffffff" }}
            >
              <Sparkles size={15} />
            </div>
            <span style={{ color: AUTH_THEME.text, fontWeight: 800, fontSize: "18px" }}>
              LinkFlow
            </span>
          </div>

          <h1 className="mb-1" style={{ color: AUTH_THEME.text, fontSize: "24px", fontWeight: 900 }}>
            {mode === "register" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mb-6 sm:mb-8" style={{ color: AUTH_THEME.muted, fontSize: "14px" }}>
            {mode === "register"
              ? "Your micro-site is a few focused steps away"
              : "Sign in to manage your page"}
          </p>

          {/* Tab toggle */}
          <div
            className="mb-5 flex gap-1 rounded-xl p-1 sm:mb-7"
            style={{ background: "rgba(246,242,232,0.07)" }}
          >
            {(["register", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className="flex-1 rounded-lg py-2 transition-all"
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  background: mode === m ? AUTH_THEME.text : "transparent",
                  color: mode === m ? "#030007" : AUTH_THEME.muted,
                }}
              >
                {m === "register" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
            {error && (
              <div
                className="rounded-lg px-4 py-3"
                style={{ background: "rgba(255,122,89,0.12)", border: "1px solid rgba(255,122,89,0.35)", color: "#fecaca", fontSize: "13px" }}
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                className="rounded-lg px-4 py-3"
                style={{ background: "rgba(37,208,178,0.12)", border: "1px solid rgba(37,208,178,0.34)", color: "#ccfbf1", fontSize: "13px", lineHeight: 1.5 }}
              >
                <p>{notice}</p>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-2 transition-colors"
                    style={{ color: "#a7f3d0", fontSize: "12px", fontWeight: 800, opacity: resending ? 0.65 : 1 }}
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="mb-1.5 block" style={{ color: AUTH_THEME.muted, fontSize: "13px", fontWeight: 800 }}>
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                  placeholder="yourname"
                  className="w-full rounded-lg px-4 py-3 outline-none transition-all"
                  style={{
                    background: AUTH_THEME.panelStrong,
                    border: errors.username ? `1px solid ${AUTH_THEME.coral}` : `1px solid ${AUTH_THEME.border}`,
                    color: AUTH_THEME.text,
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = AUTH_THEME.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.username ? AUTH_THEME.coral : AUTH_THEME.border)}
                />
                {errors.username ? (
                  <p className="text-red-400 mt-1.5" style={{ fontSize: "12px" }}>{errors.username}</p>
                ) : username.length >= 3 ? (
                  <p className="mt-1.5" style={{ color: AUTH_THEME.soft, fontSize: "12px" }}>
                    linkflow.io/{username}
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <label className="mb-1.5 block" style={{ color: AUTH_THEME.muted, fontSize: "13px", fontWeight: 800 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg px-4 py-3 outline-none transition-all"
                style={{
                  background: AUTH_THEME.panelStrong,
                  border: errors.email ? `1px solid ${AUTH_THEME.coral}` : `1px solid ${AUTH_THEME.border}`,
                  color: AUTH_THEME.text,
                  fontSize: "14px",
                }}
                onFocus={(e) => (e.target.style.borderColor = AUTH_THEME.teal)}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? AUTH_THEME.coral : AUTH_THEME.border)}
              />
              {errors.email && (
                <p className="text-red-400 mt-1.5" style={{ fontSize: "12px" }}>{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ color: AUTH_THEME.muted, fontSize: "13px", fontWeight: 800 }}>
                  Password
                </label>
                {mode === "login" && (
                  <button type="button" className="transition-colors" style={{ color: AUTH_THEME.teal, fontSize: "12px", fontWeight: 800 }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-lg px-4 py-3 pr-12 outline-none transition-all"
                  style={{
                    background: AUTH_THEME.panelStrong,
                    border: errors.password ? `1px solid ${AUTH_THEME.coral}` : `1px solid ${AUTH_THEME.border}`,
                    color: AUTH_THEME.text,
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = AUTH_THEME.teal)}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? AUTH_THEME.coral : AUTH_THEME.border)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 mt-1.5" style={{ fontSize: "12px" }}>{errors.password}</p>
              )}

              {/* Password strength */}
              {pwStrength && password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= pwStrength.score ? pwStrength.color : "rgba(246,242,232,0.12)",
                        }}
                      />
                    ))}
                  </div>
                  {pwStrength.label && (
                    <p className="mt-1" style={{ fontSize: "11px", color: pwStrength.color }}>
                      {pwStrength.label} password
                    </p>
                  )}
                </div>
              )}
            </div>

            {mode === "register" && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-0.5" style={{ accentColor: AUTH_THEME.teal }} required />
                <span style={{ color: AUTH_THEME.muted, fontSize: "13px", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <span style={{ color: AUTH_THEME.teal }}>Terms of Service</span> and{" "}
                  <span style={{ color: AUTH_THEME.teal }}>Privacy Policy</span>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg py-3.5 transition-transform hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                color: "#ffffff",
                fontSize: "15px",
                fontWeight: 900,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 16px 38px rgba(124,58,237,0.28)",
              }}
            >
              {loading
                ? "Loading..."
                : mode === "register"
                ? "Create free account"
                : "Sign in"}
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-1 border-t" style={{ borderColor: "rgba(246,242,232,0.09)" }} />
              <span className="px-3" style={{ color: AUTH_THEME.soft, fontSize: "12px" }}>or continue with</span>
              <div className="flex-1 border-t" style={{ borderColor: "rgba(246,242,232,0.09)" }} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => onSocialAuth("google")}
                className="flex items-center justify-center gap-2 rounded-lg border py-3 transition-all hover:bg-white/5"
                style={{ borderColor: AUTH_THEME.border, color: AUTH_THEME.muted, fontSize: "14px", fontWeight: 800 }}
              >
                <Chrome size={16} />
                Google
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center" style={{ color: AUTH_THEME.soft, fontSize: "13px" }}>
          {mode === "register" ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => onModeChange(mode === "register" ? "login" : "register")}
            className="transition-colors"
            style={{ color: AUTH_THEME.teal, fontWeight: 800 }}
          >
            {mode === "register" ? "Sign in" : "Create one free"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
