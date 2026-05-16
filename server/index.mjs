import "dotenv/config";
import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
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

const buttonStyles = ["rounded", "pill", "glass", "3d", "neon", "soft", "brutal", "underline"];
const hoverEffects = ["glow", "bounce", "expand", "none", "tilt", "slide"];
const widgetTypes = ["music", "countdown", "poll", "email", "video", "product", "map", "chat"];

const defaultProfile = {
  displayName: "Alex Rivera",
  username: "alexrivera",
  bio: "Designer & Developer | Building cool stuff | LA",
  avatarColor: "#7c3aed",
  initials: "AR",
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
};

const defaultWidgets = [
  { id: "w1", type: "music", title: "Now Playing", visible: true, config: { trackId: "neon", song: "Neon Pulse", artist: "LinkFlow Studio" } },
  { id: "w2", type: "countdown", title: "Launch Countdown", visible: false, config: { targetDate: "2026-12-31", label: "New Year 2027" } },
  { id: "w3", type: "product", title: "Product Card", visible: true, config: { name: "Digital Starter Kit", price: "$29", description: "Templates, assets, and resources in one bundle.", buttonLabel: "View product", url: "https://example.com/product" } },
  { id: "w4", type: "map", title: "Map Location", visible: false, config: { place: "Studio HQ", address: "123 Creator Ave, Los Angeles", url: "https://maps.google.com" } },
  { id: "w5", type: "chat", title: "Chat Bubble", visible: true, config: { headline: "Have a question?", message: "Send me a quick message and I will get back to you.", buttonLabel: "Start chat", url: "mailto:hello@example.com" } },
];

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_.-]{3,30}$/).optional(),
  bio: z.string().max(180).optional(),
  avatarColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  initials: z.string().trim().min(1).max(3).optional(),
});

const urlSchema = z.string().trim().url();
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
  backgroundPattern: z.enum(["none", "grid", "dots", "stars", "rays"]).optional(),
  backgroundOverlay: z.number().min(0).max(90).optional(),
  profileStyle: z.enum(["halo", "editorial", "terminal", "poster"]).optional(),
  widgetStyle: z.enum(["glass", "solid", "outline", "neon"]).optional(),
  contentWidth: z.enum(["compact", "comfortable", "wide"]).optional(),
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

function initialsFromUsername(username) {
  return username.slice(0, 2).toUpperCase();
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
  if (typeof config.url !== "string" || !config.url.trim()) return;
  const url = new URL(config.url);
  if (!["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
    throw Object.assign(new Error("Widget URL protocol is not allowed."), { status: 400 });
  }
}

async function initialState() {
  const demoUser = {
    id: "demo_user",
    email: "demo@linkflow.local",
    username: "alexrivera",
    passwordHash: await bcrypt.hash("password", 12),
    createdAt: new Date().toISOString(),
  };
  return {
    users: [demoUser],
    profiles: { [demoUser.id]: clone(defaultProfile) },
    links: { [demoUser.id]: clone(defaultLinks) },
    themes: { [demoUser.id]: clone(defaultTheme) },
    widgets: { [demoUser.id]: clone(defaultWidgets) },
    analytics: { [demoUser.id]: {} },
  };
}

async function readState() {
  await mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(await readFile(dbFile, "utf8"));
  } catch {
    const state = await initialState();
    await writeState(state);
    return state;
  }
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
  const totalTracked = Object.values(storedClicks).reduce((sum, value) => sum + Number(value), 0);
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      clicks: Math.max(4, Math.round((totalTracked + links.length * 12) * (0.45 + i / 42))),
    };
  });

  return {
    dailyData,
    linkClickData: links
      .filter((link) => link.visible)
      .map((link, i) => ({
        id: link.id,
        name: link.title.length > 18 ? `${link.title.slice(0, 18)}...` : link.title,
        clicks: (storedClicks[link.id] ?? 0) + (links.length - i) * 17,
      }))
      .sort((a, b) => b.clicks - a.clicks),
    deviceData: [
      { name: "Mobile", value: 64, color: "#a855f7" },
      { name: "Desktop", value: 28, color: "#3b82f6" },
      { name: "Tablet", value: 8, color: "#ec4899" },
    ],
    geoData: [
      { country: "United States", visits: 1240 },
      { country: "United Kingdom", visits: 480 },
      { country: "Germany", visits: 310 },
      { country: "France", visits: 270 },
      { country: "Brazil", visits: 220 },
      { country: "Australia", visits: 190 },
    ],
  };
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
    const payload = await mutateState(async (state) => {
      if (state.users.some((user) => user.email === input.email)) throw Object.assign(new Error("Email is already registered."), { status: 409 });
      if (state.users.some((user) => user.username === input.username)) throw Object.assign(new Error("Username is already taken."), { status: 409 });
      const user = {
        id: makeId("user"),
        email: input.email,
        username: input.username,
        passwordHash: await bcrypt.hash(input.password, 12),
        createdAt: new Date().toISOString(),
      };
      state.users.push(user);
      state.profiles[user.id] = { ...clone(defaultProfile), displayName: input.username, username: input.username, initials: initialsFromUsername(input.username) };
      state.links[user.id] = [];
      state.themes[user.id] = clone(defaultTheme);
      state.widgets[user.id] = [];
      state.analytics[user.id] = {};
      return { token: await signToken(user), snapshot: snapshotForUser(state, user) };
    });
    res.status(201).json(payload);
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
    res.json({ token: await signToken(user), snapshot: snapshotForUser(state, user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/social", authLimiter, async (req, res, next) => {
  try {
    const input = parse(z.object({ provider: z.enum(["google", "apple"]) }), req.body);
    const payload = await mutateState(async (state) => {
      const email = `${input.provider}@linkflow.local`;
      let user = state.users.find((item) => item.email === email);
      if (!user) {
        user = {
          id: makeId("user"),
          email,
          username: `${input.provider}_creator`,
          passwordHash: await bcrypt.hash(makeId("oauth"), 12),
          createdAt: new Date().toISOString(),
        };
        state.users.push(user);
        state.profiles[user.id] = { ...clone(defaultProfile), username: user.username };
        state.links[user.id] = clone(defaultLinks);
        state.themes[user.id] = clone(defaultTheme);
        state.widgets[user.id] = clone(defaultWidgets);
        state.analytics[user.id] = {};
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
      const ownerId = Object.entries(state.links).find(([, links]) => links.some((link) => link.id === linkId))?.[0] ?? state.users[0]?.id;
      if (!ownerId) return;
      const bucket = state.analytics[ownerId] ?? {};
      bucket[linkId] = (bucket[linkId] ?? 0) + 1;
      state.analytics[ownerId] = bucket;
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
  res.status(status).json({ error: status >= 500 ? "Internal server error." : err.message });
});

app.listen(port, () => {
  console.log(`LinkFlow server listening on http://127.0.0.1:${port}`);
});
