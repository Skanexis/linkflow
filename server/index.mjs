import "dotenv/config";
import compression from "compression";
import cors from "cors";
import express from "express";
import geoip from "geoip-lite";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { SignJWT, jwtVerify } from "jose";
import nodemailer from "nodemailer";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(rootDir, "data");
const dbFile = path.join(dataDir, "linkflow.json");
const port = Number(process.env.PORT ?? 8787);
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-only-change-this-secret-before-production");
const isProduction = process.env.NODE_ENV === "production";
const appUrl = (process.env.APP_URL ?? `http://127.0.0.1:${port}`).replace(/\/+$/, "");
const publicApiUrl = (process.env.API_PUBLIC_URL ?? appUrl).replace(/\/+$/, "");
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
const googleRedirectUri = (process.env.GOOGLE_REDIRECT_URI ?? `${publicApiUrl}/api/oauth/google/callback`).trim();
const googleOAuthEnabled = process.env.GOOGLE_OAUTH_ENABLED === "true" || Boolean(googleClientId && googleClientSecret);
const mailFromName = process.env.MAIL_FROM_NAME ?? "LinkFlow";
const mailFrom = process.env.MAIL_FROM ?? process.env.SMTP_USER ?? "no-reply@linkflow.local";
const verificationTokenTtlMs = Number(process.env.EMAIL_VERIFICATION_TTL_HOURS ?? 24) * 60 * 60 * 1000;
const oauthStateTtlMs = 10 * 60 * 1000;

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET === "dev-only-change-this-secret-before-production")) {
  throw new Error("JWT_SECRET must be changed before running in production.");
}

if (googleOAuthEnabled && (!googleClientId || !googleClientSecret)) {
  throw new Error("Google OAuth is enabled, but GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing.");
}

const buttonStyles = ["rounded", "pill", "glass", "3d", "neon", "soft", "brutal", "underline"];
const hoverEffects = ["glow", "bounce", "expand", "none", "tilt", "slide"];
const widgetTypes = ["music", "countdown", "poll", "email", "video", "product", "map", "chat"];

const defaultProfile = {
  displayName: "New Creator",
  username: "creator",
  bio: "",
  avatarColor: "#7c3aed",
  initials: "LC",
};

const defaultLinks = [
  { id: "1", title: "My Portfolio", url: "https://portfolio.example.com", visible: true, platform: "website", buttonStyle: "pill", hoverEffect: "glow" },
  { id: "2", title: "YouTube Channel", url: "https://youtube.com", visible: true, platform: "youtube", buttonStyle: "pill", hoverEffect: "bounce" },
  { id: "3", title: "Instagram", url: "https://instagram.com", visible: true, platform: "instagram", buttonStyle: "pill", hoverEffect: "glow" },
  { id: "4", title: "GitHub", url: "https://github.com", visible: true, platform: "github", buttonStyle: "pill", hoverEffect: "expand" },
  { id: "5", title: "Spotify Playlist", url: "https://spotify.com", visible: false, platform: "spotify", buttonStyle: "pill", hoverEffect: "none" },
  { id: "6", title: "Buy Me a Coffee", url: "https://buymeacoffee.com", visible: true, platform: "coffee", buttonStyle: "pill", hoverEffect: "glow" },
];

const defaultTheme = {
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

const defaultWidgets = [
  { id: "w1", type: "music", title: "Now Playing", visible: true, config: { trackId: "blinding-lights", song: "Blinding Lights", artist: "The Weeknd", spotifyUrl: "https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b", color: "#1DB954", bpm: 171, bass: 82, lead: 246 } },
  { id: "w2", type: "countdown", title: "Launch Countdown", visible: false, config: { targetDate: "2026-12-31", label: "New Year 2027" } },
  { id: "w3", type: "product", title: "Product Card", visible: true, config: { name: "Digital Starter Kit", price: "$29", description: "Templates, assets, and resources in one bundle.", buttonLabel: "View product", url: "https://example.com/product" } },
  { id: "w4", type: "map", title: "Map Location", visible: false, config: { place: "Studio HQ", address: "123 Creator Ave, Los Angeles", url: "https://maps.google.com" } },
  { id: "w5", type: "chat", title: "Chat Bubble", visible: true, config: { headline: "Have a question?", message: "Send me a quick message and I will get back to you.", buttonLabel: "Start chat", url: "mailto:hello@example.com" } },
];

const smtpConfig = process.env.SMTP_HOST
  ? {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER || process.env.SMTP_PASS
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    }
  : null;
const mailTransporter = smtpConfig ? nodemailer.createTransport(smtpConfig) : null;

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/).optional(),
  bio: z.string().max(180).optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  initials: z.string().trim().min(1).max(3).optional(),
});

const allowedLinkProtocols = new Set(["http:", "https:", "mailto:", "tel:", "sgnl:", "threema:", "potato:", "viber:", "luffa:"]);
const urlSchema = z.string().trim().refine((value) => {
  try {
    return allowedLinkProtocols.has(new URL(value).protocol);
  } catch {
    return false;
  }
}, "Invalid URL");
const linkSchema = z.object({
  title: z.string().trim().min(1).max(90),
  url: urlSchema,
  visible: z.boolean(),
  platform: z.string().trim().min(1).max(40),
  buttonStyle: z.enum(buttonStyles),
  hoverEffect: z.enum(hoverEffects),
  scheduleFrom: z.string().trim().optional().or(z.literal("")),
  scheduleTo: z.string().trim().optional().or(z.literal("")),
  deviceTarget: z.enum(["all", "mobile", "desktop"]).optional(),
});
const linkPatchSchema = linkSchema.partial();

const themeSchema = z.object({
  backgroundType: z.enum(["solid", "gradient", "animated", "image"]).optional(),
  bgColor1: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  bgColor2: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  buttonStyle: z.enum(buttonStyles).optional(),
  hoverEffect: z.enum(hoverEffects).optional(),
  layoutMode: z.enum(["vertical", "grid"]).optional(),
  fontFamily: z.string().trim().min(1).max(80).optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  textColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  backgroundImage: z.string().max(900000).optional().or(z.literal("")),
  backgroundPattern: z.enum(["none", "grid", "dots", "stars", "rays", "waves"]).optional(),
  backgroundOverlay: z.number().min(0).max(90).optional(),
  profileStyle: z.enum(["halo", "editorial", "terminal", "poster"]).optional(),
  widgetStyle: z.enum(["glass", "solid", "outline", "neon"]).optional(),
  contentWidth: z.enum(["compact", "comfortable", "wide"]).optional(),
  animationPack: z.enum(["smooth", "pop", "cinematic", "neon", "minimal", "beat", "waveform", "club"]).optional(),
  iconStyle: z.enum(["brand", "mono", "duotone", "boxed"]).optional(),
});

const widgetSchema = z.object({
  type: z.enum(widgetTypes),
  title: z.string().trim().min(1).max(90),
  visible: z.boolean(),
  config: z.record(z.any()),
});
const widgetPatchSchema = widgetSchema.partial();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

function makeEmailVerificationToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashToken(token) };
}

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

function isEmailVerified(user) {
  return Boolean(user.emailVerifiedAt) || !Object.prototype.hasOwnProperty.call(user, "emailVerifiedAt");
}

function initialsFromUsername(username) {
  return username.slice(0, 2).toUpperCase();
}

function initialsFromName(name, fallback) {
  const parts = String(name || fallback || "LinkFlow")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] ?? "LC").slice(0, 2)).toUpperCase();
}

function slugFromValue(value, fallback = "creator") {
  const slug = String(value || fallback)
    .toLowerCase()
    .replace(/@.*$/, "")
    .replace(/[^a-z0-9_.-]+/g, "-")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 24);
  return slug.length >= 3 ? slug : fallback;
}

function uniqueUsername(state, preferred) {
  const base = slugFromValue(preferred);
  let candidate = base;
  let suffix = 1;
  while (state.users.some((user) => user.username === candidate)) {
    candidate = `${base.slice(0, Math.max(3, 29 - String(suffix).length))}${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function profileForNewUser({ displayName, username }) {
  return {
    ...clone(defaultProfile),
    displayName: displayName || username,
    username,
    initials: initialsFromName(displayName, username),
  };
}

function detectPlatform(url) {
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

function validateWidgetConfig(config = {}) {
  // Widget config is autosaved while users type, so URL fields are allowed to be temporary drafts.
  // Public rendering sanitizes URLs before using them as href/src values.
  void config;
}

function createEmailVerificationRecord(state, userId) {
  const { token, tokenHash } = makeEmailVerificationToken();
  const now = new Date();
  state.emailVerificationTokens[tokenHash] = {
    userId,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + verificationTokenTtlMs).toISOString(),
  };
  return { token, verifyUrl: `${publicApiUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}` };
}

function cleanupVerificationTokensForUser(state, userId) {
  for (const [tokenHash, record] of Object.entries(state.emailVerificationTokens ?? {})) {
    if (record.userId === userId) delete state.emailVerificationTokens[tokenHash];
  }
}

function cleanupExpiredOAuthStates(state) {
  const now = Date.now();
  for (const [tokenHash, record] of Object.entries(state.oauthStates ?? {})) {
    if (new Date(record.expiresAt).getTime() <= now) delete state.oauthStates[tokenHash];
  }
}

function createOAuthStateRecord(state, provider) {
  cleanupExpiredOAuthStates(state);
  const token = randomBytes(32).toString("hex");
  state.oauthStates[hashToken(token)] = {
    provider,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + oauthStateTtlMs).toISOString(),
  };
  return token;
}

function consumeOAuthState(state, provider, token) {
  cleanupExpiredOAuthStates(state);
  const tokenHash = hashToken(token);
  const record = state.oauthStates[tokenHash];
  delete state.oauthStates[tokenHash];
  return Boolean(record && record.provider === provider && new Date(record.expiresAt).getTime() > Date.now());
}

async function sendVerificationEmail({ email, username, verifyUrl }) {
  const subject = "Confirm your LinkFlow email";
  const text = [
    `Hi ${username},`,
    "",
    "Confirm your email address to activate your LinkFlow account:",
    verifyUrl,
    "",
    "This link expires in 24 hours. If you did not create this account, ignore this email.",
  ].join("\n");
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111827;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:22px;margin:0 0 12px">Confirm your email</h1>
      <p>Hi ${escapeHtml(username)},</p>
      <p>Confirm your email address to activate your LinkFlow account.</p>
      <p style="margin:24px 0">
        <a href="${verifyUrl}" style="display:inline-block;background:#7c3aed;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">Confirm email</a>
      </p>
      <p style="font-size:13px;color:#6b7280">This link expires in 24 hours. If the button does not work, open this URL:<br>${verifyUrl}</p>
    </div>
  `;

  if (!mailTransporter) {
    if (isProduction) {
      throw Object.assign(new Error("Email delivery is not configured."), { status: 503, expose: true });
    }
    console.info(`[email verification] ${email}: ${verifyUrl}`);
    return;
  }

  try {
    await mailTransporter.sendMail({
      from: { name: mailFromName, address: mailFrom },
      to: email,
      subject,
      text,
      html,
      headers: {
        "List-Unsubscribe": `<mailto:${mailFrom}?subject=unsubscribe>`,
        "X-Entity-Ref-ID": randomUUID(),
      },
    });
  } catch (error) {
    console.error("Verification email delivery failed:", error);
    throw Object.assign(new Error("Verification email could not be sent. Try again later."), { status: 503, expose: true });
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  })[char]);
}

async function initialState() {
  if (isProduction) {
    return {
      users: [],
      profiles: {},
      links: {},
      themes: {},
      widgets: {},
      analytics: {},
      analyticsEvents: {},
      emailVerificationTokens: {},
      oauthStates: {},
    };
  }

  const demoUser = {
    id: "demo_user",
    email: "demo@linkflow.local",
    username: "demo",
    passwordHash: await bcrypt.hash("password", 12),
    emailVerifiedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  const demoProfile = {
    ...clone(defaultProfile),
    displayName: "Demo Creator",
    username: demoUser.username,
    bio: "A local demo profile for development.",
    initials: "DC",
  };
  return {
    users: [demoUser],
    profiles: { [demoUser.id]: demoProfile },
    links: { [demoUser.id]: clone(defaultLinks) },
    themes: { [demoUser.id]: clone(defaultTheme) },
    widgets: { [demoUser.id]: clone(defaultWidgets) },
    analytics: { [demoUser.id]: {} },
    analyticsEvents: { [demoUser.id]: [] },
    emailVerificationTokens: {},
    oauthStates: {},
  };
}

async function readState() {
  await mkdir(dataDir, { recursive: true });
  try {
    return normalizeState(JSON.parse(await readFile(dbFile, "utf8")));
  } catch {
    const state = await initialState();
    await writeState(state);
    return state;
  }
}

function normalizeState(state) {
  const normalized = {
    ...state,
    users: state.users ?? [],
    profiles: state.profiles ?? {},
    links: state.links ?? {},
    themes: state.themes ?? {},
    widgets: state.widgets ?? {},
    analytics: state.analytics ?? {},
    analyticsEvents: state.analyticsEvents ?? {},
    emailVerificationTokens: state.emailVerificationTokens ?? {},
    oauthStates: state.oauthStates ?? {},
  };

  if (isProduction && process.env.ALLOW_PRODUCTION_DEMO_USER !== "true") {
    const fakeEmails = new Set(["demo@linkflow.local", "google@linkflow.local"]);
    const fakeIds = new Set(
      normalized.users
        .filter((user) => user.id === "demo_user" || fakeEmails.has(user.email))
        .map((user) => user.id)
    );

    if (fakeIds.size > 0) {
      normalized.users = normalized.users.filter((user) => !fakeIds.has(user.id));
      for (const id of fakeIds) {
        delete normalized.profiles[id];
        delete normalized.links[id];
        delete normalized.themes[id];
        delete normalized.widgets[id];
        delete normalized.analytics[id];
        delete normalized.analyticsEvents[id];
        cleanupVerificationTokensForUser(normalized, id);
      }
    }
  }

  return normalized;
}

async function writeState(state) {
  await mkdir(dataDir, { recursive: true });
  const tmp = `${dbFile}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, dbFile);
}

async function mutateState(fn) {
  const state = await readState();
  const result = await fn(state);
  await writeState(state);
  return result;
}

function publicUser(user) {
  return { id: user.id, email: user.email, username: user.username };
}

function snapshotForUser(state, user) {
  return {
    user: publicUser(user),
    profile: clone(state.profiles[user.id] ?? defaultProfile),
    links: clone(state.links[user.id] ?? []),
    theme: clone(state.themes[user.id] ?? defaultTheme),
    widgets: clone(state.widgets[user.id] ?? []),
  };
}

function publicSnapshotForUser(state, user) {
  return {
    profile: clone(state.profiles[user.id] ?? defaultProfile),
    links: clone((state.links[user.id] ?? []).filter((link) => link.visible)),
    theme: clone(state.themes[user.id] ?? defaultTheme),
    widgets: clone((state.widgets[user.id] ?? []).filter((widget) => widget.visible)),
  };
}

async function signToken(user) {
  return new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(jwtSecret);
}

async function requireAuth(req, _res, next) {
  try {
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) throw Object.assign(new Error("Missing authorization token."), { status: 401 });
    const { payload } = await jwtVerify(token, jwtSecret);
    const state = await readState();
    const user = state.users.find((item) => item.id === payload.sub);
    if (!user) throw Object.assign(new Error("Session is no longer valid."), { status: 401 });
    req.auth = { state, user };
    next();
  } catch (error) {
    next(Object.assign(error, { status: error.status ?? 401 }));
  }
}

function parse(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid request.";
    throw Object.assign(new Error(message), { status: 400 });
  }
  return result.data;
}

function analyticsFor(state, user) {
  const links = state.links[user.id] ?? [];
  const storedClicks = state.analytics[user.id] ?? {};
  const events = state.analyticsEvents[user.id] ?? [];
  const linkTitleById = new Map(links.map((link) => [link.id, link.title]));
  const eventClicksByLink = events.reduce((acc, event) => {
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

  const countryCounts = events.reduce((acc, event) => {
    const country = event.country || "Unknown";
    acc[country] = (acc[country] ?? 0) + 1;
    return acc;
  }, {});

  return {
    dailyData,
    linkClickData: links
      .map((link) => ({
        id: link.id,
        name: linkTitleById.get(link.id)?.slice(0, 36) ?? "Untitled link",
        clicks: (storedClicks[link.id] ?? 0) + (eventClicksByLink[link.id] ?? 0),
      }))
      .sort((a, b) => b.clicks - a.clicks),
    countryData: Object.entries(countryCounts)
      .map(([country, visits]) => ({ country, visits }))
      .sort((a, b) => b.visits - a.visits),
  };
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function detectCountryFromRequest(req) {
  const forwardedCountry = String(
    req.headers["cf-ipcountry"] ??
    req.headers["x-vercel-ip-country"] ??
    req.headers["x-country-code"] ??
    ""
  ).trim();
  if (forwardedCountry && forwardedCountry !== "XX") return forwardedCountry.toUpperCase();

  const geoCountry = geoip.lookup(getClientIp(req))?.country;
  if (geoCountry) return geoCountry;

  const language = String(req.headers["accept-language"] ?? "");
  const localeRegion = language.match(/(?:^|,)\s*[a-z]{2,3}-([A-Z]{2})/);
  return localeRegion?.[1] ?? "Unknown";
}

function getClientIp(req) {
  const candidates = [
    req.headers["cf-connecting-ip"],
    req.headers["true-client-ip"],
    req.headers["x-real-ip"],
    String(req.headers["x-forwarded-for"] ?? "").split(",")[0],
    req.ip,
    req.socket?.remoteAddress,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeIp(Array.isArray(candidate) ? candidate[0] : candidate);
    if (normalized) return normalized;
  }
  return "";
}

function normalizeIp(value) {
  const ip = String(value ?? "").trim();
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.slice(7);
  if (/^\d+\.\d+\.\d+\.\d+:\d+$/.test(ip)) return ip.replace(/:\d+$/, "");
  return ip;
}

function redirectToAuthError(res, message) {
  const url = new URL(appUrl);
  url.searchParams.set("auth_error", message);
  res.redirect(303, url.toString());
}

async function fetchGoogleUser(code) {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: googleRedirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenPayload = await tokenResponse.json().catch(() => ({}));
  if (!tokenResponse.ok || !tokenPayload.access_token) {
    throw Object.assign(new Error("Google OAuth token exchange failed."), { status: 502 });
  }

  const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenPayload.access_token}` },
  });
  const userPayload = await userResponse.json().catch(() => ({}));
  if (!userResponse.ok) {
    throw Object.assign(new Error("Google profile lookup failed."), { status: 502 });
  }

  return parse(z.object({
    id: z.string().min(1),
    email: z.string().trim().toLowerCase().email(),
    verified_email: z.boolean().optional(),
    name: z.string().optional(),
    given_name: z.string().optional(),
  }), userPayload);
}

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") ?? true }));
app.use(express.json({ limit: "256kb" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: true, legacyHeaders: false });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 180, standardHeaders: true, legacyHeaders: false });
app.use("/api", apiLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.post("/api/auth/register", authLimiter, async (req, res, next) => {
  try {
    const input = parse(z.object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string().min(8).max(120),
      username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/),
    }), req.body);
    const created = await mutateState(async (state) => {
      if (state.users.some((user) => user.email === input.email)) throw Object.assign(new Error("Email is already registered."), { status: 409 });
      if (state.users.some((user) => user.username === input.username)) throw Object.assign(new Error("Username is already taken."), { status: 409 });
      const user = {
        id: makeId("user"),
        email: input.email,
        username: input.username,
        passwordHash: await bcrypt.hash(input.password, 12),
        emailVerifiedAt: null,
        createdAt: new Date().toISOString(),
      };
      const verification = createEmailVerificationRecord(state, user.id);
      state.users.push(user);
      state.profiles[user.id] = profileForNewUser({ displayName: input.username, username: input.username });
      state.links[user.id] = [];
      state.themes[user.id] = clone(defaultTheme);
      state.widgets[user.id] = [];
      state.analytics[user.id] = {};
      state.analyticsEvents[user.id] = [];
      return { user: publicUser(user), verifyUrl: verification.verifyUrl };
    });
    try {
      await sendVerificationEmail({ email: input.email, username: input.username, verifyUrl: created.verifyUrl });
    } catch (error) {
      await mutateState((state) => {
        state.users = state.users.filter((user) => user.id !== created.user.id);
        delete state.profiles[created.user.id];
        delete state.links[created.user.id];
        delete state.themes[created.user.id];
        delete state.widgets[created.user.id];
        delete state.analytics[created.user.id];
        delete state.analyticsEvents[created.user.id];
        cleanupVerificationTokensForUser(state, created.user.id);
      });
      throw error;
    }
    res.status(201).json({ requiresEmailVerification: true, email: input.email });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/login", authLimiter, async (req, res, next) => {
  try {
    const input = parse(z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(120) }), req.body);
    const state = await readState();
    const user = state.users.find((item) => item.email === input.email);
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw Object.assign(new Error("Invalid email or password."), { status: 401 });
    }
    if (!isEmailVerified(user)) {
      throw Object.assign(new Error("Confirm your email before signing in. Check your inbox for the verification link."), { status: 403 });
    }
    res.json({ token: await signToken(user), snapshot: snapshotForUser(state, user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/resend-verification", authLimiter, async (req, res, next) => {
  try {
    const input = parse(z.object({ email: z.string().trim().toLowerCase().email() }), req.body);
    const result = await mutateState((state) => {
      const user = state.users.find((item) => item.email === input.email);
      if (!user || isEmailVerified(user)) return null;
      cleanupVerificationTokensForUser(state, user.id);
      const verification = createEmailVerificationRecord(state, user.id);
      return { email: user.email, username: user.username, verifyUrl: verification.verifyUrl };
    });
    if (result) {
      await sendVerificationEmail(result);
    }
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/verify-email", async (req, res, next) => {
  try {
    const token = String(req.query.token ?? "");
    if (!token) throw Object.assign(new Error("Verification token is missing."), { status: 400 });
    const tokenHash = hashToken(token);
    const verified = await mutateState((state) => {
      const record = state.emailVerificationTokens[tokenHash];
      if (!record) return false;
      delete state.emailVerificationTokens[tokenHash];
      if (new Date(record.expiresAt).getTime() < Date.now()) return false;
      const user = state.users.find((item) => item.id === record.userId);
      if (!user) return false;
      user.emailVerifiedAt = new Date().toISOString();
      cleanupVerificationTokensForUser(state, user.id);
      return true;
    });
    const redirectUrl = `${appUrl}/?email_verified=${verified ? "1" : "0"}`;
    res.redirect(303, redirectUrl);
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/google/start", authLimiter, async (_req, res, next) => {
  try {
    if (!googleOAuthEnabled) {
      throw Object.assign(new Error("Google OAuth is not configured."), { status: 503, expose: true });
    }

    const stateToken = await mutateState((state) => createOAuthStateRecord(state, "google"));
    const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleUrl.searchParams.set("client_id", googleClientId);
    googleUrl.searchParams.set("redirect_uri", googleRedirectUri);
    googleUrl.searchParams.set("response_type", "code");
    googleUrl.searchParams.set("scope", "openid email profile");
    googleUrl.searchParams.set("state", stateToken);
    googleUrl.searchParams.set("prompt", "select_account");
    res.redirect(302, googleUrl.toString());
  } catch (error) {
    next(error);
  }
});

app.get("/api/oauth/google/callback", authLimiter, async (req, res, next) => {
  try {
    if (!googleOAuthEnabled) {
      return redirectToAuthError(res, "Google OAuth is not configured.");
    }

    const error = String(req.query.error ?? "");
    if (error) return redirectToAuthError(res, "Google sign-in was cancelled.");

    const code = String(req.query.code ?? "");
    const stateToken = String(req.query.state ?? "");
    if (!code || !stateToken) return redirectToAuthError(res, "Google sign-in response is incomplete.");

    const validState = await mutateState((state) => consumeOAuthState(state, "google", stateToken));
    if (!validState) return redirectToAuthError(res, "Google sign-in session expired. Try again.");

    const googleUser = await fetchGoogleUser(code);
    if (googleUser.verified_email === false) {
      return redirectToAuthError(res, "Google account email is not verified.");
    }

    const payload = await mutateState(async (state) => {
      let user = state.users.find((item) => item.oauthProviders?.google === googleUser.id);
      if (!user) user = state.users.find((item) => item.email === googleUser.email);

      if (user) {
        user.oauthProviders = { ...(user.oauthProviders ?? {}), google: googleUser.id };
        user.emailVerifiedAt = user.emailVerifiedAt ?? new Date().toISOString();
      } else {
        const displayName = googleUser.name || googleUser.given_name || googleUser.email.split("@")[0];
        const username = uniqueUsername(state, googleUser.given_name || googleUser.email.split("@")[0]);
        user = {
          id: makeId("user"),
          email: googleUser.email,
          username,
          passwordHash: await bcrypt.hash(makeId("oauth"), 12),
          emailVerifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          oauthProviders: { google: googleUser.id },
        };
        state.users.push(user);
        state.profiles[user.id] = profileForNewUser({ displayName, username });
        state.links[user.id] = [];
        state.themes[user.id] = clone(defaultTheme);
        state.widgets[user.id] = [];
        state.analytics[user.id] = {};
        state.analyticsEvents[user.id] = [];
      }

      return { token: await signToken(user) };
    });

    const redirectUrl = new URL(appUrl);
    redirectUrl.searchParams.set("auth_token", payload.token);
    res.redirect(303, redirectUrl.toString());
  } catch (error) {
    console.error("Google OAuth callback failed:", error);
    redirectToAuthError(res, "Google sign-in failed. Check OAuth settings and try again.");
  }
});

app.post("/api/auth/social", authLimiter, async (req, res, next) => {
  try {
    if (isProduction) {
      throw Object.assign(new Error("Demo social login is disabled in production."), { status: 410, expose: true });
    }
    const input = parse(z.object({ provider: z.enum(["google"]) }), req.body);
    const payload = await mutateState(async (state) => {
      const email = `${input.provider}@linkflow.local`;
      let user = state.users.find((item) => item.email === email);
      if (!user) {
        user = {
          id: makeId("user"),
          email,
          username: `${input.provider}_creator`,
          passwordHash: await bcrypt.hash(makeId("oauth"), 12),
          emailVerifiedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        state.users.push(user);
        state.profiles[user.id] = { ...clone(defaultProfile), username: user.username };
        state.links[user.id] = clone(defaultLinks);
        state.themes[user.id] = clone(defaultTheme);
        state.widgets[user.id] = clone(defaultWidgets);
        state.analytics[user.id] = {};
        state.analyticsEvents[user.id] = [];
      }
      return { token: await signToken(user), snapshot: snapshotForUser(state, user) };
    });
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/session", requireAuth, (req, res) => {
  res.json({ snapshot: snapshotForUser(req.auth.state, req.auth.user) });
});

app.get("/api/public/:username", async (req, res, next) => {
  try {
    const username = String(req.params.username ?? "").toLowerCase();
    const state = await readState();
    const user = state.users.find((item) => item.username === username);
    if (!user) throw Object.assign(new Error("Profile not found."), { status: 404 });
    res.json({ profile: publicSnapshotForUser(state, user) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/profile", requireAuth, async (req, res, next) => {
  try {
    const updates = parse(profileSchema, req.body);
    const profile = await mutateState((state) => {
      if (updates.username && state.users.some((user) => user.id !== req.auth.user.id && user.username === updates.username)) {
        throw Object.assign(new Error("Username is already taken."), { status: 409 });
      }
      const user = state.users.find((item) => item.id === req.auth.user.id);
      if (updates.username && user) user.username = updates.username;
      state.profiles[req.auth.user.id] = { ...state.profiles[req.auth.user.id], ...updates };
      return clone(state.profiles[req.auth.user.id]);
    });
    res.json({ profile });
  } catch (error) {
    next(error);
  }
});

app.post("/api/links", requireAuth, async (req, res, next) => {
  try {
    const input = parse(linkSchema, req.body);
    const link = await mutateState((state) => {
      const item = { ...input, platform: input.platform || detectPlatform(input.url), id: makeId("link") };
      state.links[req.auth.user.id] = [...(state.links[req.auth.user.id] ?? []), item];
      return clone(item);
    });
    res.status(201).json({ link });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/links/:id", requireAuth, async (req, res, next) => {
  try {
    const updates = parse(linkPatchSchema, req.body);
    const links = await mutateState((state) => {
      state.links[req.auth.user.id] = (state.links[req.auth.user.id] ?? []).map((link) =>
        link.id === req.params.id ? { ...link, ...updates, platform: updates.url ? detectPlatform(updates.url) : link.platform } : link
      );
      return clone(state.links[req.auth.user.id]);
    });
    res.json({ links });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/links/:id", requireAuth, async (req, res, next) => {
  try {
    const links = await mutateState((state) => {
      state.links[req.auth.user.id] = (state.links[req.auth.user.id] ?? []).filter((link) => link.id !== req.params.id);
      return clone(state.links[req.auth.user.id]);
    });
    res.json({ links });
  } catch (error) {
    next(error);
  }
});

app.post("/api/links/reorder", requireAuth, async (req, res, next) => {
  try {
    const { from, to } = parse(z.object({ from: z.number().int().min(0), to: z.number().int().min(0) }), req.body);
    const links = await mutateState((state) => {
      const arr = [...(state.links[req.auth.user.id] ?? [])];
      const [item] = arr.splice(from, 1);
      if (item) arr.splice(to, 0, item);
      state.links[req.auth.user.id] = arr;
      return clone(arr);
    });
    res.json({ links });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/theme", requireAuth, async (req, res, next) => {
  try {
    const updates = parse(themeSchema, req.body);
    const theme = await mutateState((state) => {
      state.themes[req.auth.user.id] = { ...state.themes[req.auth.user.id], ...updates };
      return clone(state.themes[req.auth.user.id]);
    });
    res.json({ theme });
  } catch (error) {
    next(error);
  }
});

app.post("/api/widgets", requireAuth, async (req, res, next) => {
  try {
    const input = parse(widgetSchema, req.body);
    validateWidgetConfig(input.config);
    const widget = await mutateState((state) => {
      const item = { ...input, id: makeId("widget") };
      state.widgets[req.auth.user.id] = [...(state.widgets[req.auth.user.id] ?? []), item];
      return clone(item);
    });
    res.status(201).json({ widget });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/widgets/:id", requireAuth, async (req, res, next) => {
  try {
    const updates = parse(widgetPatchSchema, req.body);
    if (updates.config) validateWidgetConfig(updates.config);
    const widgets = await mutateState((state) => {
      state.widgets[req.auth.user.id] = (state.widgets[req.auth.user.id] ?? []).map((widget) =>
        widget.id === req.params.id ? { ...widget, ...updates } : widget
      );
      return clone(state.widgets[req.auth.user.id]);
    });
    res.json({ widgets });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/widgets/:id", requireAuth, async (req, res, next) => {
  try {
    const widgets = await mutateState((state) => {
      state.widgets[req.auth.user.id] = (state.widgets[req.auth.user.id] ?? []).filter((widget) => widget.id !== req.params.id);
      return clone(state.widgets[req.auth.user.id]);
    });
    res.json({ widgets });
  } catch (error) {
    next(error);
  }
});

app.post("/api/widgets/:id/vote", async (req, res, next) => {
  try {
    const { optionIndex } = parse(z.object({ optionIndex: z.number().int().min(0).max(10) }), req.body);
    const updated = await mutateState((state) => {
      let result = null;
      for (const [userId, widgets] of Object.entries(state.widgets)) {
        state.widgets[userId] = widgets.map((widget) => {
          if (widget.id !== req.params.id) return widget;
          const votes = [...(widget.config.votes ?? [0, 0])];
          votes[optionIndex] = (Number(votes[optionIndex]) || 0) + 1;
          result = { ...widget, config: { ...widget.config, votes } };
          return result;
        });
      }
      if (!result) throw Object.assign(new Error("Widget not found."), { status: 404 });
      return clone(result);
    });
    res.json({ widget: updated });
  } catch (error) {
    next(error);
  }
});

app.post("/api/widgets/:id/subscribe", async (req, res, next) => {
  try {
    const { email } = parse(z.object({ email: z.string().trim().toLowerCase().email() }), req.body);
    const updated = await mutateState((state) => {
      let result = null;
      for (const [userId, widgets] of Object.entries(state.widgets)) {
        state.widgets[userId] = widgets.map((widget) => {
          if (widget.id !== req.params.id) return widget;
          const subscribers = Array.from(new Set([...(widget.config.subscribers ?? []), email]));
          result = { ...widget, config: { ...widget.config, subscribers, count: subscribers.length.toLocaleString() } };
          return result;
        });
      }
      if (!result) throw Object.assign(new Error("Widget not found."), { status: 404 });
      return clone(result);
    });
    res.json({ widget: updated });
  } catch (error) {
    next(error);
  }
});

app.post("/api/analytics/click", async (req, res, next) => {
  try {
    const { linkId } = parse(z.object({ linkId: z.string().min(1) }), req.body);
    await mutateState((state) => {
      const ownerId = Object.entries(state.links).find(([, links]) => links.some((link) => link.id === linkId))?.[0];
      if (!ownerId) throw Object.assign(new Error("Link not found."), { status: 404 });
      state.analytics[ownerId] = state.analytics[ownerId] ?? {};
      const events = state.analyticsEvents[ownerId] ?? [];
      events.push({
        id: makeId("click"),
        linkId,
        createdAt: new Date().toISOString(),
        country: detectCountryFromRequest(req),
      });
      state.analyticsEvents[ownerId] = events.slice(-5000);
    });
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/analytics", requireAuth, (req, res) => {
  res.json({ analytics: analyticsFor(req.auth.state, req.auth.user) });
});

app.use("/assets", express.static(path.join(distDir, "assets"), { immutable: true, maxAge: "1y" }));
app.use(express.static(distDir, { maxAge: isProduction ? "1h" : 0 }));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((err, _req, res, _next) => {
  const status = Number(err.status ?? 500);
  if (status >= 500) console.error(err);
  const expose = err.expose || status < 500;
  res.status(status).json({ error: expose ? err.message : "Internal server error." });
});

app.listen(port, () => {
  console.log(`LinkFlow server listening on http://127.0.0.1:${port}`);
});
