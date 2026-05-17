import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import * as backend from "./backend";
import type { WidgetType } from "./widgetPlugins";

const LandingPage = lazy(() => import("./components/LandingPage").then((module) => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import("./components/AuthPage").then((module) => ({ default: module.AuthPage })));
const Dashboard = lazy(() => import("./components/Dashboard").then((module) => ({ default: module.Dashboard })));
const PublicProfile = lazy(() => import("./components/PublicProfile").then((module) => ({ default: module.PublicProfile })));

export type AppView = 'landing' | 'auth' | 'dashboard' | 'profile' | 'public';

export interface UserProfile {
  displayName: string;
  username: string;
  bio: string;
  avatarColor: string;
  initials: string;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  visible: boolean;
  platform: string;
  buttonStyle: 'rounded' | 'pill' | 'glass' | '3d' | 'neon' | 'soft' | 'brutal' | 'underline';
  hoverEffect: 'glow' | 'bounce' | 'expand' | 'none' | 'tilt' | 'slide';
  scheduleFrom?: string;
  scheduleTo?: string;
  deviceTarget?: 'all' | 'mobile' | 'desktop';
}

export interface WidgetItem {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  config: Record<string, any>;
}

export interface ProfileTheme {
  backgroundType: 'solid' | 'gradient' | 'animated' | 'image';
  bgColor1: string;
  bgColor2: string;
  buttonStyle: 'rounded' | 'pill' | 'glass' | '3d' | 'neon' | 'soft' | 'brutal' | 'underline';
  hoverEffect: 'glow' | 'bounce' | 'expand' | 'none' | 'tilt' | 'slide';
  layoutMode: 'vertical' | 'grid';
  fontFamily: string;
  primaryColor: string;
  textColor: string;
  backgroundImage?: string;
  backgroundPattern?: 'none' | 'grid' | 'dots' | 'stars' | 'rays';
  backgroundOverlay?: number;
  profileStyle?: 'halo' | 'editorial' | 'terminal' | 'poster';
  widgetStyle?: 'glass' | 'solid' | 'outline' | 'neon';
  contentWidth?: 'compact' | 'comfortable' | 'wide';
  animationPack?: 'smooth' | 'pop' | 'cinematic' | 'neon' | 'minimal';
  iconStyle?: 'brand' | 'mono' | 'duotone' | 'boxed';
}

const defaultProfile: UserProfile = {
  displayName: "Alex Rivera",
  username: "alexrivera",
  bio: "Designer & Developer 🎨 | Building cool stuff | LA 🌴",
  avatarColor: "#7c3aed",
  initials: "AR",
};

const defaultLinks: LinkItem[] = [
  { id: '1', title: 'My Portfolio', url: 'https://portfolio.example.com', visible: true, platform: 'website', buttonStyle: 'pill', hoverEffect: 'glow' },
  { id: '2', title: 'YouTube Channel', url: 'https://youtube.com', visible: true, platform: 'youtube', buttonStyle: 'pill', hoverEffect: 'bounce' },
  { id: '3', title: 'Instagram', url: 'https://instagram.com', visible: true, platform: 'instagram', buttonStyle: 'pill', hoverEffect: 'glow' },
  { id: '4', title: 'GitHub', url: 'https://github.com', visible: true, platform: 'github', buttonStyle: 'pill', hoverEffect: 'expand' },
  { id: '5', title: 'Spotify Playlist', url: 'https://spotify.com', visible: false, platform: 'spotify', buttonStyle: 'pill', hoverEffect: 'none' },
  { id: '6', title: 'Buy Me a Coffee', url: 'https://buymeacoffee.com', visible: true, platform: 'coffee', buttonStyle: 'pill', hoverEffect: 'glow' },
];

const defaultTheme: ProfileTheme = {
  backgroundType: 'gradient',
  bgColor1: '#0f0c29',
  bgColor2: '#302b63',
  buttonStyle: 'pill',
  hoverEffect: 'glow',
  layoutMode: 'vertical',
  fontFamily: 'Inter',
  primaryColor: '#a855f7',
  textColor: '#ffffff',
  backgroundPattern: 'grid',
  backgroundOverlay: 45,
  profileStyle: 'halo',
  widgetStyle: 'glass',
  contentWidth: 'comfortable',
  animationPack: 'smooth',
  iconStyle: 'brand',
};

const defaultWidgets: WidgetItem[] = [
  { id: 'w1', type: 'music', title: 'Now Playing', visible: true, config: { trackId: 'blinding-lights', song: 'Blinding Lights', artist: 'The Weeknd', spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b' } },
  { id: 'w2', type: 'countdown', title: 'Launch Countdown', visible: false, config: { targetDate: '2026-12-31', label: 'New Year 2027' } },
  { id: 'w3', type: 'product', title: 'Product Card', visible: true, config: { name: 'Digital Starter Kit', price: '$29', description: 'Templates, assets, and resources in one bundle.', buttonLabel: 'View product', url: 'https://example.com/product' } },
  { id: 'w4', type: 'map', title: 'Map Location', visible: false, config: { place: 'Studio HQ', address: '123 Creator Ave, Los Angeles', url: 'https://maps.google.com' } },
  { id: 'w5', type: 'chat', title: 'Chat Bubble', visible: true, config: { headline: 'Have a question?', message: 'Send me a quick message and I will get back to you.', buttonLabel: 'Start chat', url: 'mailto:hello@example.com' } },
];

function AppLoading() {
  return (
    <div className="min-h-full flex items-center justify-center bg-[#030007] text-white/60" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      Loading LinkFlow...
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks);
  const [theme, setTheme] = useState<ProfileTheme>(defaultTheme);
  const [widgets, setWidgets] = useState<WidgetItem[]>(defaultWidgets);
  const [publicProfile, setPublicProfile] = useState<backend.PublicProfileSnapshot | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);

  const applySnapshot = useCallback((snapshot: backend.AppSnapshot) => {
    setProfile(snapshot.profile);
    setLinks(snapshot.links);
    setTheme(snapshot.theme);
    setWidgets(snapshot.widgets);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const localEmailToken = params.get("email_verify_token");
    const emailVerified = params.get("email_verified");

    if (localEmailToken) {
      backend.verifyEmail(localEmailToken).then((verified) => {
        window.history.replaceState(null, "", window.location.pathname);
        setAuthMode("login");
        setAuthNotice(verified ? "Email confirmed. You can sign in now." : "Verification link is invalid or expired.");
        setView("auth");
      });
      return;
    }

    if (emailVerified) {
      window.history.replaceState(null, "", window.location.pathname);
      setAuthMode("login");
      setAuthNotice(emailVerified === "1" ? "Email confirmed. You can sign in now." : "Verification link is invalid or expired.");
      setView("auth");
      return;
    }

    const username = window.location.pathname.split("/").filter(Boolean)[0];
    const reserved = new Set(["api", "assets", "dashboard", "auth"]);
    if (username && !reserved.has(username)) {
      backend
        .getPublicProfile(username)
        .then((snapshot) => {
          setPublicProfile(snapshot);
          setView("public");
        })
        .catch(() => setView("landing"));
      return;
    }

    backend.getSession().then((snapshot) => {
      if (snapshot) {
        applySnapshot(snapshot);
        setView("dashboard");
      }
    });
  }, [applySnapshot]);

  const handleAuth = useCallback(
    async (input: { mode: "login" | "register"; email: string; password: string; username?: string }) => {
      try {
        setAuthError(null);
        setAuthNotice(null);
        if (input.mode === "register") {
          const result = await backend.register({ email: input.email, password: input.password, username: input.username ?? "" });
          setPendingVerificationEmail(result.email);
          setAuthMode("login");
          setAuthNotice(
            result.devVerificationUrl
              ? `Account created. Dev verification link: ${result.devVerificationUrl}`
              : "Account created. Check your email and confirm it before signing in."
          );
          return;
        }
        const snapshot = await backend.login({ email: input.email, password: input.password });
        applySnapshot(snapshot);
        setView("dashboard");
      } catch (error) {
        setAuthError(error instanceof Error ? error.message : "Authentication failed.");
      }
    },
    [applySnapshot]
  );

  const handleResendVerification = useCallback(async (email: string) => {
    try {
      setAuthError(null);
      await backend.resendVerificationEmail(email);
      setPendingVerificationEmail(email);
      setAuthNotice("Verification email sent. Check your inbox and spam folder.");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Verification email could not be sent.");
    }
  }, []);

  const handleSocialAuth = useCallback(
    async (provider: "google" | "apple") => {
      const snapshot = await backend.socialLogin(provider);
      applySnapshot(snapshot);
      setView("dashboard");
    },
    [applySnapshot]
  );

  const handleBackendError = useCallback((error: unknown) => {
    setAppError(error instanceof Error ? error.message : "The latest change could not be saved.");
    if (import.meta.env.DEV) {
      console.warn(error);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
    backend.updateProfile(updates).then(setProfile).catch(handleBackendError);
  }, [handleBackendError]);

  const addLink = useCallback((link: Omit<LinkItem, 'id'>) => {
    backend.addLink(link).then((created) => setLinks(prev => [...prev, created])).catch(handleBackendError);
  }, [handleBackendError]);

  const updateLink = useCallback((id: string, updates: Partial<LinkItem>) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    backend.updateLink(id, updates).then(setLinks).catch(handleBackendError);
  }, [handleBackendError]);

  const removeLink = useCallback((id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id));
    backend.removeLink(id).then(setLinks).catch(handleBackendError);
  }, [handleBackendError]);

  const reorderLinks = useCallback((from: number, to: number) => {
    setLinks(prev => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
    backend.reorderLinks(from, to).then(setLinks).catch(handleBackendError);
  }, [handleBackendError]);

  const updateTheme = useCallback((updates: Partial<ProfileTheme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
    backend.updateTheme(updates).then(setTheme).catch(handleBackendError);
  }, [handleBackendError]);

  const addWidget = useCallback((w: Omit<WidgetItem, 'id'>) => {
    backend.addWidget(w).then((created) => setWidgets(prev => [...prev, created])).catch(handleBackendError);
  }, [handleBackendError]);

  const updateWidget = useCallback((id: string, updates: Partial<WidgetItem>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    backend.updateWidget(id, updates).then(setWidgets).catch(handleBackendError);
  }, [handleBackendError]);

  const removeWidget = useCallback((id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
    backend.removeWidget(id).then(setWidgets).catch(handleBackendError);
  }, [handleBackendError]);

  const handleLogout = useCallback(async () => {
    await backend.logout();
    setView("landing");
  }, []);

  return (
    <div className="size-full overflow-hidden">
      {appError && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-4 py-3 text-white shadow-lg"
          style={{ background: "rgba(127,29,29,0.95)", borderColor: "rgba(248,113,113,0.45)", fontSize: "13px" }}
        >
          <span>{appError}</span>
          <button onClick={() => setAppError(null)} className="ml-4 text-white/70 hover:text-white">
            Dismiss
          </button>
        </div>
      )}
      <Suspense fallback={<AppLoading />}>
        {view === 'landing' && (
          <LandingPage
            onGetStarted={() => { setAuthMode('register'); setView('auth'); }}
            onLogin={() => { setAuthMode('login'); setView('auth'); }}
          />
        )}
        {view === 'auth' && (
          <AuthPage
            mode={authMode}
            onModeChange={setAuthMode}
            error={authError}
            notice={authNotice}
            pendingVerificationEmail={pendingVerificationEmail}
            onAuth={handleAuth}
            onResendVerification={handleResendVerification}
            onSocialAuth={handleSocialAuth}
            onBack={() => setView('landing')}
          />
        )}
        {view === 'dashboard' && (
          <Dashboard
            profile={profile}
            links={links}
            theme={theme}
            widgets={widgets}
            onUpdateProfile={updateProfile}
            onAddLink={addLink}
            onUpdateLink={updateLink}
            onRemoveLink={removeLink}
            onReorderLinks={reorderLinks}
            onUpdateTheme={updateTheme}
            onAddWidget={addWidget}
            onUpdateWidget={updateWidget}
            onRemoveWidget={removeWidget}
            onViewProfile={() => setView('profile')}
            onLogout={handleLogout}
          />
        )}
        {view === 'profile' && (
          <PublicProfile
            profile={profile}
            links={links}
            theme={theme}
            widgets={widgets}
            onBack={() => setView('dashboard')}
            isPreview={false}
          />
        )}
        {view === 'public' && publicProfile && (
          <PublicProfile
            profile={publicProfile.profile}
            links={publicProfile.links}
            theme={publicProfile.theme}
            widgets={publicProfile.widgets}
            isPreview={false}
          />
        )}
      </Suspense>
    </div>
  );
}
