import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Eye, EyeOff, ArrowLeft, Chrome, Apple } from "lucide-react";

interface AuthPageProps {
  mode: "login" | "register";
  onModeChange: (mode: "login" | "register") => void;
  error?: string | null;
  notice?: string | null;
  pendingVerificationEmail?: string | null;
  onAuth: (input: { mode: "login" | "register"; email: string; password: string; username?: string }) => Promise<void>;
  onResendVerification: (email: string) => Promise<void>;
  onSocialAuth: (provider: "google" | "apple") => Promise<void>;
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
      className="min-h-full flex items-center justify-center bg-[#030007] px-4 py-16 relative overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Bg blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full opacity-12"
          style={{ background: "radial-gradient(circle, #ec4899 0%, transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-8 transition-colors"
          style={{ fontSize: "14px" }}
        >
          <ArrowLeft size={15} /> Back to home
        </button>

        <div
          className="rounded-3xl p-8 border border-white/8"
          style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(24px)" }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={15} className="text-white" />
            </div>
            <span className="text-white" style={{ fontWeight: 700, fontSize: "18px" }}>
              LinkFlow
            </span>
          </div>

          <h1 className="text-white mb-1" style={{ fontSize: "24px", fontWeight: 700 }}>
            {mode === "register" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="text-white/40 mb-8" style={{ fontSize: "14px" }}>
            {mode === "register"
              ? "Your micro-site is 2 minutes away"
              : "Sign in to manage your page"}
          </p>

          {/* Tab toggle */}
          <div
            className="flex gap-1 mb-7 rounded-xl p-1"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            {(["register", "login"] as const).map((m) => (
              <button
                key={m}
                onClick={() => onModeChange(m)}
                className="flex-1 py-2 rounded-lg transition-all"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  background: mode === m ? "white" : "transparent",
                  color: mode === m ? "#000" : "rgba(255,255,255,0.5)",
                }}
              >
                {m === "register" ? "Create account" : "Sign in"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#fca5a5", fontSize: "13px" }}
              >
                {error}
              </div>
            )}

            {notice && (
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)", color: "#bbf7d0", fontSize: "13px", lineHeight: 1.5 }}
              >
                <p>{notice}</p>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-2 text-emerald-200 hover:text-white transition-colors"
                    style={{ fontSize: "12px", fontWeight: 700, opacity: resending ? 0.65 : 1 }}
                  >
                    {resending ? "Sending..." : "Resend verification email"}
                  </button>
                )}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block text-white/60 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ""))}
                  placeholder="yourname"
                  className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: errors.username ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                  onBlur={(e) => (e.target.style.borderColor = errors.username ? "#ef4444" : "rgba(255,255,255,0.1)")}
                />
                {errors.username ? (
                  <p className="text-red-400 mt-1.5" style={{ fontSize: "12px" }}>{errors.username}</p>
                ) : username.length >= 3 ? (
                  <p className="text-white/30 mt-1.5" style={{ fontSize: "12px" }}>
                    linkflow.io/{username}
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <label className="block text-white/60 mb-1.5" style={{ fontSize: "13px", fontWeight: 500 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: errors.email ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                  fontSize: "14px",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                onBlur={(e) => (e.target.style.borderColor = errors.email ? "#ef4444" : "rgba(255,255,255,0.1)")}
              />
              {errors.email && (
                <p className="text-red-400 mt-1.5" style={{ fontSize: "12px" }}>{errors.email}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-white/60" style={{ fontSize: "13px", fontWeight: 500 }}>
                  Password
                </label>
                {mode === "login" && (
                  <button type="button" className="text-violet-400 hover:text-violet-300 transition-colors" style={{ fontSize: "12px" }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-3 pr-12 text-white placeholder-white/20 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: errors.password ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                    fontSize: "14px",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#a855f7")}
                  onBlur={(e) => (e.target.style.borderColor = errors.password ? "#ef4444" : "rgba(255,255,255,0.1)")}
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
                          background: i <= pwStrength.score ? pwStrength.color : "rgba(255,255,255,0.1)",
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
                <input type="checkbox" className="mt-0.5 accent-violet-500" required />
                <span className="text-white/40" style={{ fontSize: "13px", lineHeight: 1.5 }}>
                  I agree to the{" "}
                  <span className="text-violet-400">Terms of Service</span> and{" "}
                  <span className="text-violet-400">Privacy Policy</span>
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl transition-all mt-2"
              style={{
                background: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
                fontSize: "15px",
                fontWeight: 600,
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
              }}
            >
              {loading
                ? "Loading..."
                : mode === "register"
                ? "Create free account"
                : "Sign in"}
            </button>

            <div className="relative flex items-center py-1">
              <div className="flex-1 border-t border-white/8" />
              <span className="px-3 text-white/25" style={{ fontSize: "12px" }}>or continue with</span>
              <div className="flex-1 border-t border-white/8" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onSocialAuth("google")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{ fontSize: "14px" }}
              >
                <Chrome size={16} />
                Google
              </button>
              <button
                type="button"
                onClick={() => onSocialAuth("apple")}
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                style={{ fontSize: "14px" }}
              >
                <Apple size={16} />
                Apple
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-white/25 mt-6" style={{ fontSize: "13px" }}>
          {mode === "register" ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => onModeChange(mode === "register" ? "login" : "register")}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            {mode === "register" ? "Sign in" : "Create one free"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
