# Deploy site-agencia no Felipe — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colocar o site-agencia no ar em `https://DOMAIN` no servidor Felipe `216.22.5.57`.

**Architecture:** Preparar o host (Node 22, Postgres, Nginx, usuário `jornal`), enviar o código por rsync, criar `.env.local` e o serviço systemd, configurar Nginx como proxy para `127.0.0.1:3000` e emitir certificado com Certbot depois do DNS.

**Tech Stack:** Next.js 15, Node 22, PostgreSQL, Nginx, systemd, Certbot, rsync/SSH

**Spec:** `docs/superpowers/specs/2026-11-17-deploy-felipe-design.md`

## Global Constraints

- Servidor: `216.22.5.57`, user `root`, porta `22` (credenciais em `config-ubuntu-docker/config.md`)
- Código fonte local: `F:\laragon\www\site-agencia`
- Destino remoto: `/var/www/jornal`
- `DOMAIN` obrigatório (hostname Cloudflare) antes das tasks de Nginx/Certbot
- Não abrir porta 5432 nem 3000 no firewall; só 22/80/443
- Não commitar `.env.local` nem senhas geradas
- Seguir `DEPLOY.md` do projeto; não alterar código da aplicação

## Review Focus

- `.env.local` ausente ou `AUTH_SECRET` curto → painel `/admin` quebra
- Nginx sem `client_max_body_size 10m` → upload de foto falha
- Acesso só por HTTP → cookie de login não funciona em produção
- Postgres/URL com caracteres especiais `@ : / ? #` → `DATABASE_URL` quebra
- Serviço escutando `0.0.0.0:3000` → Node exposto; deve ser `127.0.0.1`

## File Structure

- Create: `F:\laragon\www\config-ubuntu-docker\scripts-site-agencia\jornal.conf` — vhost Nginx (placeholder `DOMAIN`)
- Create: `F:\laragon\www\config-ubuntu-docker\scripts-site-agencia\jornal.service` — unit systemd
- Create: `F:\laragon\www\config-ubuntu-docker\scripts-site-agencia\setup-remote.sh` — Node, Postgres, user, dirs, firewall
- Create: `F:\laragon\www\config-ubuntu-docker\scripts-site-agencia\deploy-remote.sh` — extract/env/build/systemd/nginx
- Create: `F:\laragon\www\config-ubuntu-docker\scripts-site-agencia\deploy-local.ps1` — empacota, SCP, SSH, orquestra

---

### Task 1: Confirmar DOMAIN e gerar segredos locais

**Files:**
- Create (temporário, não versionar): valores em memória / saída do operador

**Interfaces:**
- Produces: `DOMAIN` (string FQDN); `DB_PASS`, `ADMIN_PASSWORD`, `AUTH_SECRET` (hex/random fortes, sem `@ : / ? #` na senha do banco)

- [ ] **Step 1: Obter `DOMAIN` do operador** (único hostname Cloudflare A → `216.22.5.57`)

- [ ] **Step 2: Gerar segredos**

```powershell
# DB_PASS e ADMIN_PASSWORD: alfanuméricos longos sem @:/?#
# AUTH_SECRET: openssl rand -hex 32 (ou equivalente PowerShell)
```

- [ ] **Step 3: Anotar os três valores para entregar ao operador no final (não gravar em git)**

---

### Task 2: Scripts de deploy em config-ubuntu-docker

**Files:**
- Create: `config-ubuntu-docker/scripts-site-agencia/jornal.conf`
- Create: `config-ubuntu-docker/scripts-site-agencia/jornal.service`
- Create: `config-ubuntu-docker/scripts-site-agencia/setup-remote.sh`
- Create: `config-ubuntu-docker/scripts-site-agencia/deploy-remote.sh`
- Create: `config-ubuntu-docker/scripts-site-agencia/deploy-local.ps1`

**Interfaces:**
- Consumes: `DOMAIN`, `DB_PASS`, `ADMIN_PASSWORD`, `AUTH_SECRET`
- Produces: scripts idempotentes que deixam `jornal.service` ativo e Nginx com `server_name DOMAIN`

- [ ] **Step 1: Criar `jornal.conf`** — `listen 80`; `server_name DOMAIN`; `client_max_body_size 10m`; `proxy_pass http://127.0.0.1:3000` com headers Host/X-Real-IP/X-Forwarded-For/X-Forwarded-Proto

- [ ] **Step 2: Criar `jornal.service`** — User=`jornal`; WorkingDirectory=`/var/www/jornal`; `Environment=NODE_ENV=production` e `PORT=3000`; `ExecStart=/usr/bin/npm run start -- -H 127.0.0.1`; Restart=always

- [ ] **Step 3: Criar `setup-remote.sh`** — apt (nginx, ufw, curl, git, postgresql); NodeSource 22; user `jornal`; DB/user `jornal` com `DB_PASS`; `/var/www/jornal` owned by `jornal`; ufw OpenSSH + Nginx Full

- [ ] **Step 4: Criar `deploy-remote.sh`** — extrai tarball em `/var/www/jornal` preservando `data/uploads` se existir; escreve `.env.local`; `npm ci` + `npm run build` como user `jornal`; instala unit + nginx site; `systemctl enable --now jornal`; `nginx -t && reload`

- [ ] **Step 5: Criar `deploy-local.ps1`** — tar/rsync exclude `node_modules`, `.next`, `.env.local`, `data` (ou inclui data vazia); scp scripts + archive; ssh root executa setup + deploy com env vars

---

### Task 3: Preparar o servidor Felipe

**Files:**
- Remote only via `setup-remote.sh`

**Interfaces:**
- Consumes: scripts da Task 2, `DB_PASS`
- Produces: Node 22, Postgres com db `jornal`, user OS `jornal`, Nginx/UFW prontos

- [ ] **Step 1: SSH root@216.22.5.57 e rodar `setup-remote.sh` com `DB_PASS`**

- [ ] **Step 2: Verificar**

Run: `ssh root@216.22.5.57 "node -v; systemctl is-active postgresql nginx; sudo -u jornal psql \"postgresql://jornal:DB_PASS@localhost:5432/jornal\" -c 'select 1'"`
Expected: Node v22.x; postgresql/nginx active; `?column?` = 1

---

### Task 4: Enviar app, build e systemd

**Files:**
- Remote: `/var/www/jornal/*`, `/var/www/jornal/.env.local`, `/etc/systemd/system/jornal.service`

**Interfaces:**
- Consumes: archive local, `DOMAIN` (ainda não obrigatório aqui), segredos
- Produces: build `.next` ok; `jornal.service` listening em `127.0.0.1:3000`

- [ ] **Step 1: Empacotar e enviar código + rodar `deploy-remote.sh` (parte app/systemd)**

- [ ] **Step 2: Verificar processo**

Run: `ssh root@216.22.5.57 "systemctl is-active jornal; curl -sI http://127.0.0.1:3000/ | head -5"`
Expected: `active`; HTTP 200 (ou 307/308 do Next)

- [ ] **Step 3: Verificar bind**

Run: `ss -lntp | grep 3000`
Expected: `127.0.0.1:3000` apenas (não `0.0.0.0`)

---

### Task 5: Nginx + DNS + HTTPS

**Files:**
- Remote: `/etc/nginx/sites-available/jornal`, symlink em `sites-enabled`

**Interfaces:**
- Consumes: `DOMAIN` com registro A no Cloudflare → `216.22.5.57` (proxy Cloudflare pode ficar DNS only no início do Certbot, ou usar modo compatível)
- Produces: `https://DOMAIN` e `https://DOMAIN/admin` funcionando

- [ ] **Step 1: Confirmar DNS**

Run: `Resolve-DnsName DOMAIN` (ou `dig +short DOMAIN`)
Expected: `216.22.5.57` (ou IPs do Cloudflare se proxy laranja — nesse caso Certbot HTTP-01 precisa DNS only ou Cloudflare API; preferir DNS only na emissão)

- [ ] **Step 2: Ativar vhost Nginx com `server_name DOMAIN` e reload**

- [ ] **Step 3: Smoke HTTP pelo Host header**

Run: `curl -sI -H "Host: DOMAIN" http://127.0.0.1/ | head -10`
Expected: 200/30x do app (não 502)

- [ ] **Step 4: Certbot**

Run: `certbot --nginx -d DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect`
Expected: certificado emitido; redirect HTTP→HTTPS

- [ ] **Step 5: Smoke HTTPS externo**

Run: `curl -sI https://DOMAIN/ | head -10` e abrir `/admin` (login com `ADMIN_USER`/`ADMIN_PASSWORD` gerados)
Expected: 200; painel autentica

---

### Task 6: Entrega ao operador

**Files:** none

- [ ] **Step 1: Entregar** URL do site, URL `/admin`, `ADMIN_USER`, `ADMIN_PASSWORD` (única vez), lembrete de trocar senha no painel, e comando de update (`git/rsync` + `npm ci` + `npm run build` + `systemctl restart jornal`)

- [ ] **Step 2: Confirmar que nenhum segredo foi commitado** (`git status` em `site-agencia` e `config-ubuntu-docker`)
