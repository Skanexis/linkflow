import type { LinkItem, ProfileTheme, UserProfile, WidgetItem } from "./App";

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  isAdmin?: boolean;
}

export interface AppSnapshot {
  user: AuthUser;
  profile: UserProfile;
  links: LinkItem[];
  theme: ProfileTheme;
  widgets: WidgetItem[];
}

export interface EmailVerificationRequired {
  requiresEmailVerification: true;
  email: string;
  devVerificationUrl?: string;
}

export interface PublicProfileSnapshot {
  profile: UserProfile;
  links: LinkItem[];
  theme: ProfileTheme;
  widgets: WidgetItem[];
}

export interface AnalyticsSummary {
  dailyData: { date: string; clicks: number }[];
  linkClickData: { id: string; name: string; clicks: number }[];
  countryData: { country: string; visits: number }[];
}

export interface AdminUserRow {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string | null;
  emailVerifiedAt: string | null;
  isEmailVerified: boolean;
  isAdmin: boolean;
  authProviders: string[];
  linksCount: number;
  visibleLinksCount: number;
  widgetsCount: number;
  visibleWidgetsCount: number;
  totalClicks: number;
  pendingVerification: {
    tokens: number;
    activeTokens: number;
    expiresAt: string | null;
  } | null;
}

export interface AdminUsersResponse {
  summary: {
    totalUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
    adminUsers: number;
    oauthUsers: number;
    totalLinks: number;
    totalClicks: number;
  };
  users: AdminUserRow[];
}

interface AnalyticsEvent {
  id: string;
  linkId: string;
  createdAt: string;
  country: string;
}

interface StoredUser extends AuthUser {
  password: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  oauthProviders?: Record<string, string>;
}

interface StoredState {
  users: StoredUser[];
  currentUserId: string | null;
  profiles: Record<string, UserProfile>;
  links: Record<string, LinkItem[]>;
  themes: Record<string, ProfileTheme>;
  widgets: Record<string, WidgetItem[]>;
  analytics: Record<string, Record<string, number>>;
  analyticsEvents?: Record<string, AnalyticsEvent[]>;
  emailVerificationTokens?: Record<string, { userId: string; expiresAt: string; createdAt: string }>;
}

const STORAGE_KEY = "linkflow.backend.v1";
const API_TOKEN_KEY = "linkflow.api.token";
const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
const API_BASE_URL = configuredApiBaseUrl || (import.meta.env.PROD ? "/api" : "");
const configuredAdminEmails = new Set(
  String(import.meta.env.VITE_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

const defaultProfile: UserProfile = {
  displayName: "New Creator",
  username: "creator",
  bio: "",
  avatarColor: "#7c3aed",
  initials: "LC",
};

const defaultLinks: LinkItem[] = [
  { id: "1", title: "My Portfolio", url: "https://portfolio.example.com", visible: true, platform: "website", buttonStyle: "pill", hoverEffect: "glow" },
  { id: "2", title: "YouTube Channel", url: "https://youtube.com", visible: true, platform: "youtube", buttonStyle: "pill", hoverEffect: "bounce" },
  { id: "3", title: "Instagram", url: "https://instagram.com", visible: true, platform: "instagram", buttonStyle: "pill", hoverEffect: "glow" },
  { id: "4", title: "GitHub", url: "https://github.com", visible: true, platform: "github", buttonStyle: "pill", hoverEffect: "expand" },
  { id: "5", title: "Spotify Playlist", url: "https://spotify.com", visible: false, platform: "spotify", buttonStyle: "pill", hoverEffect: "none" },
  { id: "6", title: "Buy Me a Coffee", url: "https://buymeacoffee.com", visible: true, platform: "coffee", buttonStyle: "pill", hoverEffect: "glow" },
];

const defaultTheme: ProfileTheme = {
  backgroundType: "gradient",
  bgColor1: "#0f0c29",
  bgColor2: "#302b63",
  buttonStyle: "pill",
  hoverEffect: "glow",
  layoutMode: "vertical",
  fontFamily: "Inter",
  primaryColor: "#a855f7",
  textColor: "#ffffff",
  backgroundPattern: "grid",
  backgroundOverlay: 45,
  profileStyle: "halo",
  widgetStyle: "glass",
  contentWidth: "comfortable",
  animationPack: "smooth",
  iconStyle: "brand",
};

const defaultWidgets: WidgetItem[] = [
  { id: "w1", type: "music", title: "Now Playing", visible: true, config: { trackId: "blinding-lights", song: "Blinding Lights", artist: "The Weeknd", spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", color: "#1DB954", bpm: 171, bass: 82, lead: 246 } },
  { id: "w2", type: "countdown", title: "Launch Countdown", visible: false, config: { targetDate: "2026-12-31", label: "New Year 2027" } },
  { id: "w3", type: "product", title: "Product Card", visible: true, config: { name: "Digital Starter Kit", price: "$29", description: "Templates, assets, and resources in one bundle.", buttonLabel: "View product", url: "https://example.com/product" } },
  { id: "w4", type: "map", title: "Map Location", visible: false, config: { place: "Studio HQ", address: "123 Creator Ave, Los Angeles", url: "https://maps.google.com" } },
  { id: "w5", type: "chat", title: "Chat Bubble", visible: true, config: { headline: "Have a question?", message: "Send me a quick message and I will get back to you.", buttonLabel: "Start chat", url: "mailto:hello@example.com" } },
];

function delay<T>(value: T, ms = 150): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), ms));
}

function hasApiBackend() {
  return API_BASE_URL.trim().length > 0;
}

function getToken() {
  return window.localStorage.getItem(API_TOKEN_KEY);
}

function setToken(token: string | null) {
  if (token) {
    window.localStorage.setItem(API_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(API_TOKEN_KEY);
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed.");
  }

  return payload as T;
}

async function apiAuth(path: string, body: Record<string, unknown>) {
  const payload = await apiRequest<{ token: string; snapshot: AppSnapshot }>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
  setToken(payload.token);
  return payload.snapshot;
}

function id(prefix = "id") {
  const value = window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${value}`;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function initialState(): StoredState {
  const demoUser: StoredUser = {
    id: "demo_user",
    email: "demo@linkflow.local",
    username: defaultProfile.username,
    password: "password",
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  return {
    users: [demoUser],
    currentUserId: null,
    profiles: { [demoUser.id]: clone(defaultProfile) },
    links: { [demoUser.id]: clone(defaultLinks) },
    themes: { [demoUser.id]: clone(defaultTheme) },
    widgets: { [demoUser.id]: clone(defaultWidgets) },
    analytics: { [demoUser.id]: {} },
    analyticsEvents: { [demoUser.id]: [] },
    emailVerificationTokens: {},
  };
}

function readState(): StoredState {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialState();

  try {
    return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    return initialState();
  }
}

function writeState(state: StoredState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getAnalyticsEvents(state: StoredState, userId: string) {
  state.analyticsEvents ??= {};
  state.analyticsEvents[userId] ??= [];
  return state.analyticsEvents[userId];
}

function getEmailVerificationTokens(state: StoredState) {
  state.emailVerificationTokens ??= {};
  return state.emailVerificationTokens;
}

function makeVerificationToken() {
  return window.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function isEmailVerified(user: StoredUser) {
  return Boolean(user.emailVerifiedAt) || !Object.prototype.hasOwnProperty.call(user, "emailVerifiedAt");
}

function isAdminUser(user: StoredUser | AuthUser) {
  if (!import.meta.env.PROD && user.email === "demo@linkflow.local") return true;
  return configuredAdminEmails.has(user.email.toLowerCase());
}

function requireCurrentUser(state: StoredState) {
  const user = state.users.find((u) => u.id === state.currentUserId);
  if (!user) throw new Error("You must be signed in.");
  return user;
}

function snapshotForUser(state: StoredState, user: AuthUser): AppSnapshot {
  return {
    user: { id: user.id, email: user.email, username: user.username, isAdmin: isAdminUser(user) },
    profile: clone(state.profiles[user.id] ?? defaultProfile),
    links: clone(state.links[user.id] ?? defaultLinks),
    theme: clone(state.themes[user.id] ?? defaultTheme),
    widgets: clone(state.widgets[user.id] ?? defaultWidgets),
  };
}

function publicSnapshotForUser(state: StoredState, user: AuthUser): PublicProfileSnapshot {
  return {
    profile: clone(state.profiles[user.id] ?? defaultProfile),
    links: clone((state.links[user.id] ?? []).filter((link) => link.visible)),
    theme: clone(state.themes[user.id] ?? defaultTheme),
    widgets: clone((state.widgets[user.id] ?? []).filter((widget) => widget.visible)),
  };
}

function initialsFromUsername(username: string) {
  return username.slice(0, 2).toUpperCase();
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function detectCountry() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return locale.match(/-([A-Z]{2})$/)?.[1] ?? "Unknown";
}

function clickCountForUser(state: StoredState, userId: string) {
  const storedClicks = Object.values(state.analytics[userId] ?? {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const eventClicks = getAnalyticsEvents(state, userId).length;
  return storedClicks + eventClicks;
}

function pendingVerificationForUser(state: StoredState, userId: string) {
  const records = Object.values(getEmailVerificationTokens(state)).filter((record) => record.userId === userId);
  if (records.length === 0) return null;
  const activeRecords = records.filter((record) => new Date(record.expiresAt).getTime() > Date.now());
  const expiresAt = activeRecords
    .map((record) => record.expiresAt)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] ?? null;
  return { tokens: records.length, activeTokens: activeRecords.length, expiresAt };
}

function adminUsersFor(state: StoredState): AdminUsersResponse {
  const users = state.users
    .map((user) => {
      const links = state.links[user.id] ?? [];
      const widgets = state.widgets[user.id] ?? [];
      const providers = Object.keys(user.oauthProviders ?? {});
      const verified = isEmailVerified(user);

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: state.profiles[user.id]?.displayName ?? user.username,
        createdAt: user.createdAt ?? null,
        emailVerifiedAt: user.emailVerifiedAt ?? null,
        isEmailVerified: verified,
        isAdmin: isAdminUser(user),
        authProviders: providers.length > 0 ? providers : ["password"],
        linksCount: links.length,
        visibleLinksCount: links.filter((link) => link.visible).length,
        widgetsCount: widgets.length,
        visibleWidgetsCount: widgets.filter((widget) => widget.visible).length,
        totalClicks: clickCountForUser(state, user.id),
        pendingVerification: verified ? null : pendingVerificationForUser(state, user.id),
      };
    })
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  return {
    summary: {
      totalUsers: users.length,
      verifiedUsers: users.filter((user) => user.isEmailVerified).length,
      unverifiedUsers: users.filter((user) => !user.isEmailVerified).length,
      adminUsers: users.filter((user) => user.isAdmin).length,
      oauthUsers: users.filter((user) => user.authProviders.some((provider) => provider !== "password")).length,
      totalLinks: users.reduce((sum, user) => sum + user.linksCount, 0),
      totalClicks: users.reduce((sum, user) => sum + user.totalClicks, 0),
    },
    users,
  };
}

function assertUrl(value: string, field = "URL", protocols = ["http:", "https:", "mailto:", "tel:", "sgnl:", "threema:", "potato:", "viber:", "luffa:"]) {
  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol)) throw new Error();
  } catch {
    throw new Error(`${field} must be a valid ${protocols.map((protocol) => protocol.replace(":", "")).join("/")} URL.`);
  }
}

function validateWidgetConfig(config: Record<string, any>) {
  // Widget fields autosave on each keystroke, so URL values can be temporary drafts.
  // The public renderer sanitizes widget URLs before using them.
  void config;
}

export function detectPlatform(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("instagram.com")) return "instagram";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("threads.net")) return "threads";
  if (u.includes("github.com")) return "github";
  if (u.includes("gitlab.com")) return "gitlab";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("spotify.com")) return "spotify";
  if (u.includes("soundcloud.com")) return "soundcloud";
  if (u.includes("twitch.tv")) return "twitch";
  if (u.includes("discord.gg") || u.includes("discord.com")) return "discord";
  if (u.includes("telegram.me") || u.includes("t.me") || u.includes("telegram.dog")) return "telegram";
  if (u.includes("signal.me") || u.includes("signal.group") || u.startsWith("sgnl://")) return "signal";
  if (u.includes("threema.id") || u.includes("threema.ch") || u.startsWith("threema://")) return "threema";
  if (u.includes("luffa.im") || u.startsWith("luffa://")) return "luffa";
  if (u.includes("viber.com") || u.includes("vb.me") || u.startsWith("viber://")) return "viber";
  if (u.includes("potato.im") || u.includes("pt.im") || u.startsWith("potato://")) return "potato";
  if (u.includes("wa.me") || u.includes("whatsapp.com")) return "whatsapp";
  if (u.includes("medium.com") || u.includes("substack.com")) return "writing";
  if (u.includes("behance.net") || u.includes("dribbble.com")) return "design";
  if (u.includes("figma.com")) return "figma";
  if (u.includes("cal.com") || u.includes("calendly.com")) return "calendar";
  if (u.includes("notion.site") || u.includes("notion.so")) return "notion";
  if (u.includes("patreon.com")) return "patreon";
  if (u.includes("gumroad.com") || u.includes("lemonsqueezy.com") || u.includes("shopify.com")) return "shop";
  if (u.includes("buymeacoffee.com") || u.includes("ko-fi.com")) return "coffee";
  if (u.startsWith("mailto:")) return "email";
  if (u.startsWith("tel:")) return "phone";
  if (/https?:\/\/.+/.test(u)) return "website";
  return "generic";
}

export async function getSession() {
  if (hasApiBackend()) {
    if (!getToken()) return null;
    try {
      const payload = await apiRequest<{ snapshot: AppSnapshot }>("/auth/session");
      return payload.snapshot;
    } catch {
      setToken(null);
      return null;
    }
  }

  const state = readState();
  const user = state.users.find((u) => u.id === state.currentUserId);
  return delay(user ? snapshotForUser(state, user) : null);
}

export async function register(input: { email: string; password: string; username: string }) {
  if (hasApiBackend()) {
    return apiRequest<EmailVerificationRequired>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  const state = readState();
  const username = input.username.trim().toLowerCase();
  const email = input.email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (!/^[a-z0-9_.-]{3,30}$/.test(username)) throw new Error("Username must be 3-30 URL-safe characters.");
  if (input.password.length < 8) throw new Error("Password must be at least 8 characters.");
  if (state.users.some((u) => u.email === email)) throw new Error("Email is already registered.");
  if (state.users.some((u) => u.username === username)) throw new Error("Username is already taken.");

  const user: StoredUser = { id: id("user"), email, username, password: input.password, createdAt: new Date().toISOString() };
  state.users.push(user);
  user.emailVerifiedAt = null;
  state.profiles[user.id] = { ...clone(defaultProfile), displayName: username, username, initials: initialsFromUsername(username) };
  state.links[user.id] = [];
  state.themes[user.id] = clone(defaultTheme);
  state.widgets[user.id] = [];
  state.analytics[user.id] = {};
  getAnalyticsEvents(state, user.id);
  state.currentUserId = null;
  const token = makeVerificationToken();
  getEmailVerificationTokens(state)[token] = {
    userId: user.id,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
  writeState(state);
  return delay({ requiresEmailVerification: true, email, devVerificationUrl: `${window.location.origin}/?email_verify_token=${encodeURIComponent(token)}` });
}

export async function login(input: { email: string; password: string }) {
  if (hasApiBackend()) {
    return apiAuth("/auth/login", input);
  }

  const state = readState();
  const user = state.users.find((u) => u.email === input.email.trim().toLowerCase() && u.password === input.password);
  if (!user) throw new Error("Invalid email or password.");
  if (!isEmailVerified(user)) throw new Error("Confirm your email before signing in. Check your inbox for the verification link.");
  state.currentUserId = user.id;
  writeState(state);
  return delay(snapshotForUser(state, user));
}

export async function socialLogin(provider: "google") {
  if (hasApiBackend()) {
    window.location.assign(`${API_BASE_URL}/auth/${provider}/start`);
    return new Promise<AppSnapshot>(() => undefined);
  }

  if (import.meta.env.PROD) {
    throw new Error("Google OAuth requires the production API.");
  }

  const state = readState();
  const email = `${provider}@linkflow.local`;
  let user = state.users.find((u) => u.email === email);

  if (!user) {
    user = { id: id("user"), email, username: `${provider}_creator`, password: id("oauth"), emailVerifiedAt: new Date().toISOString(), createdAt: new Date().toISOString(), oauthProviders: { [provider]: "local" } };
    state.users.push(user);
    state.profiles[user.id] = { ...clone(defaultProfile), username: user.username };
    state.links[user.id] = clone(defaultLinks);
    state.themes[user.id] = clone(defaultTheme);
    state.widgets[user.id] = clone(defaultWidgets);
    state.analytics[user.id] = {};
    getAnalyticsEvents(state, user.id);
  }

  state.currentUserId = user.id;
  writeState(state);
  return delay(snapshotForUser(state, user));
}

export async function completeOAuthLogin(token: string) {
  if (!hasApiBackend()) throw new Error("OAuth requires the API backend.");
  setToken(token);
  try {
    const payload = await apiRequest<{ snapshot: AppSnapshot }>("/auth/session");
    return payload.snapshot;
  } catch (error) {
    setToken(null);
    throw error;
  }
}

export async function resendVerificationEmail(email: string) {
  if (hasApiBackend()) {
    await apiRequest<{ ok: boolean }>("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return true;
  }

  const state = readState();
  const user = state.users.find((u) => u.email === email.trim().toLowerCase());
  if (user && !isEmailVerified(user)) {
    const token = makeVerificationToken();
    getEmailVerificationTokens(state)[token] = {
      userId: user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    writeState(state);
    console.info(`[email verification] ${email}: ${window.location.origin}/?email_verify_token=${encodeURIComponent(token)}`);
  }
  return delay(true);
}

export async function verifyEmail(token: string) {
  if (hasApiBackend()) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, { redirect: "manual" });
    return response.status >= 200 && response.status < 400;
  }

  const state = readState();
  const tokens = getEmailVerificationTokens(state);
  const record = tokens[token];
  if (!record || new Date(record.expiresAt).getTime() < Date.now()) return delay(false);
  const user = state.users.find((u) => u.id === record.userId);
  if (!user) return delay(false);
  user.emailVerifiedAt = new Date().toISOString();
  for (const [storedToken, storedRecord] of Object.entries(tokens)) {
    if (storedRecord.userId === user.id) delete tokens[storedToken];
  }
  writeState(state);
  return delay(true);
}

export async function logout() {
  if (hasApiBackend()) {
    setToken(null);
    return true;
  }

  const state = readState();
  state.currentUserId = null;
  writeState(state);
  return delay(true);
}

export async function getPublicProfile(username: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ profile: PublicProfileSnapshot }>(`/public/${encodeURIComponent(username)}`);
    return payload.profile;
  }

  const state = readState();
  const user = state.users.find((u) => u.username === username.toLowerCase());
  if (!user) throw new Error("Profile not found.");
  return delay(publicSnapshotForUser(state, user));
}

export async function getAdminUsers(): Promise<AdminUsersResponse> {
  if (hasApiBackend()) {
    return apiRequest<AdminUsersResponse>("/admin/users");
  }

  const state = readState();
  const user = requireCurrentUser(state);
  if (!isAdminUser(user)) throw new Error("Admin access is required.");
  return delay(adminUsersFor(state));
}

export async function updateProfile(updates: Partial<UserProfile>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ profile: UserProfile }>("/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.profile;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.profiles[user.id] = { ...state.profiles[user.id], ...updates };
  if (updates.username) user.username = updates.username;
  writeState(state);
  return delay(clone(state.profiles[user.id]));
}

export async function addLink(link: Omit<LinkItem, "id">) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ link: LinkItem }>("/links", {
      method: "POST",
      body: JSON.stringify(link),
    });
    return payload.link;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  assertUrl(link.url);
  const item = { ...link, platform: link.platform || detectPlatform(link.url), id: id("link") };
  state.links[user.id] = [...(state.links[user.id] ?? []), item];
  writeState(state);
  return delay(clone(item));
}

export async function updateLink(linkId: string, updates: Partial<LinkItem>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ links: LinkItem[] }>(`/links/${encodeURIComponent(linkId)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.links;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  if (updates.url) assertUrl(updates.url);
  state.links[user.id] = (state.links[user.id] ?? []).map((link) =>
    link.id === linkId ? { ...link, ...updates, platform: updates.url ? detectPlatform(updates.url) : link.platform } : link
  );
  writeState(state);
  return delay(clone(state.links[user.id]));
}

export async function removeLink(linkId: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ links: LinkItem[] }>(`/links/${encodeURIComponent(linkId)}`, {
      method: "DELETE",
    });
    return payload.links;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.links[user.id] = (state.links[user.id] ?? []).filter((link) => link.id !== linkId);
  writeState(state);
  return delay(clone(state.links[user.id]));
}

export async function reorderLinks(from: number, to: number) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ links: LinkItem[] }>("/links/reorder", {
      method: "POST",
      body: JSON.stringify({ from, to }),
    });
    return payload.links;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  const links = [...(state.links[user.id] ?? [])];
  const [item] = links.splice(from, 1);
  if (item) links.splice(to, 0, item);
  state.links[user.id] = links;
  writeState(state);
  return delay(clone(links));
}

export async function updateTheme(updates: Partial<ProfileTheme>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ theme: ProfileTheme }>("/theme", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.theme;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.themes[user.id] = { ...state.themes[user.id], ...updates };
  writeState(state);
  return delay(clone(state.themes[user.id]));
}

export async function addWidget(widget: Omit<WidgetItem, "id">) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widget: WidgetItem }>("/widgets", {
      method: "POST",
      body: JSON.stringify(widget),
    });
    return payload.widget;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  validateWidgetConfig(widget.config);
  const item = { ...widget, id: id("widget") };
  state.widgets[user.id] = [...(state.widgets[user.id] ?? []), item];
  writeState(state);
  return delay(clone(item));
}

export async function updateWidget(widgetId: string, updates: Partial<WidgetItem>) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widgets: WidgetItem[] }>(`/widgets/${encodeURIComponent(widgetId)}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    return payload.widgets;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  if (updates.config) validateWidgetConfig(updates.config);
  state.widgets[user.id] = (state.widgets[user.id] ?? []).map((widget) =>
    widget.id === widgetId ? { ...widget, ...updates } : widget
  );
  writeState(state);
  return delay(clone(state.widgets[user.id]));
}

export async function removeWidget(widgetId: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widgets: WidgetItem[] }>(`/widgets/${encodeURIComponent(widgetId)}`, {
      method: "DELETE",
    });
    return payload.widgets;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  state.widgets[user.id] = (state.widgets[user.id] ?? []).filter((widget) => widget.id !== widgetId);
  writeState(state);
  return delay(clone(state.widgets[user.id]));
}

export async function trackClick(linkId: string) {
  if (hasApiBackend()) {
    await apiRequest<{ ok: boolean }>("/analytics/click", {
      method: "POST",
      body: JSON.stringify({ linkId }),
    });
    return true;
  }

  const state = readState();
  const ownerId = Object.entries(state.links).find(([, links]) => links.some((link) => link.id === linkId))?.[0];
  if (!ownerId) throw new Error("Link not found.");
  state.analytics[ownerId] ??= {};
  const events = getAnalyticsEvents(state, ownerId);
  events.push({
    id: id("click"),
    linkId,
    createdAt: new Date().toISOString(),
    country: detectCountry(),
  });
  state.analyticsEvents![ownerId] = events.slice(-5000);
  writeState(state);
  return delay(true, 30);
}

export async function voteWidget(widgetId: string, optionIndex: number) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widget: WidgetItem }>(`/widgets/${encodeURIComponent(widgetId)}/vote`, {
      method: "POST",
      body: JSON.stringify({ optionIndex }),
    });
    return payload.widget;
  }

  const state = readState();
  let updated: WidgetItem | null = null;
  for (const [userId, widgets] of Object.entries(state.widgets)) {
    state.widgets[userId] = widgets.map((widget) => {
      if (widget.id !== widgetId) return widget;
      const votes = [...(widget.config.votes ?? [0, 0])];
      votes[optionIndex] = (Number(votes[optionIndex]) || 0) + 1;
      updated = { ...widget, config: { ...widget.config, votes } };
      return updated;
    });
  }
  writeState(state);
  if (!updated) throw new Error("Widget not found.");
  return delay(clone(updated));
}

export async function subscribeWidget(widgetId: string, email: string) {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ widget: WidgetItem }>(`/widgets/${encodeURIComponent(widgetId)}/subscribe`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    return payload.widget;
  }

  const state = readState();
  let updated: WidgetItem | null = null;
  for (const [userId, widgets] of Object.entries(state.widgets)) {
    state.widgets[userId] = widgets.map((widget) => {
      if (widget.id !== widgetId) return widget;
      const subscribers = Array.from(new Set([...(widget.config.subscribers ?? []), email.toLowerCase()]));
      updated = { ...widget, config: { ...widget.config, subscribers, count: subscribers.length.toLocaleString() } };
      return updated;
    });
  }
  writeState(state);
  if (!updated) throw new Error("Widget not found.");
  return delay(clone(updated));
}

export async function getAnalytics(): Promise<AnalyticsSummary> {
  if (hasApiBackend()) {
    const payload = await apiRequest<{ analytics: AnalyticsSummary }>("/analytics");
    return payload.analytics;
  }

  const state = readState();
  const user = requireCurrentUser(state);
  const links = state.links[user.id] ?? [];
  const storedClicks = state.analytics[user.id] ?? {};
  const events = getAnalyticsEvents(state, user.id);
  const eventClicksByLink = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.linkId] = (acc[event.linkId] ?? 0) + 1;
    return acc;
  }, {});

  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const key = dateKey(d);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      clicks: events.filter((event) => event.createdAt.slice(0, 10) === key).length,
    };
  });

  const linkClickData = links
    .map((link) => ({
      id: link.id,
      name: link.title.length > 36 ? `${link.title.slice(0, 36)}...` : link.title,
      clicks: (storedClicks[link.id] ?? 0) + (eventClicksByLink[link.id] ?? 0),
    }))
    .sort((a, b) => b.clicks - a.clicks);

  const countryCounts = events.reduce<Record<string, number>>((acc, event) => {
    const country = event.country || "Unknown";
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});

  return delay({
    dailyData,
    linkClickData,
    countryData: Object.entries(countryCounts)
      .map(([country, visits]) => ({ country, visits }))
      .sort((a, b) => b.visits - a.visits),
  });
}
