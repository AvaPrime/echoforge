# WSL2 Development Setup for EchoForge

This guide helps you transition from Windows to WSL2 development to resolve symlink issues, improve performance, and provide a more consistent development experience.

---

## Why WSL2?

- **Symlinks work natively** – No more `EPERM` errors with Next.js `output: 'standalone'`
- **Better performance** – Faster file watching, installs, and builds when working in the Linux filesystem
- **Native toolchain** – Linux-native Node.js, PNPM, and shell utilities
- **Docker integration** – First-class Docker Desktop + WSL2 backend support
- **IDE support** – VS Code Remote-WSL and JetBrains WSL integrations

---

## One-Time Setup

### 1. Install WSL2 + Ubuntu

Run in **PowerShell as Administrator**:

```powershell
wsl --install -d Ubuntu-22.04
wsl -l -v
wsl --set-default Ubuntu-22.04
```

If Ubuntu is not listed, the first command will install it.

---

### 2. Configure Ubuntu Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git curl unzip

# Install Node.js via nvm
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 22        # or your preferred LTS version
nvm alias default 22  # make it default
node -v

# Enable and pin pnpm
corepack enable
corepack prepare pnpm@10.14.0 --activate
pnpm -v

# Install Playwright dependencies (if using e2e tests)
pnpm dlx playwright install --with-deps
# Optional: Explicit apt packages for Playwright stability
sudo apt-get install -y \
  libnss3 libnspr4 libdrm2 libgbm1 libasound2 \
  libxkbcommon0 libxcomposite1 libxrandr2 libxdamage1 libxfixes3 \
  libgtk-3-0 libpango-1.0-0 libcairo2 libatspi2.0-0
```

---

### 3. Configure WSL Settings

#### Windows-side: `.wslconfig`

Create `C:\Users\<YOUR_WINDOWS_USER>\.wslconfig`:

```ini
[wsl2]
memory=8GB
processors=4
# networkingMode=mirrored
# localhostForwarding=true
```

Apply changes:

```powershell
wsl --shutdown
```

#### Ubuntu-side: `/etc/wsl.conf`

```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true

[automount]
enabled=true
options=metadata,umask=22,fmask=11

[network]
generateResolvConf=true
EOF

# Restart WSL
wsl --shutdown
```

---

### 4. Clone Repository in Linux Filesystem

⚠ **Important**: Clone inside the Linux FS (`/home/...`), **NOT** on Windows mounts (`/mnt/c/...`) for best performance.

```bash
mkdir -p ~/dev && cd ~/dev
git clone <your-repo-url> echoforge
cd echoforge
pnpm install
pnpm -w build
```

---

## IDE Configuration

### VS Code

1. Install **Remote - WSL** extension.
2. Open Ubuntu terminal:

   ```bash
   cd ~/dev/echoforge
   code .
   ```

3. Extensions will install in WSL context automatically.

### JetBrains IDEs

1. Go to **Settings → Build Tools → WSL**.
2. Configure Node interpreter to use WSL2.

---

## Docker Setup (Optional)

1. Install Docker Desktop.
2. **Settings → Use the WSL 2 based engine**.
3. Enable integration for your Ubuntu distro.
4. Mount volumes from `/home/...` for best performance.

---

## Performance Optimizations

### Increase File Watchers

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
echo fs.inotify.max_user_instances=512 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Git Configuration

```bash
git config --global core.autocrlf input
git config --global core.filemode false
git config --global credential.helper store
# or use GitHub CLI
# gh auth login
```

### PNPM Store Fix (if permissions break)

```bash
pnpm store prune
pnpm config set store-dir ~/.pnpm-store
```

---

## EchoForge-Specific Benefits

### Dashboard App

- Next.js `output: 'standalone'` builds will work without `EPERM` errors.
- Docker builds copying `.next/standalone` will be reliable.
- Symlinks in `node_modules` work correctly.

### Development Workflow

```bash
pnpm -w build
pnpm -w test
pnpm -w e2e
pnpm -F @echoforge/dashboard dev
```

---

## Environment Check Script

We provide a script to verify your environment:

**`scripts/check-env.sh`**

```bash
#!/usr/bin/env bash
set -euo pipefail

ok=true

# 1) Ensure WSL
if ! grep -qi microsoft /proc/version; then
  echo "❌ Not running inside WSL."
  ok=false
fi

# 2) Ensure repo is not on /mnt/*
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [[ "$repo_root" == /mnt/* ]]; then
  echo "❌ Repo is on a Windows mount: $repo_root"
  ok=false
fi

# 3) Node version check
need_node_major=22
node_major="$(node -p 'process.versions.node.split(\".\")[0]' || echo 0)"
if (( node_major < need_node_major )); then
  echo "❌ Node $need_node_major+ recommended."
  ok=false
fi

# 4) pnpm version check
need_pnpm_major=10
pnpm_major="$(pnpm -v 2>/dev/null | cut -d. -f1 || echo 0)"
if (( pnpm_major < need_pnpm_major )); then
  echo "❌ pnpm $need_pnpm_major+ recommended."
  ok=false
fi

# 5) Symlink check
tmpd="$(mktemp -d)"
pushd "$tmpd" >/dev/null
echo test > target.txt
if ln -s target.txt link.txt 2>/dev/null; then
  echo "✅ Symlink creation OK"
else
  echo "❌ Symlink creation failed."
  ok=false
fi
popd >/dev/null
rm -rf "$tmpd"

$ok && echo "✅ Environment check passed." || { echo "⚠ Fix the above issues and re-run."; exit 1; }
```

Make executable:

```bash
chmod +x scripts/check-env.sh
```

Add to `package.json`:

```json
"scripts": {
  "check:env": "bash ./scripts/check-env.sh"
}
```

Run it anytime:

```bash
pnpm run check:env
```

---

## Troubleshooting

### Slow Performance

- Ensure you’re working in `/home/...` not `/mnt/c/...`.
- Docker Desktop WSL2 integration is enabled.
- File watcher limits are increased.

### Permission Issues

```bash
sudo chown -R $USER:$USER ~/dev/echoforge
```

### IDE Issues

- Restart VS Code after installing Remote-WSL.
- Ensure extensions are installed in WSL context.

---

## Migration Checklist

- [ ] WSL2 + Ubuntu installed
- [ ] Node.js + PNPM configured in WSL2
- [ ] Repository cloned in `/home/...`
- [ ] IDE configured for WSL2
- [ ] File watchers increased
- [ ] Git configured properly
- [ ] Docker Desktop WSL2 integration enabled (if using Docker)
- [ ] Environment check passes
- [ ] Full build completes successfully

---

## Next Steps

Once WSL2 is set up:

1. Run `pnpm run check:env` to verify setup.
2. Test the full build: `pnpm -w build`.
3. Verify dashboard builds without symlink errors.
4. Run e2e tests: `pnpm -w e2e`.

With WSL2, you’ll have native Linux tooling, stable symlinks, and a smoother development experience.
