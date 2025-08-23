#!/usr/bin/env pwsh
# EchoForge WSL2 Migration Script
# This script automates the migration from Windows development to WSL2

param(
    [switch]$Force,
    [switch]$SkipWSLInstall,
    [string]$DistroName = "Ubuntu-22.04",
    [string]$NodeVersion = "22",
    [string]$PnpmVersion = "10.14.0"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 EchoForge WSL2 Migration Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges for WSL installation." -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

# Step 1: Install WSL2 if not already installed
if (-not $SkipWSLInstall) {
    Write-Host "\n📦 Step 1: Installing WSL2 + $DistroName" -ForegroundColor Green
    
    try {
        $wslStatus = wsl -l -v 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Installing WSL2..." -ForegroundColor Yellow
            wsl --install -d $DistroName
            Write-Host "✅ WSL2 installation initiated. Please reboot and run this script again with -SkipWSLInstall." -ForegroundColor Green
            exit 0
        } else {
            Write-Host "WSL2 already installed. Checking distribution..." -ForegroundColor Yellow
            if ($wslStatus -notmatch $DistroName) {
                Write-Host "Installing $DistroName..." -ForegroundColor Yellow
                wsl --install -d $DistroName
            }
            wsl --set-default $DistroName
            Write-Host "✅ WSL2 and $DistroName configured." -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Failed to install WSL2: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "\n⏭️  Step 1: Skipping WSL installation (as requested)" -ForegroundColor Yellow
}

# Step 2: Create WSL configuration files
Write-Host "\n⚙️  Step 2: Configuring WSL2 settings" -ForegroundColor Green

# Create .wslconfig
$wslConfigPath = "$env:USERPROFILE\.wslconfig"
$wslConfigContent = @"
[wsl2]
memory=8GB
processors=4
# networkingMode=mirrored
# localhostForwarding=true
"@

if (-not (Test-Path $wslConfigPath) -or $Force) {
    $wslConfigContent | Out-File -FilePath $wslConfigPath -Encoding UTF8
    Write-Host "✅ Created $wslConfigPath" -ForegroundColor Green
} else {
    Write-Host "⏭️  $wslConfigPath already exists (use -Force to overwrite)" -ForegroundColor Yellow
}

# Step 3: Create Ubuntu setup script
Write-Host "\n🐧 Step 3: Creating Ubuntu environment setup script" -ForegroundColor Green

$ubuntuSetupScript = @"
#!/bin/bash
set -euo pipefail

echo "🔧 Setting up Ubuntu environment for EchoForge development..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git curl unzip

# Install Node.js via nvm
echo "📦 Installing Node.js $NodeVersion via nvm..."
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="`$HOME/.nvm"
[ -s "`$NVM_DIR/nvm.sh" ] && \. "`$NVM_DIR/nvm.sh"
[ -s "`$NVM_DIR/bash_completion" ] && \. "`$NVM_DIR/bash_completion"

nvm install $NodeVersion
nvm alias default $NodeVersion
nvm use $NodeVersion

echo "✅ Node.js version: `$(node -v)"

# Enable and configure pnpm
echo "📦 Installing pnpm $PnpmVersion..."
corepack enable
corepack prepare pnpm@$PnpmVersion --activate

echo "✅ pnpm version: `$(pnpm -v)"

# Configure Git
echo "🔧 Configuring Git for WSL2..."
git config --global core.autocrlf input
git config --global core.filemode false

# Increase file watchers
echo "🔧 Increasing file watcher limits..."
echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf
echo 'fs.inotify.max_user_instances=512' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Create WSL configuration
echo "🔧 Creating WSL configuration..."
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true

[automount]
enabled=true
options=metadata,umask=22,fmask=11

[network]
generateResolvConf=true
EOF

# Install Playwright dependencies
echo "📦 Installing Playwright dependencies..."
sudo apt-get install -y \
  libnss3 libnspr4 libdrm2 libgbm1 libasound2 \
  libxkbcommon0 libxcomposite1 libxrandr2 libxdamage1 libxfixes3 \
  libgtk-3-0 libpango-1.0-0 libcairo2 libatspi2.0-0

echo "✅ Ubuntu environment setup complete!"
echo "📋 Next steps:"
echo "   1. Restart WSL: wsl --shutdown (from Windows)"
echo "   2. Clone repository: mkdir -p ~/dev && cd ~/dev && git clone <repo-url> echoforge"
echo "   3. Install dependencies: cd ~/dev/echoforge && pnpm install"
echo "   4. Run environment check: pnpm run check:env"
"@

$setupScriptPath = "$env:TEMP\wsl2-setup.sh"
$ubuntuSetupScript | Out-File -FilePath $setupScriptPath -Encoding UTF8

Write-Host "✅ Created Ubuntu setup script at $setupScriptPath" -ForegroundColor Green

# Step 4: Execute setup in WSL
Write-Host "\n🚀 Step 4: Executing setup in WSL2" -ForegroundColor Green

try {
    # Copy script to WSL and execute
    wsl -d $DistroName -- bash -c "cat > /tmp/wsl2-setup.sh" < $setupScriptPath
    wsl -d $DistroName -- chmod +x /tmp/wsl2-setup.sh
    wsl -d $DistroName -- /tmp/wsl2-setup.sh
    
    Write-Host "✅ WSL2 environment setup completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to execute setup in WSL2: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You can manually run the setup script later:" -ForegroundColor Yellow
    Write-Host "wsl -d $DistroName -- bash /tmp/wsl2-setup.sh" -ForegroundColor Cyan
}

# Step 5: Create migration instructions
Write-Host "\n📋 Step 5: Migration Instructions" -ForegroundColor Green

$migrationInstructions = @"
🎉 WSL2 Setup Complete!

Next steps to complete your migration:

1. 🔄 Restart WSL2 to apply configuration:
   wsl --shutdown
   wsl -d $DistroName

2. 📁 Clone EchoForge repository in Linux filesystem:
   mkdir -p ~/dev
   cd ~/dev
   git clone <your-repo-url> echoforge
   cd echoforge

3. 📦 Install dependencies:
   pnpm install

4. 🔍 Run environment check:
   pnpm run check:env

5. 🏗️  Test build:
   pnpm -w build

6. 💻 Configure your IDE:
   - VS Code: Install 'Remote - WSL' extension, then run 'code .' from WSL
   - JetBrains: Configure WSL2 interpreter in settings

⚠️  Important: Always work in ~/dev/echoforge (Linux filesystem) for best performance!
   Avoid /mnt/c/ paths which cause performance issues.

🐛 Troubleshooting:
   - If pnpm is not found, restart your WSL terminal
   - If permissions issues occur: sudo chown -R `$USER:`$USER ~/dev/echoforge
   - For Docker: Enable WSL2 integration in Docker Desktop settings
"@

Write-Host $migrationInstructions -ForegroundColor Cyan

# Clean up
Remove-Item $setupScriptPath -Force -ErrorAction SilentlyContinue

Write-Host "\n🎯 Migration script completed!" -ForegroundColor Green
Write-Host "Please follow the instructions above to complete your WSL2 setup." -ForegroundColor Yellow