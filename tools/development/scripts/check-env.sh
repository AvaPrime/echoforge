#!/usr/bin/env bash
# EchoForge Environment Check Script for WSL2/Linux
# This script verifies that the development environment is properly configured

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
errors=0
warnings=0
checks=0

echo -e "${BLUE}🔍 EchoForge Environment Check${NC}"
echo -e "${BLUE}==============================${NC}"
echo

# Helper functions
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((checks++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((errors++))
    ((checks++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((warnings++))
    ((checks++))
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check 1: WSL Environment
echo "🐧 Checking WSL Environment..."
if grep -qi microsoft /proc/version 2>/dev/null; then
    wsl_version=$(grep -i microsoft /proc/version | grep -o 'WSL[0-9]*' || echo "WSL")
    check_pass "Running inside $wsl_version"
else
    if [[ -f /proc/version ]]; then
        check_info "Running on native Linux ($(uname -s))"
        ((checks++))
    else
        check_fail "Unable to determine environment"
    fi
fi

# Check 2: Repository Location
echo "📁 Checking repository location..."
repo_root="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
if [[ "$repo_root" == /mnt/* ]]; then
    check_fail "Repository is on Windows mount: $repo_root"
    check_info "   Move repository to Linux filesystem (e.g., ~/dev/echoforge) for better performance"
elif [[ "$repo_root" == /home/* ]] || [[ "$repo_root" == /root/* ]]; then
    check_pass "Repository in Linux filesystem: $repo_root"
else
    check_warn "Repository location: $repo_root (consider moving to ~/dev/ for consistency)"
fi

# Check 3: Node.js Version
echo "📦 Checking Node.js version..."
if command -v node >/dev/null 2>&1; then
    node_version=$(node -v)
    node_major=$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo "0")
    required_node_major=22
    
    if (( node_major >= required_node_major )); then
        check_pass "Node.js $node_version (>= $required_node_major required)"
    elif (( node_major >= 18 )); then
        check_warn "Node.js $node_version (>= $required_node_major recommended, >= 18 minimum)"
    else
        check_fail "Node.js $node_version (>= $required_node_major required)"
        check_info "   Install via nvm: curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
        check_info "   Then: nvm install $required_node_major && nvm use $required_node_major"
    fi
else
    check_fail "Node.js not found"
    check_info "   Install via nvm: curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash"
fi

# Check 4: pnpm Version
echo "📦 Checking pnpm version..."
if command -v pnpm >/dev/null 2>&1; then
    pnpm_version=$(pnpm -v 2>/dev/null || echo "unknown")
    if [[ "$pnpm_version" != "unknown" ]]; then
        pnpm_major=$(echo "$pnpm_version" | cut -d. -f1)
        required_pnpm_major=10
        
        if (( pnpm_major >= required_pnpm_major )); then
            check_pass "pnpm $pnpm_version (>= $required_pnpm_major required)"
        elif (( pnpm_major >= 9 )); then
            check_warn "pnpm $pnpm_version (>= $required_pnpm_major recommended, >= 9 minimum)"
        else
            check_fail "pnpm $pnpm_version (>= $required_pnpm_major required)"
            check_info "   Update via: corepack prepare pnpm@latest --activate"
        fi
    else
        check_fail "pnpm version could not be determined"
    fi
else
    check_fail "pnpm not found"
    check_info "   Install via: corepack enable && corepack prepare pnpm@latest --activate"
fi

# Check 5: Git Configuration
echo "🔧 Checking Git configuration..."
if command -v git >/dev/null 2>&1; then
    autocrlf=$(git config --global core.autocrlf 2>/dev/null || echo "unset")
    filemode=$(git config --global core.filemode 2>/dev/null || echo "unset")
    
    if [[ "$autocrlf" == "input" ]]; then
        check_pass "Git core.autocrlf = input (correct for WSL/Linux)"
    else
        check_warn "Git core.autocrlf = $autocrlf (should be 'input' for WSL/Linux)"
        check_info "   Fix with: git config --global core.autocrlf input"
    fi
    
    if [[ "$filemode" == "false" ]]; then
        check_pass "Git core.filemode = false (recommended for WSL)"
    else
        check_info "Git core.filemode = $filemode (consider 'false' for WSL compatibility)"
        ((checks++))
    fi
else
    check_fail "Git not found"
fi

# Check 6: Symlink Support
echo "🔗 Checking symlink support..."
tmpd="$(mktemp -d)"
pushd "$tmpd" >/dev/null 2>&1
echo "test" > target.txt
if ln -s target.txt link.txt 2>/dev/null && [[ -L link.txt ]] && [[ "$(cat link.txt)" == "test" ]]; then
    check_pass "Symlink creation and reading works"
else
    check_fail "Symlink creation failed"
    check_info "   This may cause issues with pnpm and Node.js dependencies"
fi
popd >/dev/null 2>&1
rm -rf "$tmpd"

# Check 7: File Watcher Limits
echo "👀 Checking file watcher limits..."
max_user_watches=$(sysctl fs.inotify.max_user_watches 2>/dev/null | cut -d= -f2 | tr -d ' ' || echo "0")
max_user_instances=$(sysctl fs.inotify.max_user_instances 2>/dev/null | cut -d= -f2 | tr -d ' ' || echo "0")

if (( max_user_watches >= 524288 )); then
    check_pass "File watcher limit: $max_user_watches (>= 524288)"
else
    check_warn "File watcher limit: $max_user_watches (recommended: >= 524288)"
    check_info "   Increase with: echo 'fs.inotify.max_user_watches=524288' | sudo tee -a /etc/sysctl.conf"
fi

if (( max_user_instances >= 512 )); then
    check_pass "File watcher instances: $max_user_instances (>= 512)"
else
    check_warn "File watcher instances: $max_user_instances (recommended: >= 512)"
    check_info "   Increase with: echo 'fs.inotify.max_user_instances=512' | sudo tee -a /etc/sysctl.conf"
fi

# Check 8: Build Tools
echo "🔨 Checking build tools..."
if command -v make >/dev/null 2>&1 && command -v gcc >/dev/null 2>&1; then
    check_pass "Build tools available (make, gcc)"
else
    check_warn "Build tools missing (may be needed for native dependencies)"
    check_info "   Install with: sudo apt install build-essential"
fi

# Check 9: Package.json and Dependencies
echo "📋 Checking project structure..."
if [[ -f "package.json" ]]; then
    check_pass "package.json found"
    
    if [[ -f "pnpm-lock.yaml" ]]; then
        check_pass "pnpm-lock.yaml found"
    else
        check_warn "pnpm-lock.yaml not found (run 'pnpm install')"
    fi
    
    if [[ -d "node_modules" ]]; then
        check_pass "node_modules directory exists"
    else
        check_warn "node_modules not found (run 'pnpm install')"
    fi
else
    check_fail "package.json not found (are you in the project root?)"
fi

# Check 10: WSL Configuration
if grep -qi microsoft /proc/version 2>/dev/null; then
    echo "⚙️  Checking WSL configuration..."
    
    # Check /etc/wsl.conf
    if [[ -f "/etc/wsl.conf" ]]; then
        check_pass "/etc/wsl.conf exists"
        if grep -q "systemd=true" /etc/wsl.conf 2>/dev/null; then
            check_pass "systemd enabled in WSL"
        else
            check_info "systemd not explicitly enabled (may be default)"
            ((checks++))
        fi
    else
        check_info "/etc/wsl.conf not found (using defaults)"
        ((checks++))
    fi
    
    # Check Windows .wslconfig
    wslconfig_path="/mnt/c/Users/$(whoami)/.wslconfig"
    if [[ -f "$wslconfig_path" ]]; then
        check_pass ".wslconfig found in Windows user directory"
    else
        check_info ".wslconfig not found (using WSL defaults)"
        ((checks++))
    fi
fi

# Summary
echo
echo -e "${BLUE}📊 Summary${NC}"
echo -e "${BLUE}==========${NC}"
echo -e "Total checks: $checks"

if (( errors > 0 )); then
    echo -e "${RED}❌ Errors: $errors${NC}"
fi

if (( warnings > 0 )); then
    echo -e "${YELLOW}⚠️  Warnings: $warnings${NC}"
fi

if (( errors == 0 && warnings == 0 )); then
    echo -e "${GREEN}🎉 All checks passed! Your environment is ready for EchoForge development.${NC}"
    exit 0
elif (( errors == 0 )); then
    echo -e "${YELLOW}✅ Environment is functional with minor recommendations above.${NC}"
    exit 0
else
    echo -e "${RED}❌ Please fix the errors above before proceeding with development.${NC}"
    echo
    echo -e "${BLUE}💡 Quick fixes:${NC}"
    if (( errors > 0 )); then
        echo -e "   • Run the migration script: ./scripts/migrate-to-wsl2.ps1"
        echo -e "   • Or follow the manual setup in WSL_DEV.md"
    fi
    exit 1
fi