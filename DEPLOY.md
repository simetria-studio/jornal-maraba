# Deploy do Jornal Marabá em uma VPS Linux

Guia para Ubuntu 22.04/24.04 (ou Debian 12). Resultado: site rodando em `https://seudominio.com.br`, painel em `/admin`, PostgreSQL local, Nginx com HTTPS e o app reiniciando sozinho.

Onde aparecer `seudominio.com.br`, `SENHA_DO_BANCO` e `usuario_deploy`, troque pelos seus valores.

## O que o app precisa

| Item | Detalhe |
|---|---|
| Node.js | 20 ou 22 (LTS) |
| PostgreSQL | 14 ou mais novo |
| Disco persistente | `data/uploads/` guarda as fotos enviadas pelo painel |
| Memória | 1 GB basta para começar |

As tabelas, o primeiro administrador e as matérias de exemplo são criados sozinhos no primeiro acesso. Não há migração para rodar.

---

## 1. Preparar o servidor

Entre como root (ou com sudo) e crie um usuário para o app:

```bash
adduser usuario_deploy
usermod -aG sudo usuario_deploy
```

Atualize o sistema e ligue o firewall (libera só SSH e web):

```bash
apt update && apt upgrade -y
apt install -y ufw curl git nginx
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## 2. Instalar o Node.js 22

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # deve mostrar v22.x
```

## 3. Instalar e configurar o PostgreSQL

```bash
sudo apt install -y postgresql
sudo -u postgres psql
```

Dentro do `psql`:

```sql
CREATE USER jornal WITH PASSWORD 'SENHA_DO_BANCO';
CREATE DATABASE jornal OWNER jornal;
\q
```

Use uma senha forte e sem os caracteres `@ : / ? #` (eles quebram a URL de conexão). Teste:

```bash
psql "postgresql://jornal:SENHA_DO_BANCO@localhost:5432/jornal" -c "select 1"
```

O Postgres já escuta só em `localhost` por padrão. Não abra a porta 5432 no firewall.

## 4. Colocar o código no servidor

Como `usuario_deploy`:

```bash
sudo mkdir -p /var/www/jornal && sudo chown usuario_deploy: /var/www/jornal
cd /var/www/jornal
git clone URL_DO_REPOSITORIO .
```

Sem repositório git, envie a pasta do projeto (sem `node_modules`, `.next` e `data`):

```bash
rsync -av --exclude node_modules --exclude .next --exclude data --exclude .env.local \
  ./ usuario_deploy@IP_DA_VPS:/var/www/jornal/
```

## 5. Variáveis de ambiente

Crie `/var/www/jornal/.env.local`:

```bash
nano /var/www/jornal/.env.local
```

```env
DATABASE_URL=postgresql://jornal:SENHA_DO_BANCO@localhost:5432/jornal
ADMIN_USER=admin
ADMIN_PASSWORD=uma-senha-forte-para-o-primeiro-acesso
AUTH_SECRET=cole-aqui-uma-frase-aleatoria-com-mais-de-32-caracteres
```

Para gerar o `AUTH_SECRET`:

```bash
openssl rand -hex 32
```

Regras importantes:

- `AUTH_SECRET` é obrigatório em produção (mínimo de 16 caracteres). Sem ele o painel não abre. Se você trocar depois, todo mundo é deslogado.
- `ADMIN_USER` e `ADMIN_PASSWORD` só valem **na criação do primeiro administrador**. Depois, gerencie usuários e senhas pelo painel (`/admin/usuarios`).
- Proteja o arquivo: `chmod 600 /var/www/jornal/.env.local`.
- Se o Postgres for de um provedor externo que exige SSL, acrescente `DATABASE_SSL=true`.

## 6. Instalar, compilar e testar

```bash
cd /var/www/jornal
npm ci
npm run build
npm run start   # teste: abre em http://IP_DA_VPS:3000 (Ctrl+C para parar)
```

Se subiu sem erro, siga para o próximo passo. Se o build reclamar de `DATABASE_URL`, confira o `.env.local`.

## 7. Manter o app rodando (systemd)

Crie o serviço:

```bash
sudo nano /etc/systemd/system/jornal.service
```

```ini
[Unit]
Description=Jornal Maraba (Next.js)
After=network.target postgresql.service

[Service]
Type=simple
User=usuario_deploy
WorkingDirectory=/var/www/jornal
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start -- -H 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

`-H 127.0.0.1` faz o app aceitar conexões só do próprio servidor; quem fala com a internet é o Nginx.

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now jornal
sudo systemctl status jornal
journalctl -u jornal -f      # logs ao vivo
```

## 8. Nginx como proxy reverso

```bash
sudo nano /etc/nginx/sites-available/jornal
```

```nginx
server {
    listen 80;
    server_name seudominio.com.br www.seudominio.com.br;

    # Fotos de até 8 MB (o painel envia por formulário)
    client_max_body_size 10m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/jornal /etc/nginx/sites-enabled/jornal
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Sem o `client_max_body_size`, o Nginx recusa upload acima de 1 MB e a foto não é salva.

## 9. DNS e HTTPS

1. No painel do seu domínio, crie registros **A** apontando `seudominio.com.br` e `www` para o IP da VPS.
2. Quando o DNS propagar, emita o certificado:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com.br -d www.seudominio.com.br
```

A renovação é automática. Teste com `sudo certbot renew --dry-run`.

O cookie de login só é enviado por HTTPS em produção, então o painel **não funciona** em `http://`. Confirme o HTTPS antes de entrar em `/admin`.

## 10. Primeiro acesso

1. Abra `https://seudominio.com.br/admin`.
2. Entre com `ADMIN_USER` e `ADMIN_PASSWORD`.
3. Em **Usuários**, crie as contas da redação (papel **Editor** para quem só escreve) e troque a senha do administrador.

## 11. Backups

Há dois itens para guardar: o banco e as fotos.

```bash
sudo mkdir -p /var/backups/jornal && sudo chown usuario_deploy: /var/backups/jornal
crontab -e
```

Acrescente (todo dia às 3h, guarda 14 dias):

```cron
0 3 * * * pg_dump "postgresql://jornal:SENHA_DO_BANCO@localhost:5432/jornal" | gzip > /var/backups/jornal/banco-$(date +\%F).sql.gz && tar czf /var/backups/jornal/fotos-$(date +\%F).tgz -C /var/www/jornal/data uploads && find /var/backups/jornal -mtime +14 -delete
```

Copie essa pasta para fora da VPS (outro servidor, bucket ou seu computador). Backup que mora só no mesmo disco não protege contra perda do servidor.

Restaurar o banco:

```bash
gunzip -c banco-AAAA-MM-DD.sql.gz | psql "postgresql://jornal:SENHA_DO_BANCO@localhost:5432/jornal"
```

## 12. Atualizar o site

```bash
cd /var/www/jornal
git pull
npm ci
npm run build
sudo systemctl restart jornal
```

Faça isso fora do horário de pico: entre o `build` e o `restart` o site continua servindo a versão antiga, mas o restart leva alguns segundos.

---

## Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| 502 Bad Gateway | App parado | `systemctl status jornal` e `journalctl -u jornal -n 50` |
| Painel volta para o login sem erro | Acesso por `http://` | Use HTTPS (passo 9) |
| Erro `AUTH_SECRET` ao abrir `/admin` | Variável ausente ou curta | Corrija o `.env.local` e `systemctl restart jornal` |
| Erro `DATABASE_URL` / `ECONNREFUSED` | Postgres parado ou URL errada | `systemctl status postgresql` e teste com `psql` (passo 3) |
| Foto não sobe | Limite do Nginx | Confira `client_max_body_size 10m` e recarregue o Nginx |
| `Cannot find module './887.js'` | Pasta `.next` corrompida | `rm -rf .next && npm run build && systemctl restart jornal` |
| Esqueceu a senha do admin | — | Outro administrador redefine em `/admin/usuarios`. Se for o único, veja abaixo |

### Redefinir a senha de um administrador pelo servidor

Gere o hash e grave no banco:

```bash
cd /var/www/jornal
node -e '
const c=require("crypto"),s=c.randomBytes(16).toString("hex");
console.log(s+":"+c.scryptSync(process.argv[1],s,64).toString("hex"))
' 'NOVA_SENHA_AQUI'
```

```bash
psql "postgresql://jornal:SENHA_DO_BANCO@localhost:5432/jornal" \
  -c "UPDATE usuarios SET senha_hash='COLE_O_HASH_AQUI' WHERE usuario='admin'"
```

## Observações

- **Um único servidor:** o limite de tentativas de login fica na memória do processo. Com mais de uma instância do app, ele deixa de ser compartilhado.
- **E-mail:** o Fale Conosco só grava as mensagens no painel (aba Mensagens). Não envia e-mail.
- **Segurança:** mantenha o sistema atualizado (`apt upgrade`), use login por chave SSH e desative o login SSH por senha.
