# LinkFlow: деплой на VPS для новичков

Эта инструкция ведет от пустого VPS до рабочего сайта на домене с HTTPS.

Пример в инструкции:

```text
Домен: flowlinks.org
IP VPS: 203.0.113.10
Папка проекта: /var/www/linkflow/current
Данные приложения: /var/www/linkflow/shared/data
Node.js порт: 8787
```

## Важно, если на VPS уже есть другой сайт

Эта инструкция специально рассчитана на запуск рядом с твоим другим проектом `four-four-web`.

Схема должна быть такой:

```text
four-four-web:
  Папка: /opt/four-four-web
  Runtime: Docker Compose
  Локальный порт: 127.0.0.1:8080
  Nginx site: /etc/nginx/sites-available/four-four-web
  Домен: f4ws.eu

FlowLinks / LinkFlow:
  Папка: /var/www/linkflow/current
  Runtime: systemd + Node.js
  Локальный порт: 127.0.0.1:8787
  Nginx site: /etc/nginx/sites-available/linkflow
  Домен: flowlinks.org
```

Главное правило: не трогай `/opt/four-four-web`, контейнеры Docker и nginx-конфиг `four-four-web`, когда деплоишь `flowlinks.org`.

Оба сайта спокойно живут на одном VPS, потому что:

- наружу оба смотрят через общий Nginx на портах `80` и `443`;
- Nginx выбирает проект по домену в `server_name`;
- `four-four-web` слушает локально `8080`;
- `flowlinks.org` слушает локально `8787`;
- папки, сервисы, данные и nginx-конфиги разные.

Везде ниже уже используется домен `flowlinks.org`.

Замени только:

- `203.0.113.10` на IP своего VPS.
- `<YOUR_GIT_REPO_URL>` на ссылку своего Git-репозитория.

## 1. Что нужно заранее

Нужно иметь:

- VPS с Ubuntu 22.04 или 24.04.
- Домен `flowlinks.org`.
- Доступ к DNS-записям домена.
- Git-репозиторий с этим проектом.
- SSH-доступ к серверу.

Минимальный VPS для старта:

```text
1 CPU
1 GB RAM
15-25 GB SSD
Ubuntu 22.04/24.04
```

Для реального проекта лучше:

```text
2 CPU
2 GB RAM
40 GB SSD
```

## 2. Настрой DNS

Открой панель управления доменом и создай две записи:

```text
Type  Name  Value
A     @     203.0.113.10
A     www   203.0.113.10
```

Если панель не принимает `@`, укажи сам домен:

```text
A     flowlinks.org      203.0.113.10
A     www.flowlinks.org  203.0.113.10
```

Подожди 5-30 минут. Иногда DNS обновляется дольше.

Проверить DNS можно на своем компьютере:

```bash
nslookup flowlinks.org
```

### 2.1 География кликов через Cloudflare

Самый быстрый бесплатный вариант для аналитики стран - держать домен за Cloudflare proxy и включить передачу страны посетителя:

1. Cloudflare Dashboard -> свой домен.
2. `Rules` -> `Transform Rules` -> `Managed Transforms`.
3. Включи `Add visitor location headers`.
4. Проверь, что DNS-записи `flowlinks.org` и `www` проксируются через Cloudflare, то есть оранжевое облако включено.

После этого Cloudflare будет передавать backend header `CF-IPCountry`, и LinkFlow будет считать клики по странам без внешних API-запросов. Если Cloudflare header не пришел, backend использует локальную GeoIP-базу `geoip-lite` по IP из `CF-Connecting-IP`, `X-Real-IP` или `X-Forwarded-For`.

Или уже на сервере:

```bash
dig flowlinks.org +short
```

Ожидаемый результат:

```text
203.0.113.10
```

## 3. Зайди на VPS первый раз

На своем компьютере открой терминал и подключись:

```bash
ssh root@203.0.113.10
```

Если появится вопрос:

```text
Are you sure you want to continue connecting?
```

Напиши:

```text
yes
```

Обнови систему:

```bash
apt update
apt upgrade -y
```

## 4. Создай обычного пользователя

Не стоит постоянно работать под `root`. Создадим пользователя `deploy`:

```bash
adduser deploy
```

Система попросит пароль. Введи надежный пароль.

Добавь пользователя в sudo:

```bash
usermod -aG sudo deploy
```

Скопируй SSH-доступ от root к deploy:

```bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Выйди:

```bash
exit
```

Зайди уже под новым пользователем:

```bash
ssh deploy@203.0.113.10
```

Проверь sudo:

```bash
sudo whoami
```

Ожидаемый результат:

```text
root
```

## 5. Включи firewall

Открой только SSH, HTTP и HTTPS:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

Ожидаемо должно быть что-то вроде:

```text
22/tcp   ALLOW
80/tcp   ALLOW
443/tcp  ALLOW
```

## 6. Установи нужные пакеты

Если на VPS уже стоит Docker и Nginx для `four-four-web`, ничего удалять не нужно. Команда ниже просто доставит недостающие пакеты.

```bash
sudo apt install -y git curl nginx certbot python3-certbot-nginx build-essential
```

Проверь Nginx:

```bash
sudo systemctl status nginx
```

Если видишь `active (running)`, все нормально.

Проверь, что существующий проект не трогаем:

```bash
sudo nginx -t
sudo systemctl status nginx
docker ps
```

Если `four-four-web` запущен в Docker, в `docker ps` должен быть его контейнер. Не останавливай его.

Перед изменениями Nginx можно сделать быстрый backup конфигов:

```bash
sudo cp -a /etc/nginx /etc/nginx.backup-$(date +%F-%H%M)
```

Если что-то пойдет не так, у тебя будет копия старой рабочей конфигурации.

## 7. Установи Node.js 22 и pnpm

Проекту нужен Node.js. Ставим Node 22:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

Проверь версии:

```bash
node -v
npm -v
```

Node должен быть примерно:

```text
v22.x.x
```

Включи pnpm:

```bash
sudo corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

## 8. Создай системного пользователя приложения

Приложение будет запускаться не от `deploy`, а от отдельного системного пользователя `linkflow`.

```bash
sudo useradd --system --create-home --shell /usr/sbin/nologin linkflow
```

Создай папки:

```bash
sudo mkdir -p /var/www/linkflow/current
sudo mkdir -p /var/www/linkflow/shared/data
sudo mkdir -p /var/log/linkflow
```

Выдай права:

```bash
sudo chown -R deploy:deploy /var/www/linkflow/current
sudo chown -R deploy:deploy /var/www/linkflow
sudo chown -R linkflow:linkflow /var/www/linkflow/shared
sudo chown -R linkflow:linkflow /var/log/linkflow
```

Проверка:

```bash
ls -la /var/www/linkflow
```

## 9. Склонируй проект на сервер

Перейди в папку:

```bash
cd /var/www/linkflow
```

Если папка `current` пустая, удали ее и клонируй репозиторий:

```bash
rm -rf current
git clone <YOUR_GIT_REPO_URL> current
cd current
```

Пример для GitHub:

```bash
git clone https://github.com/username/linkflow.git current
```

Если репозиторий приватный, удобнее использовать SSH.

Создай SSH-ключ на VPS:

```bash
ssh-keygen -t ed25519 -C "linkflow-vps"
```

Покажи публичный ключ:

```bash
cat ~/.ssh/id_ed25519.pub
```

Скопируй результат и добавь его в GitHub/GitLab:

```text
GitHub -> Settings -> SSH and GPG keys -> New SSH key
```

Потом клонируй через SSH:

```bash
git clone git@github.com:Skanexis/linkflow.git current
```

## 10. Создай production env

В проекте есть пример:

```bash
ls -la .env.production.example
```

Создай настоящий `.env` в shared-папке, чтобы он не пропадал при обновлениях:

```bash
cp .env.production.example /var/www/linkflow/shared/.env
nano /var/www/linkflow/shared/.env
```

Минимальный рабочий вариант:

```env
NODE_ENV=production
PORT=8787
APP_URL=https://flowlinks.org
DATA_DIR=/var/www/linkflow/shared/data
CORS_ORIGIN=https://flowlinks.org,https://www.flowlinks.org
JWT_SECRET=PASTE_LONG_RANDOM_SECRET_HERE
VITE_API_BASE_URL=/api
GOOGLE_OAUTH_ENABLED=true
GOOGLE_CLIENT_ID=PASTE_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=PASTE_GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://flowlinks.org/api/oauth/google/callback
```

Порт `8787` выбран специально, чтобы не конфликтовать с другим проектом на `8080`.

Проверь занятые порты:

```bash
sudo ss -tulpn | grep -E ':80|:443|:8080|:8787'
```

Нормально, если уже заняты:

```text
:80    nginx
:443   nginx
:8080  docker/four-four-web
```

До запуска FlowLinks порт `8787` может быть пустым. После запуска systemd он должен появиться как Node.js.

Сгенерируй секрет:

```bash
openssl rand -base64 48
```

Скопируй результат в `JWT_SECRET`.

Пример:

```env
JWT_SECRET=mR4qGqj8...очень_длинная_строка...
```

Сохрани файл в nano:

```text
Ctrl+O
Enter
Ctrl+X
```

Выдай безопасные права:

```bash
sudo chown linkflow:linkflow /var/www/linkflow/shared/.env
sudo chmod 600 /var/www/linkflow/shared/.env
```

Проверка:

```bash
sudo ls -la /var/www/linkflow/shared/.env
```

## 11. Установи зависимости и собери проект

Перейди в проект:

```bash
cd /var/www/linkflow/current
```

Установи зависимости:

```bash
pnpm verify```

Проверь типы и сборку:

```bash
pnpm verify
```

Команда `pnpm verify` запускает:

```bash
pnpm typecheck
pnpm build
```

Если сборка успешная, появится папка:

```bash
ls -la dist
```

## 12. Проверь приложение вручную

Перед systemd полезно проверить, что Node-сервер вообще стартует.

Выполни:

```bash
cd /var/www/linkflow/current
sudo -u linkflow bash -lc 'set -a; source /var/www/linkflow/shared/.env; set +a; node server/index.mjs'
```

Если все хорошо, увидишь сообщение о старте сервера.

Открой второй терминал, зайди на VPS и проверь health:

```bash
curl http://127.0.0.1:8787/api/health
```

Ожидаемый ответ:

```json
{"ok":true}
```

Вернись в первый терминал и останови ручной запуск:

```text
Ctrl+C
```

Если `curl` не работает, смотри раздел "Типовые проблемы" внизу.

## 13. Настрой systemd

systemd будет автоматически запускать приложение после перезагрузки сервера.

Скопируй service-файл:

```bash
sudo cp /var/www/linkflow/current/deploy/systemd/linkflow.service /etc/systemd/system/linkflow.service
```

Проверь файл:

```bash
sudo nano /etc/systemd/system/linkflow.service
```

В нем должно быть:

```ini
WorkingDirectory=/var/www/linkflow/current
EnvironmentFile=/var/www/linkflow/shared/.env
ExecStart=/usr/bin/node server/index.mjs
```

Примени systemd:

```bash
sudo systemctl daemon-reload
sudo systemctl enable linkflow
sudo systemctl start linkflow
```

Проверь статус:

```bash
sudo systemctl status linkflow
```

Ожидаемо:

```text
active (running)
```

Посмотреть логи:

```bash
journalctl -u linkflow -f
```

Выйти из просмотра логов:

```text
Ctrl+C
```

Проверь API:

```bash
curl http://127.0.0.1:8787/api/health
```

## 14. Настрой Nginx

Nginx будет принимать запросы с интернета на `80/443` и прокидывать `flowlinks.org` в Node.js на `127.0.0.1:8787`.

Если на этом VPS уже есть `four-four-web`, его nginx-конфиг трогать нельзя. У него должен остаться отдельный файл:

```text
/etc/nginx/sites-available/four-four-web
/etc/nginx/sites-enabled/four-four-web
```

Для FlowLinks создаем отдельный файл:

```text
/etc/nginx/sites-available/linkflow
/etc/nginx/sites-enabled/linkflow
```

Проверь текущие включенные сайты:

```bash
ls -la /etc/nginx/sites-enabled
```

Если видишь `four-four-web`, оставь его как есть.

Скопируй конфиг:

```bash
sudo cp /var/www/linkflow/current/deploy/nginx/linkflow.conf /etc/nginx/sites-available/linkflow
```

Открой:

```bash
sudo nano /etc/nginx/sites-available/linkflow
```

Найди:

```nginx
server_name flowlinks.org www.flowlinks.org;
```

Для этого проекта должно остаться именно так:

```nginx
server_name flowlinks.org www.flowlinks.org;
```

Включи сайт:

```bash
[ -L /etc/nginx/sites-enabled/linkflow ] || sudo ln -s /etc/nginx/sites-available/linkflow /etc/nginx/sites-enabled/linkflow
```

Не удаляй symlink `four-four-web` из `/etc/nginx/sites-enabled`.

`default` тоже можно не трогать. При правильном `server_name` Nginx сам выберет нужный сайт по домену.

Проверь конфиг:

```bash
sudo nginx -t
```

Ожидаемо:

```text
syntax is ok
test is successful
```

Перезагрузи Nginx:

```bash
sudo systemctl reload nginx
```

Проверь сайт по HTTP:

```bash
curl -I http://flowlinks.org
```

Ожидаемо должен быть HTTP-ответ, не `Connection refused`.

## 15. Подключи HTTPS

Certbot сам получит SSL-сертификат и обновит nginx-блок для `flowlinks.org`.

Если на сервере уже есть сертификат для `f4ws.eu`, он останется отдельно. Не запускай certbot для чужого домена, если деплоишь только FlowLinks.

```bash
sudo certbot --nginx -d flowlinks.org -d www.flowlinks.org
```

Certbot спросит email. Укажи свой email.

Если спросит про redirect HTTP to HTTPS, выбери redirect.

Проверь автообновление сертификата:

```bash
sudo certbot renew --dry-run
```

Проверь список сертификатов:

```bash
sudo certbot certificates
```

Нормально, если там есть несколько сертификатов, например для `f4ws.eu` и для `flowlinks.org`.

Проверь сайт:

```bash
curl -I https://flowlinks.org
curl https://flowlinks.org/api/health
```

Ожидаемый health:

```json
{"ok":true}
```

## 16. Первый вход

Открой в браузере:

```text
https://flowlinks.org
```

В `NODE_ENV=production` demo-аккаунт отключен. Если на сервере уже был старый JSON с `demo@linkflow.local` или `google@linkflow.local`, после обновления backend больше не будет отдавать эти mock-аккаунты.

Данные лежат тут:

```text
/var/www/linkflow/shared/data/linkflow.json
```

## 17. Проверочный список после деплоя

Проверь:

- `https://flowlinks.org` открывается.
- `https://flowlinks.org/api/health` возвращает `{"ok":true}`.
- Регистрация работает.
- Login работает.
- Dashboard открывается.
- Public profile открывается по URL твоего реального username.
- Создание ссылки работает.
- Preview работает.
- Виджеты работают.
- Analytics считает клики.
- `sudo systemctl status linkflow` показывает `active (running)`.
- `sudo nginx -t` без ошибок.
- `sudo certbot renew --dry-run` без ошибок.

Если на VPS уже есть `four-four-web`, дополнительно проверь, что он не сломался:

```bash
cd /opt/four-four-web
docker compose ps
curl -I http://127.0.0.1:8080
curl -I https://f4ws.eu
```

Также проверь, что оба nginx site включены:

```bash
ls -la /etc/nginx/sites-enabled
```

Ожидаемо видеть минимум:

```text
four-four-web -> /etc/nginx/sites-available/four-four-web
linkflow -> /etc/nginx/sites-available/linkflow
```

## 18. Как обновлять проект

Когда ты внес изменения в код и отправил их в Git:

```bash
cd /var/www/linkflow/current
git pull
pnpm install --frozen-lockfile
pnpm verify
sudo systemctl restart linkflow
sudo systemctl status linkflow
```

Проверь:

```bash
curl https://flowlinks.org/api/health
```

Если сайт не обновился в браузере, сделай hard refresh:

```text
Ctrl+F5
```

## 19. Backup данных

Сейчас MVP хранит данные в JSON-файле:

```text
/var/www/linkflow/shared/data/linkflow.json
```

Создай папку для backup:

```bash
sudo mkdir -p /var/backups/linkflow
sudo chown -R linkflow:linkflow /var/backups/linkflow
```

Ручной backup:

```bash
sudo cp /var/www/linkflow/shared/data/linkflow.json /var/backups/linkflow/linkflow-$(date +%F-%H%M).json
```

Проверка:

```bash
ls -lh /var/backups/linkflow
```

Автоматический backup каждый день в 03:00:

```bash
sudo crontab -e
```

Добавь строку:

```cron
0 3 * * * cp /var/www/linkflow/shared/data/linkflow.json /var/backups/linkflow/linkflow-$(date +\%F-\%H\%M).json
```

Важно: для большой нагрузки JSON-хранилище надо заменить на PostgreSQL.

## 20. Логи

Логи приложения:

```bash
journalctl -u linkflow -n 100
journalctl -u linkflow -f
```

Логи Nginx:

```bash
sudo tail -n 100 /var/log/nginx/access.log
sudo tail -n 100 /var/log/nginx/error.log
```

Статус сервисов:

```bash
sudo systemctl status linkflow
sudo systemctl status nginx
```

Проверка второго проекта, если он есть на этом VPS:

```bash
cd /opt/four-four-web
docker compose ps
docker compose logs --tail=50
```

Эти команды только читают состояние и логи. Они не перезапускают и не останавливают второй проект.

## 21. Logrotate

Если позже добавишь файловые логи в `/var/log/linkflow`, включи logrotate:

```bash
sudo cp /var/www/linkflow/current/deploy/logrotate/linkflow /etc/logrotate.d/linkflow
sudo logrotate -d /etc/logrotate.d/linkflow
```

## 22. Типовые проблемы

### 502 Bad Gateway

Nginx работает, но Node-приложение не отвечает.

Проверь приложение:

```bash
sudo systemctl status linkflow
journalctl -u linkflow -n 100
```

Проверь порт:

```bash
ss -tulpn | grep 8787
```

Если порт пустой, перезапусти:

```bash
sudo systemctl restart linkflow
journalctl -u linkflow -f
```

Если при этом `f4ws.eu` работает, значит проблема только в FlowLinks. Не трогай Docker-контейнер `four-four-web`.

Проверь, что nginx proxy для FlowLinks смотрит именно на `8787`, а не на `8080`:

```bash
sudo grep -R "proxy_pass" /etc/nginx/sites-available/linkflow
```

Ожидаемо:

```text
proxy_pass http://127.0.0.1:8787;
```

Для `four-four-web` нормально видеть `8080` в его отдельном конфиге.

### `JWT_SECRET is required` или ошибка env

Открой env:

```bash
sudo nano /var/www/linkflow/shared/.env
```

Проверь, что есть:

```env
JWT_SECRET=длинная_случайная_строка
```

Перезапусти:

```bash
sudo systemctl restart linkflow
```

### Certbot не выпускает сертификат

Частые причины:

- DNS еще не указывает на VPS.
- Закрыт порт 80.
- Nginx-конфиг с неправильным `server_name`.

Проверь:

```bash
dig flowlinks.org +short
sudo ufw status
sudo nginx -t
curl -I http://flowlinks.org
```

Потом снова:

```bash
sudo certbot --nginx -d flowlinks.org -d www.flowlinks.org
```

### `pnpm: command not found`

Включи corepack:

```bash
sudo corepack enable
corepack prepare pnpm@latest --activate
```

Если не помогло:

```bash
sudo npm install -g pnpm
```

### `Permission denied` для data или env

Почини права:

```bash
sudo chown -R linkflow:linkflow /var/www/linkflow/shared
sudo chmod 600 /var/www/linkflow/shared/.env
sudo systemctl restart linkflow
```

### После deploy пропали данные

Значит данные лежали внутри папки релиза. Должно быть:

```env
DATA_DIR=/var/www/linkflow/shared/data
```

И файл данных должен быть здесь:

```text
/var/www/linkflow/shared/data/linkflow.json
```

### API не работает с домена

Проверь `CORS_ORIGIN`:

```bash
sudo nano /var/www/linkflow/shared/.env
```

Должно быть:

```env
CORS_ORIGIN=https://flowlinks.org,https://www.flowlinks.org
```

После изменения:

```bash
sudo systemctl restart linkflow
```

## 23. Минимальный запуск без systemd

Это только для проверки, не для постоянного production:

```bash
cd /var/www/linkflow/current
pnpm install --frozen-lockfile
pnpm verify
set -a
source /var/www/linkflow/shared/.env
set +a
node server/index.mjs
```

Для реального сайта используй systemd.

## 24. Что важно понимать

- Nginx принимает интернет-трафик для всех сайтов на VPS.
- Nginx выбирает нужный проект по `server_name`: `flowlinks.org` идет в LinkFlow, `f4ws.eu` идет в `four-four-web`.
- LinkFlow работает только локально на `127.0.0.1:8787`.
- `four-four-web` работает отдельно, обычно на `127.0.0.1:8080` через Docker.
- systemd держит Node.js приложение запущенным.
- `.env` хранит секреты и production-настройки.
- `DATA_DIR` должен быть вне папки Git-репозитория.
- `dist/` создается командой `pnpm build`.
- Для масштабирования нужно заменить JSON-хранилище на PostgreSQL.

## 25. Минимальная схема без конфликтов

```text
Internet
  |
  v
Nginx :80/:443
  |
  |-- server_name f4ws.eu
  |     -> http://127.0.0.1:8080
  |     -> Docker Compose /opt/four-four-web
  |
  |-- server_name flowlinks.org
        -> http://127.0.0.1:8787
        -> systemd service linkflow
        -> /var/www/linkflow/current
```

Если добавляешь новый сайт на тот же VPS, делай так же:

- отдельный домен;
- отдельный локальный порт;
- отдельный nginx site file;
- отдельная папка проекта;
- отдельный systemd service или Docker Compose project name.

