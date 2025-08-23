# EchoForge WSL2 Migration Guide

## Overview

This guide helps you migrate from Windows-based development to a WSL2 production-ready environment, addressing the current issues identified by the environment check:

- ❌ Repository on Windows mount (`/mnt/c/`)
- ⚠️ Node.js 18.19.1 (22+ recommended)
- ⚠️ pnpm 9.14.4 (10+ recommended)
- Missing symlink support
- Performance issues with file watchers

## Quick Migration (Automated)

### Option 1: Run the Migration Script

```powershell
# Run as Administrator in PowerShell
.\scripts\migrate-to-wsl2.ps1
```

This script will:
- Install WSL2 + Ubuntu 22.04
- Configure WSL2 settings
- Set up Node.js 22 via nvm
- Install pnpm 10+
- Configure Git for WSL2
- Set up file watchers
- Install build tools

### Option 2: Manual Migration

Follow the detailed steps in [`WSL_DEV.md`](./WSL_DEV.md).

## Post-Migration Steps

### 1. Clone Repository in WSL2

```bash
# In WSL2 terminal
mkdir -p ~/dev
cd ~/dev
git clone <your-repo-url> echoforge
cd echoforge
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Verify Environment

```bash
pnpm run check:env
```

Expected output:
```
🔍 EchoForge Environment Check
==============================

🐧 Checking WSL Environment...
✅ Running inside WSL2

📁 Checking repository location...
✅ Repository in Linux filesystem: /home/user/dev/echoforge

📦 Checking Node.js version...
✅ Node.js v22.x.x (>= 22 required)

📦 Checking pnpm version...
✅ pnpm 10.x.x (>= 10 required)

🔧 Checking Git configuration...
✅ Git core.autocrlf = input (correct for WSL/Linux)
✅ Git core.filemode = false (recommended for WSL)

🔗 Checking symlink support...
✅ Symlink creation and reading works

👀 Checking file watcher limits...
✅ File watcher limit: 524288 (>= 524288)
✅ File watcher instances: 512 (>= 512)

🔨 Checking build tools...
✅ Build tools available (make, gcc)

📋 Checking project structure...
✅ package.json found
✅ pnpm-lock.yaml found
✅ node_modules directory exists

⚙️ Checking WSL configuration...
✅ /etc/wsl.conf exists
✅ systemd enabled in WSL
✅ .wslconfig found in Windows user directory

📊 Summary
==========
Total checks: 15
🎉 All checks passed! Your environment is ready for EchoForge development.
```

### 4. Test Build

```bash
pnpm -w build
```

### 5. Configure IDE

#### VS Code
1. Install "Remote - WSL" extension
2. Open WSL terminal: `wsl`
3. Navigate to project: `cd ~/dev/echoforge`
4. Open in VS Code: `code .`

#### JetBrains IDEs
1. Go to Settings → Build, Execution, Deployment → WSL
2. Configure WSL2 as the interpreter
3. Set project path to `/home/user/dev/echoforge`

## Benefits After Migration

### Performance Improvements
- **File I/O**: 2-5x faster file operations
- **Build times**: Significantly reduced build times
- **Hot reload**: Faster development server restarts

### Reliability Improvements
- **Symlinks**: Native symlink support eliminates `EPERM` errors
- **File watchers**: Proper inotify support for hot reload
- **Docker**: Native Docker integration

### Development Experience
- **Native tooling**: Access to Linux tools and utilities
- **Package managers**: Better npm/pnpm performance
- **Git**: Proper line ending handling

## Troubleshooting

### Common Issues

#### "pnpm not found" after migration
```bash
# Restart your WSL terminal or run:
source ~/.bashrc
# or
source ~/.zshrc
```

#### Permission issues
```bash
sudo chown -R $USER:$USER ~/dev/echoforge
```

#### Slow performance
- Ensure you're working in `/home/user/dev/echoforge` (Linux filesystem)
- Avoid `/mnt/c/` paths
- Check that Docker Desktop has WSL2 integration enabled

#### File watcher issues
```bash
# Increase limits
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
echo 'fs.inotify.max_user_instances=512' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Getting Help

1. Run the environment check: `pnpm run check:env`
2. Check WSL status: `wsl -l -v`
3. Verify Node/pnpm versions: `node -v && pnpm -v`
4. Check repository location: `pwd` (should be `/home/user/dev/echoforge`)

## Migration Checklist

- [ ] WSL2 + Ubuntu installed
- [ ] Node.js 22+ installed via nvm
- [ ] pnpm 10+ installed via corepack
- [ ] Repository cloned in Linux filesystem (`~/dev/echoforge`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] Environment check passes (`pnpm run check:env`)
- [ ] Build works (`pnpm -w build`)
- [ ] IDE configured for WSL2
- [ ] File watchers configured
- [ ] Git configuration updated
- [ ] Docker Desktop WSL2 integration enabled (if using Docker)

## Files Created/Updated

This migration includes the following improvements:

### New Files
- `scripts/migrate-to-wsl2.ps1` - Automated migration script
- `MIGRATION_GUIDE.md` - This comprehensive guide

### Updated Files
- `scripts/check-env.sh` - Enhanced environment check with 10+ comprehensive checks
- `package.json` - Updated to use bash-based environment check
- `WSL_DEV.md` - Existing WSL2 setup documentation

### Enhanced Environment Check
The new environment check (`scripts/check-env.sh`) provides:
- Color-coded output with emojis
- Detailed error messages and fix suggestions
- 10+ comprehensive checks covering all aspects of the development environment
- Summary with error/warning counts
- Actionable recommendations

## Next Steps

Once migration is complete:

1. **Verify everything works**: `pnpm run check:env && pnpm -w build`
2. **Run tests**: `pnpm -w test`
3. **Test e2e**: `pnpm -w e2e`
4. **Start development**: `pnpm -F @echoforge/dashboard dev`

You now have a production-ready WSL2 development environment optimized for EchoForge! 🎉