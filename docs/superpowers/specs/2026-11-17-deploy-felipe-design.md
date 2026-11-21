# Deploy site-agencia no servidor Felipe — Design

**Data:** 2026-11-17  
**Status:** aprovado

## Intent

Publicar o Jornal Marabá (`site-agencia`) na VPS Felipe (`216.22.5.57`) com HTTPS atrás do Nginx, Postgres local e processo Node gerenciado por systemd. O DNS (subdomínio no Cloudflare) fica a cargo do operador.

## Goals

- Site e painel `/admin` acessíveis pelo hostname configurado no Cloudflare
- App reinicia sozinho após reboot (systemd)
- Uploads persistentes em `data/uploads/`
- Seguir o guia existente `DEPLOY.md`

## Non-goals

- Alterar código do app
- Dockerizar a stack
- E-mail no Fale Conosco
- Agendar backups (pode ser follow-up)

## Anti-goals

- Expor Node ou Postgres diretamente na internet
- Deploy sem `AUTH_SECRET` / sem HTTPS (painel depende de cookie seguro)

## Constraints

- Servidor: Ubuntu/Debian em `216.22.5.57`, acesso root SSH porta 22
- Stack: Node 22 LTS, PostgreSQL 14+, Nginx, Certbot
- Hostname: informado pelo operador antes do vhost/Certbot (variável `DOMAIN`)
- Senhas de banco/admin geradas no deploy; não reutilizar segredos de desenvolvimento sem decisão explícita

## Approaches

1. **Host nativo (DEPLOY.md)** — escolhido: rsync + Postgres + systemd + Nginx + Certbot  
2. Docker — descartado: sem stack pronta, mais complexidade  
3. Export estático — inviável: precisa de runtime Node + Postgres

## Design

| Peça | Valor |
|---|---|
| App dir | `/var/www/jornal` |
| User do processo | `jornal` (sem sudo necessário no dia a dia) |
| DB | user/db `jornal`, só localhost |
| Env | `/var/www/jornal/.env.local` (chmod 600) |
| Processo | `jornal.service` → `npm run start -- -H 127.0.0.1` porta 3000 |
| Proxy | Nginx `sites-available/jornal`, `client_max_body_size 10m` |
| TLS | Certbot `--nginx` após DNS A apontar para `216.22.5.57` |

Scripts de apoio em `config-ubuntu-docker/scripts-site-agencia/` (padrão dos outros deploys).

## Builder calls

- Nome do serviço systemd: `jornal`
- Porta interna: `3000` em `127.0.0.1`
- `ADMIN_USER=admin` na criação; senha forte gerada no deploy e entregue ao operador
