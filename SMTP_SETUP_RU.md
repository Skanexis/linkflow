# Настройка SMTP для подтверждения email в LinkFlow

Цель: письма подтверждения регистрации должны стабильно доходить до Gmail/Outlook/Yahoo/Mail.ru/Yandex и не уходить в спам без причины.

Важно: нельзя гарантировать 100% попадание во входящие. Но можно сделать правильную техническую настройку: SMTP-провайдер с хорошей репутацией, SPF, DKIM, DMARC, корректный `MAIL_FROM`, нормальный текст письма и аккуратная отправка без спама.

## Лучший бесплатный вариант

Рекомендую **Brevo**.

Почему:

- бесплатный план: **300 email/day**;
- есть transactional emails и SMTP;
- подходит для email confirmation, password reset, notifications;
- не требует поднимать свой SMTP на VPS;
- проще и безопаснее, чем отправлять письма напрямую с сервера.

Официальные страницы:

- Brevo free plan: https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- Brevo SMTP: https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP
- Brevo domain authentication: https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-DMARC

Альтернатива: **Resend**.

Resend проще для разработчиков, но бесплатный лимит меньше: **3,000 emails/month** и **100 emails/day**. Если этого достаточно, Resend тоже хороший выбор.

- Resend pricing: https://resend.com/pricing
- Resend SMTP: https://resend.com/features/smtp-service

Для этого проекта я бы начал с **Brevo**.

## Что понадобится

1. Домен, например `flowlinks.org`.
2. Доступ к DNS домена: Cloudflare, REG.RU, Namecheap, GoDaddy, панели хостинга и т.д.
3. Аккаунт Brevo.
4. Доступ к `.env.production` на сервере.
5. Перезапуск backend после изменения env.

Не используй `gmail.com`, `mail.ru`, `yandex.ru` как отправителя. Нужен адрес на твоем домене:

```txt
no-reply@flowlinks.org
```

## Общая схема

Пользователь регистрируется -> backend создает verification token -> backend отправляет письмо через Brevo SMTP -> пользователь кликает ссылку -> backend ставит `emailVerifiedAt` -> пользователь может войти.

В коде проекта уже используются эти переменные:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
MAIL_FROM_NAME=
APP_URL=
API_PUBLIC_URL=
EMAIL_VERIFICATION_TTL_HOURS=
```

## Шаг 1. Зарегистрироваться в Brevo

1. Открой https://www.brevo.com/
2. Создай аккаунт.
3. Подтверди свой email.
4. Зайди в dashboard.

## Шаг 2. Добавить домен в Brevo

В Brevo:

1. Открой `Settings`.
2. Перейди в `Senders, Domains, IPs`.
3. Открой `Domains`.
4. Нажми `Add a domain`.
5. Введи домен, например:

```txt
flowlinks.org
```

Если хочешь изолировать отправку писем приложения, можно использовать subdomain:

```txt
mail.flowlinks.org
```

Но для начала проще использовать основной домен `flowlinks.org`.

## Шаг 3. Добавить DNS-записи Brevo

Brevo покажет DNS-записи для подтверждения домена. Их надо добавить у DNS-провайдера.

Обычно Brevo даст:

- Brevo verification TXT;
- DKIM record: TXT или 2 CNAME;
- DMARC TXT.

Не выдумывай значения вручную. Копируй ровно те записи, которые показывает Brevo.

Примерно это выглядит так:

```dns
TYPE: TXT
NAME: @
VALUE: brevo-code:xxxxxxxx
```

```dns
TYPE: CNAME
NAME: sib1._domainkey
VALUE: xxxx.dkim.brevo.com
```

```dns
TYPE: CNAME
NAME: sib2._domainkey
VALUE: xxxx.dkim.brevo.com
```

```dns
TYPE: TXT
NAME: _dmarc
VALUE: v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com
```

Точные `NAME` и `VALUE` бери из Brevo.

## Шаг 4. Важные правила DNS

### SPF

У домена должен быть только **один** SPF record.

Плохо:

```dns
flowlinks.org TXT "v=spf1 include:_spf.google.com ~all"
flowlinks.org TXT "v=spf1 include:spf.brevo.com ~all"
```

Хорошо:

```dns
flowlinks.org TXT "v=spf1 include:_spf.google.com include:spf.brevo.com ~all"
```

Если Brevo не просит SPF для обычной shared-IP отправки, не добавляй лишний SPF. Следуй инструкциям Brevo. Для DMARC обычно критичнее, чтобы DKIM проходил и был aligned с доменом From.

### DKIM

DKIM должен быть включен и показывать `pass`.

Лучше использовать 2048-bit DKIM, если провайдер это поддерживает. У Brevo CNAME DKIM обычно нормальный вариант.

### DMARC

У домена должен быть только **один** DMARC record:

```dns
_dmarc.flowlinks.org TXT "v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com"
```

Начинай с:

```txt
p=none
```

Когда все письма стабильно проходят SPF/DKIM/DMARC, можно перейти на:

```txt
p=quarantine
```

Потом:

```txt
p=reject
```

Не ставь сразу `p=reject`, если не уверен, что все легитимные источники писем настроены.

## Шаг 5. Дождаться подтверждения домена

DNS может применяться от нескольких минут до 48 часов.

Проверить DNS можно в PowerShell:

```powershell
Resolve-DnsName flowlinks.org TXT
Resolve-DnsName _dmarc.flowlinks.org TXT
Resolve-DnsName sib1._domainkey.flowlinks.org CNAME
Resolve-DnsName sib2._domainkey.flowlinks.org CNAME
```

Также можно проверить через:

- https://mxtoolbox.com/
- https://www.mail-tester.com/

В Brevo нажми проверку/verify domain. Домен должен стать authenticated.

## Шаг 6. Создать SMTP key в Brevo

В Brevo:

1. Открой `SMTP & API`.
2. Открой `SMTP`.
3. Скопируй SMTP server.
4. Скопируй login.
5. Создай или скопируй SMTP key/password.

Для Brevo обычно:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
```

`SMTP_USER` и `SMTP_PASS` бери из Brevo. Не используй пароль от аккаунта Brevo.

## Шаг 7. Настроить `.env.production`

На сервере в production env должно быть примерно так:

```env
NODE_ENV=production
PORT=8787

APP_URL=https://flowlinks.org
API_PUBLIC_URL=https://flowlinks.org

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=YOUR_BREVO_SMTP_LOGIN
SMTP_PASS=YOUR_BREVO_SMTP_KEY

MAIL_FROM=no-reply@flowlinks.org
MAIL_FROM_NAME=LinkFlow
EMAIL_VERIFICATION_TTL_HOURS=24
```

Если используешь subdomain:

```env
MAIL_FROM=no-reply@mail.flowlinks.org
```

Тогда именно `mail.flowlinks.org` должен быть authenticated в Brevo.

## Шаг 8. Перезапустить backend

Если приложение работает через systemd:

```bash
sudo systemctl restart linkflow
sudo systemctl status linkflow --no-pager
```

Посмотреть логи:

```bash
sudo journalctl -u linkflow -n 100 --no-pager
```

Если SMTP не настроен в production, backend должен вернуть ошибку отправки письма. Это правильно: в production нельзя молча создавать аккаунты без отправки verification email.

## Шаг 9. Проверить регистрацию

1. Открой сайт.
2. Зарегистрируй новый аккаунт на реальный email.
3. Не входи сразу.
4. Проверь почту.
5. Нажми verification link.
6. После редиректа войди в аккаунт.

До подтверждения login должен быть заблокирован.

## Шаг 10. Проверить, что письмо не спам

Отправь письмо на Gmail.

В Gmail:

1. Открой письмо.
2. Нажми `More`.
3. Нажми `Show original`.

Должно быть:

```txt
SPF: PASS
DKIM: PASS
DMARC: PASS
```

Если хоть одно `FAIL`, письма могут уходить в спам или отклоняться.

Проверь также через:

```txt
https://www.mail-tester.com/
```

Там будет оценка и конкретные проблемы.

## Шаг 11. Настроить Google Postmaster Tools

Для Gmail-доставляемости добавь домен в:

```txt
https://postmaster.google.com/
```

Там можно смотреть:

- domain reputation;
- IP reputation;
- spam rate;
- authentication;
- delivery errors.

Google рекомендует держать spam rate ниже `0.3%`.

## Что делать, чтобы не попадать в спам

Обязательно:

- SPF/DKIM/DMARC должны проходить.
- `MAIL_FROM` должен быть на твоем домене.
- `From` не должен быть `gmail.com`, `mail.ru`, `yandex.ru`.
- Subject без капса и спам-слов.
- Письмо должно быть коротким и понятным.
- Не добавляй сокращатели ссылок.
- Verification link должен вести на твой домен, например `https://flowlinks.org/api/auth/verify-email?...`.
- Не отправляй письма пользователям, которые не просили регистрацию.
- Не делай массовую рассылку с transactional домена без unsubscribe.

Хороший subject:

```txt
Confirm your LinkFlow email
```

Плохой subject:

```txt
СРОЧНО!!! ПОДТВЕРДИ АККАУНТ И ПОЛУЧИ БОНУС!!!
```

## Warm-up домена

Если домен новый, не отправляй сразу много писем.

Примерный безопасный старт:

- день 1: до 20-50 писем;
- день 2-3: до 100 писем;
- дальше постепенно.

Для verification emails объем обычно небольшой, поэтому проблем быть не должно.

## Частые ошибки

### Ошибка: письма не приходят вообще

Проверь:

```bash
sudo journalctl -u linkflow -n 100 --no-pager
```

Проверь `.env.production`:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=no-reply@flowlinks.org
```

Проверь, что порт `587` не заблокирован на VPS.

### Ошибка: domain not authenticated

Проверь DNS. Часто проблема в том, что DNS-провайдер сам добавляет домен к `NAME`.

Например, если Brevo просит:

```txt
sib1._domainkey
```

В DNS-панели обычно надо писать именно:

```txt
sib1._domainkey
```

А не:

```txt
sib1._domainkey.flowlinks.org
```

Зависит от DNS-панели.

### Ошибка: SPF permerror

Скорее всего:

- больше одного SPF record;
- SPF делает больше 10 DNS lookup;
- неправильный include.

Оставь один SPF record.

### Ошибка: DMARC fail

Причина обычно:

- DKIM не проходит;
- домен в `From` не совпадает с authenticated domain;
- MAIL_FROM использует не тот домен;
- у домена несколько DMARC records.

## Если выбираешь Resend вместо Brevo

`.env.production` будет примерно такой:

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=resend
SMTP_PASS=re_xxxxxxxxxxxxxxxxx

MAIL_FROM=no-reply@flowlinks.org
MAIL_FROM_NAME=LinkFlow
APP_URL=https://flowlinks.org
API_PUBLIC_URL=https://flowlinks.org
EMAIL_VERIFICATION_TTL_HOURS=24
```

В Resend тоже нужно добавить домен и скопировать DNS-записи для SPF/DKIM/DMARC из dashboard.

## Финальный чеклист

- [ ] Домен куплен.
- [ ] Brevo аккаунт создан.
- [ ] Домен добавлен в Brevo.
- [ ] DNS-записи из Brevo добавлены.
- [ ] В Brevo домен authenticated.
- [ ] В `.env.production` заполнены SMTP переменные.
- [ ] `MAIL_FROM` использует authenticated domain.
- [ ] Backend перезапущен.
- [ ] Тестовая регистрация отправляет письмо.
- [ ] До подтверждения email пользователь не может войти.
- [ ] Gmail `Show original` показывает SPF/DKIM/DMARC PASS.
- [ ] Mail-tester показывает хороший score.

## Источники

- Google sender guidelines: https://support.google.com/a/answer/81126
- Microsoft Outlook high-volume sender requirements: https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730
- Brevo pricing/free plan: https://help.brevo.com/hc/en-us/articles/208589409-About-Brevo-s-pricing-plans
- Brevo SMTP: https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP
- Brevo domain authentication: https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-DMARC
- Resend pricing: https://resend.com/pricing
- Resend SMTP: https://resend.com/features/smtp-service
