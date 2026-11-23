# VPS deployment

Every push to `main` triggers the CD-only workflow in `.github/workflows/deploy.yml`. It sends that exact revision to the VPS, builds the Docker Compose services, runs the existing migration service, starts the application, worker, and Caddy, then verifies both the internal health endpoint and public HTTPS. No CI or test job is included.

## 1. Prepare the VPS once

Install Docker Engine and the Docker Compose v2 plugin on the VPS using Docker's instructions for your Linux distribution. Create a non-root deploy user, allow it to use Docker, and create the deployment directory. The examples below use `deploy` and `/opt/bourse-collector`:

```bash
sudo useradd --create-home --shell /bin/bash deploy
sudo usermod -aG docker deploy
sudo install -d -o deploy -g deploy /opt/bourse-collector/shared
sudo -u deploy touch /opt/bourse-collector/shared/.env
sudo chmod 600 /opt/bourse-collector/shared/.env
```

Log out and back in after adding the user to the Docker group. Then copy the required application values from `.env.example` into:

```text
/opt/bourse-collector/shared/.env
```

This file stays on the VPS. Do not commit it or add it as a GitHub secret. It may be empty on the first deployment: the workflow automatically adds `POSTGRES_DB`, `POSTGRES_USER`, and a cryptographically random `POSTGRES_PASSWORD` before PostgreSQL starts. It never prints the generated password in the Actions log. AI, search, Telegram, and other provider values remain manual.

PostgreSQL and Redis run inside Compose, so public database or Redis server URLs are not required. Their data lives in persistent Docker named volumes on the VPS, independently of the replaceable containers. Caddy certificate and runtime state similarly live in the `caddy_data` and `caddy_config` volumes. Ordinary deployments and `docker compose down` preserve these volumes; `docker compose down --volumes` deletes them and must not be used in production.

Caddy is included in Compose and automatically obtains and renews the TLS certificate. Ensure the domain's `A` record points to the VPS, then allow inbound TCP ports `80` and `443` (and optionally UDP `443` for HTTP/3) through the provider firewall and VPS firewall. Do not expose `APP_PORT`: Compose binds it to `127.0.0.1` for VPS-local diagnostics only. PostgreSQL and Redis have no host port mappings.

Production defaults to `pbxlab.online`. To use another hostname, create a GitHub Actions repository variable named `APP_DOMAIN`; each deployment stores it in the VPS `.env`. For local Compose use, `APP_DOMAIN` defaults to `localhost`.

## 2. Create a deployment SSH key

Create a dedicated key on your computer. Do not add a passphrase because the non-interactive workflow cannot answer a prompt:

```bash
ssh-keygen -t ed25519 -C "github-actions-bourse-collector" -f ./bourse_collector_deploy
ssh-copy-id -i ./bourse_collector_deploy.pub deploy@YOUR_VPS_HOST
```

If `ssh-copy-id` is unavailable, append the contents of `bourse_collector_deploy.pub` to `/home/deploy/.ssh/authorized_keys` on the VPS and use permissions `700` for `.ssh` and `600` for `authorized_keys`.

## 3. Add GitHub repository secrets

In the GitHub repository, open **Settings → Secrets and variables → Actions → New repository secret** and add:

| Secret                | Value                                                      |
| --------------------- | ---------------------------------------------------------- |
| `VPS_HOST`            | VPS hostname or IP address                                 |
| `VPS_USER`            | `deploy`                                                   |
| `VPS_PORT`            | SSH port, normally `22`                                    |
| `VPS_DEPLOY_PATH`     | `/opt/bourse-collector`                                    |
| `VPS_SSH_PRIVATE_KEY` | Full contents of the private key `bourse_collector_deploy` |
| `VPS_KNOWN_HOSTS`     | Verified SSH host-key line for the VPS                     |

Obtain the known-host line from a trusted machine:

```bash
ssh-keyscan -H -p 22 YOUR_VPS_HOST
```

Before saving it, compare its fingerprint with the VPS host fingerprint shown by your provider or by `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` on the VPS. If a non-default port is used, place that same port in `VPS_PORT`.

## 4. Deploy

Push the repository to GitHub with the production branch named `main`. Every later push to `main` deploys automatically:

```bash
git push origin main
```

Follow the run under the repository's **Actions** tab. Releases are stored under `/opt/bourse-collector/releases/<commit-sha>`, while `/opt/bourse-collector/current` points to the active one. The workflow restores the previous application release if Compose startup or the health check fails.

Database migrations are deliberately not reversed during rollback. Keep schema migrations backward-compatible with the previous application release. PostgreSQL and Redis data remain in Docker named volumes across deployments. If a PostgreSQL volume has already been initialized and its three database variables are later removed from the VPS `.env`, deployment stops instead of generating incompatible replacement credentials.

Useful VPS commands:

```bash
cd /opt/bourse-collector/current
docker compose ps
docker compose logs -f app worker caddy
curl --fail https://pbxlab.online/api/health
```
