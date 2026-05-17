# OAuth 2.0 и Авторизация в LinkFlow

Полная инструкция по интеграции Google OAuth, Apple Sign In и email-подтверждению.

## Архитектура

```text
Frontend (React) -> Backend (Node.js) -> OAuth Provider
                                      -> Brevo SMTP (Email)
```

**Процесс:**
1. Пользователь кликает "Sign in with Google/Apple"
2. Редирект на OAuth consent screen провайдера
3. Провайдер редирект назад на наш callback с кодом
4. Backend обменивает код на access token и user info
5. Backend создает или обновляет пользователя
6. Backend отправляет verification email через Brevo
7. Frontend получает JWT token

## 1. Google OAuth 2.0

### 1.1 Создать проект в Google Cloud Console

1. Открой https://console.cloud.google.com/
2. Создай новый проект:
   - Click "Select a project" -> "New Project"
   - Name: `LinkFlow`
   - Create
3. Подожди 1-2 минуты, пока проект создается

### 1.2 Включить Google+ API

1. Открой https://console.cloud.google.com/apis/library
2. Ищи `Google+ API`
3. Нажми `Enable`

### 1.3 Создать OAuth 2.0 credentials

1. Открой https://console.cloud.google.com/apis/credentials
2. Click `Create Credentials` -> `OAuth client ID`
3. Если просит создать OAuth consent screen, go to Consent screen first (пункт 1.4)

### 1.4 Настроить OAuth Consent Screen

1. https://console.cloud.google.com/apis/credentials/consent
2. Выбери `External`
3. Fill in:
   - **App name**: `LinkFlow`
   - **User support email**: твой email
   - **App logo**: пропусти (не обязательно)
   - **Scopes**: Add these scopes:
     - `https://www.googleapis.com/auth/userinfo.email`
     - `https://www.googleapis.com/auth/userinfo.profile`
   - **Test users**: Add your email for testing
4. Save and Continue

### 1.5 Создать OAuth Client ID

1. Вернись на https://console.cloud.google.com/apis/credentials
2. Click `Create Credentials` -> `OAuth client ID`
3. Application type: `Web application`
4. Name: `LinkFlow Web`
5. **Authorized JavaScript origins**:
   ```
   http://127.0.0.1:3000
   http://localhost:3000
   https://flowlinks.org
   https://www.flowlinks.org
   ```
6. **Authorized redirect URIs**:
   ```
   http://127.0.0.1:3000/api/auth/oauth/google/callback
   http://localhost:3000/api/auth/oauth/google/callback
   https://flowlinks.org/api/auth/oauth/google/callback
   https://www.flowlinks.org/api/auth/oauth/google/callback
   ```
7. Create

Скопируй **Client ID** и **Client Secret** в `.env`:

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### 1.6 Backend: установи google-auth-library

```bash
pnpm add google-auth-library
pnpm add -D @types/google-auth-library
```

## 2. Apple Sign In

### 2.1 Зарегистрируйся как Apple Developer

1. Открой https://developer.apple.com/account/
2. Войди или создай Apple ID
3. Согласись с Developer Program License Agreement
4. Может требовать платный аккаунт ($99/год)

Если нет платного аккаунта, используй testflight sandbox account для тестирования.

### 2.2 Создать App ID с Sign in with Apple

1. https://developer.apple.com/account/resources/identifiers/list
2. Нажми `+` -> `App IDs`
3. Select `App`
4. Register:
   - **App Description**: `LinkFlow`
   - **Bundle ID**: `org.linkflow.web` (используй reverse domain notation)
5. Scroll down, найди `Sign in with Apple`
6. Check the checkbox
7. Continue -> Register

### 2.3 Создать Service ID

1. https://developer.apple.com/account/resources/identifiers/list/serviceId
2. Нажми `+` -> `Service IDs`
3. Register:
   - **Identifier**: `org.linkflow.web.service`
   - **Description**: `LinkFlow Web Service`
4. Check `Sign in with Apple`
5. Нажми Configure
6. **Primary App ID**: выбери созданный выше App ID
7. **Web Domain**: введи твой домен:
   ```
   flowlinks.org
   www.flowlinks.org
   localhost:3000
   ```
8. **Return URLs** (callback URLs):
   ```
   https://flowlinks.org/api/auth/oauth/apple/callback
   https://www.flowlinks.org/api/auth/oauth/apple/callback
   http://localhost:3000/api/auth/oauth/apple/callback
   http://127.0.0.1:3000/api/auth/oauth/apple/callback
   ```
9. Save

### 2.4 Создать Private Key для Sign in with Apple

1. https://developer.apple.com/account/resources/authkeys/list
2. Нажми `+`
3. **Key Name**: `LinkFlow Private Key`
4. Check `Sign in with Apple`
5. Continue -> Register
6. Download `.p8` файл (сохрани в безопасном месте!)
7. **Note the Key ID** (показан на экране)
8. **Note the Team ID** (https://developer.apple.com/account/#/membership/)

Содержимое `.p8` файла помести в `.env`:

```env
APPLE_KEY_ID=ABC123456
APPLE_TEAM_ID=ABCDEFGH12
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----"
APPLE_SERVICE_ID=org.linkflow.web.service
```

## 3. Backend Implementation

### 3.1 Пакеты

```bash
pnpm add jose google-auth-library apple-signin-auth nodemailer
pnpm add -D @types/nodemailer
```

### 3.2 Обновить schema пользователя

В `server/index.mjs` обнови user schema:

```javascript
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string().regex(/^[a-z0-9_.-]{3,30}$/),
  passwordHash: z.string().optional(),
  emailVerifiedAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  oauthProviders: z.object({
    google: z.string().optional(),
    apple: z.string().optional(),
  }).optional(),
});
```

### 3.3 Google OAuth Callback

```javascript
// Google OAuth callback
app.get("/api/auth/oauth/google/callback", async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) throw Object.assign(new Error("Authorization code missing"), { status: 400 });

    // Обмен код на access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${publicApiUrl}/api/auth/oauth/google/callback`,
      }),
    });

    if (!tokenResponse.ok) throw new Error("Failed to exchange authorization code");
    const tokens = await tokenResponse.json();

    // Получить user info
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) throw new Error("Failed to fetch user info");
    const googleUser = await userInfoResponse.json();

    // Создать или найти пользователя
    const payload = await mutateState(async (state) => {
      let user = state.users.find((u) => u.oauthProviders?.google === googleUser.id);
      
      if (!user) {
        // Проверь email (может быть уже зарегистрирован)
        user = state.users.find((u) => u.email === googleUser.email);
        if (user && user.oauthProviders) {
          user.oauthProviders.google = googleUser.id;
        } else if (!user) {
          user = {
            id: makeId("user"),
            email: googleUser.email,
            username: `${googleUser.given_name || "user"}_${generateRandomSuffix()}`.toLowerCase(),
            passwordHash: await bcrypt.hash(makeId("oauth"), 12),
            emailVerifiedAt: new Date().toISOString(), // Google email verified
            createdAt: new Date().toISOString(),
            oauthProviders: { google: googleUser.id },
          };
          state.users.push(user);
          // Initialize profile and links
          state.profiles[user.id] = { ...clone(defaultProfile), username: user.username };
          state.links[user.id] = clone(defaultLinks);
          state.themes[user.id] = clone(defaultTheme);
          state.widgets[user.id] = clone(defaultWidgets);
          state.analytics[user.id] = {};

          // Send verification email
          if (mailTransporter) {
            await mailTransporter.sendMail({
              from: mailFrom,
              to: user.email,
              subject: "Welcome to LinkFlow",
              html: `
                <p>Hi ${googleUser.given_name || "there"},</p>
                <p>Your LinkFlow account has been created with Google Sign In.</p>
                <p><a href="${appUrl}">Start creating your link profile →</a></p>
              `,
            });
          }
        }
      }

      return { token: await signToken(user), snapshot: snapshotForUser(state, user) };
    });

    // Redirect to frontend with token
    res.redirect(`${appUrl}?token=${payload.token}`);
  } catch (error) {
    next(error);
  }
});
```

### 3.4 Apple OAuth Callback

```javascript
// Apple OAuth callback
app.get("/api/auth/oauth/apple/callback", async (req, res, next) => {
  try {
    const { code, id_token, state, user } = req.body || req.query;
    if (!code) throw Object.assign(new Error("Authorization code missing"), { status: 400 });

    // Обмен код на access token (Apple returns JWT)
    const tokenResponse = await fetch("https://appleid.apple.com/auth/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.APPLE_SERVICE_ID,
        client_secret: generateAppleClientSecret(),
        code,
        grant_type: "authorization_code",
        redirect_uri: `${publicApiUrl}/api/auth/oauth/apple/callback`,
      }),
    });

    if (!tokenResponse.ok) throw new Error("Failed to exchange authorization code");
    const tokens = await tokenResponse.json();

    // Decode id_token (это JWT с user info)
    const jwtDecoded = parseAppleJwt(tokens.id_token);
    const appleUser = jwtDecoded.payload;

    // Создать или найти пользователя
    const payload = await mutateState(async (state) => {
      let user = state.users.find((u) => u.oauthProviders?.apple === appleUser.sub);
      
      if (!user) {
        user = state.users.find((u) => u.email === appleUser.email);
        if (user && user.oauthProviders) {
          user.oauthProviders.apple = appleUser.sub;
        } else if (!user) {
          user = {
            id: makeId("user"),
            email: appleUser.email,
            username: `apple_user_${generateRandomSuffix()}`.toLowerCase(),
            passwordHash: await bcrypt.hash(makeId("oauth"), 12),
            emailVerifiedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            oauthProviders: { apple: appleUser.sub },
          };
          state.users.push(user);
          state.profiles[user.id] = { ...clone(defaultProfile), username: user.username };
          state.links[user.id] = clone(defaultLinks);
          state.themes[user.id] = clone(defaultTheme);
          state.widgets[user.id] = clone(defaultWidgets);
          state.analytics[user.id] = {};

          // Send email
          if (mailTransporter) {
            await mailTransporter.sendMail({
              from: mailFrom,
              to: user.email,
              subject: "Welcome to LinkFlow",
              html: `
                <p>Hi,</p>
                <p>Your LinkFlow account has been created with Apple Sign In.</p>
                <p><a href="${appUrl}">Start creating your link profile →</a></p>
              `,
            });
          }
        }
      }

      return { token: await signToken(user), snapshot: snapshotForUser(state, user) };
    });

    res.redirect(`${appUrl}?token=${payload.token}`);
  } catch (error) {
    next(error);
  }
});
```

### 3.5 Helper функции

```javascript
function generateRandomSuffix() {
  return Math.random().toString(36).substring(2, 8);
}

function generateAppleClientSecret() {
  // Генерирует JWT для Apple (сложно, используй apple-signin-auth пакет)
  // или предварительно сгенерируй и положи в env
  return process.env.APPLE_CLIENT_SECRET;
}

function parseAppleJwt(token) {
  // Распарси JWT (второй segment это payload)
  const parts = token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  return { payload };
}
```

## 4. Frontend Implementation

### 4.1 Обновить AuthPage.tsx

Замени placeholder кнопки на реальный OAuth flow:

```typescript
// Redirect to Google OAuth
const handleGoogleAuth = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/api/auth/oauth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
};

// Redirect to Apple OAuth
const handleAppleAuth = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_APPLE_SERVICE_ID,
    redirect_uri: `${window.location.origin}/api/auth/oauth/apple/callback`,
    response_type: "code",
    response_mode: "form_post",
    scope: "email name",
  });
  window.location.href = `https://appleid.apple.com/auth/authorize?${params}`;
};
```

### 4.2 Обновить .env файлы

**`.env.development`:**
```env
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_APPLE_SERVICE_ID=org.linkflow.web.service
```

**`.env.production`:**
```env
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
VITE_APPLE_SERVICE_ID=org.linkflow.web.service
```

## 5. Email Sending (Brevo SMTP)

Скопируй из `SMTP_SETUP_RU.md`:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_BREVO_SMTP_LOGIN
SMTP_PASS=YOUR_BREVO_SMTP_KEY
MAIL_FROM=no-reply@flowlinks.org
MAIL_FROM_NAME=LinkFlow
EMAIL_VERIFICATION_TTL_HOURS=24
```

## 6. Тестирование

### Local testing

```bash
# Terminal 1: Backend
cd /var/www/linkflow/current
pnpm install
pnpm dev:backend

# Terminal 2: Frontend
cd /var/www/linkflow/current
pnpm dev:frontend
```

1. Открой `http://localhost:3000`
2. Нажми "Google" или "Apple"
3. Разреши доступ в consent screen
4. Проверь, что пришел verification email
5. Проверь, что пользователь создан в database

### Production testing

1. Зайди на `https://flowlinks.org`
2. Попробуй зарегистрироваться через Google/Apple
3. Проверь email на получение письма
4. Проверь, что аккаунт создан и можешь залогиниться

## 7. Типовые ошибки

### "redirect_uri mismatch"

- Проверь, что redirect URIs в Google/Apple console **точно** совпадают с теми, что в коде
- Нельзя использовать `localhost` вместо `127.0.0.1` или наоборот - они должны совпадать

### "client_secret not valid"

- Скопируй Client Secret правильно (без кавычек)
- Для Apple - сгенерируй правильный JWT

### Email не приходит

- Проверь SMTP конфиг (см. `SMTP_SETUP_RU.md`)
- Проверь, что domain authenticated в Brevo
- Посмотри логи: `sudo journalctl -u linkflow -n 100`

### Пользователь создается, но без email

- Проверь, что OAuth scope включает `email`
- Для Apple - пользователь может скрыть email (используй `sub` как unique ID)

## 8. Production Checklist

- [ ] Google Cloud Console credentials созданы
- [ ] Apple Developer Service ID созданы
- [ ] Все redirect URIs добавлены и проверены
- [ ] Environment переменные заполнены на VPS
- [ ] Brevo SMTP configured и проверен
- [ ] Backend restarted после изменения .env
- [ ] Email verification работает
- [ ] Google Sign In работает в production
- [ ] Apple Sign In работает в production
- [ ] Пользователи могут логиниться после регистрации через OAuth
- [ ] Email addresses правильно сохраняются в базе

## Источники

- Google OAuth: https://developers.google.com/identity/protocols/oauth2/web-server
- Apple Sign In: https://developer.apple.com/documentation/sign_in_with_apple
- Brevo SMTP: https://help.brevo.com/hc/en-us/articles/7924908994450
