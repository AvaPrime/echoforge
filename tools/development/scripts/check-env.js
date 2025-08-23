#!/usr/bin/env node
/**
 * EchoForge Environment Check (with docs auto-open)
 */
const os = require('os');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function openDocs(reason) {
  try {
    const repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
    const mdPath = path.join(repoRoot, 'docs', 'WSL_DEV.md');

    if (!fs.existsSync(mdPath)) {
      log(colors.yellow, '⚠️  docs/WSL_DEV.md not found; skipping auto-open.');
      return;
    }

    const isWSL = process.platform === 'linux' && os.release().toLowerCase().includes('microsoft');
    const isWin = process.platform === 'win32';
    const isMac = process.platform === 'darwin';

    // Helper: run detached so postinstall doesn’t hang
    const runDetached = (cmd, args) => {
      try {
        const child = spawn(cmd, args, { detached: true, stdio: 'ignore' });
        child.unref();
        return true;
      } catch {
        return false;
      }
    };

    if (isWSL) {
      // Prefer wslview if present
      try {
        execSync('command -v wslview', { stdio: 'ignore' });
        log(colors.blue, `💡 Opening WSL docs via wslview (${reason})`);
        if (runDetached('wslview', [mdPath])) return;
      } catch {}

      // Fallback: convert path and open with Windows default browser
      try {
        const winPath = execSync(`wslpath -w "${mdPath}"`, { encoding: 'utf8' }).trim();
        log(colors.blue, `💡 Opening WSL docs via Windows default browser (${reason})`);
        if (runDetached('powershell.exe', ['-NoProfile', 'Start-Process', `"${winPath}"`])) return;
      } catch {}
    } else if (isWin) {
      log(colors.blue, `💡 Opening docs on Windows (${reason})`);
      // Use "start": must be run through cmd.exe
      const abs = path.resolve(mdPath);
      if (runDetached('cmd.exe', ['/c', 'start', '', abs])) return;
    } else if (isMac) {
      log(colors.blue, `💡 Opening docs on macOS (${reason})`);
      if (runDetached('open', [mdPath])) return;
    } else {
      // Linux
      log(colors.blue, `💡 Opening docs on Linux (${reason})`);
      if (runDetached('xdg-open', [mdPath])) return;
    }

    log(colors.yellow, '⚠️  Could not auto-open docs. Please open docs/WSL_DEV.md manually.');
  } catch {
    // Silent: never fail the whole script because of opening docs
  }
}

function checkEnvironment() {
  log(colors.bold + colors.blue, '🔍 EchoForge Environment Check\n');

  let warnings = 0;
  let errors = 0;

  // --- Platform Detection ---
  const isWSL = process.platform === 'linux' && os.release().toLowerCase().includes('microsoft');
  const isWindows = process.platform === 'win32';
  const isLinux = process.platform === 'linux' && !isWSL;
  const isMac = process.platform === 'darwin';

  if (isWSL) {
    log(colors.green, '✅ Running in WSL2 - Optimal for development');
  } else if (isLinux) {
    log(colors.green, '✅ Running on native Linux - Excellent for development');
  } else if (isMac) {
    log(colors.green, '✅ Running on macOS - Good for development');
  } else if (isWindows) {
    log(colors.yellow, '⚠️  Running on Windows - Consider WSL2 for better symlink support');
    warnings++;
    // Prompt Windows users directly
    openDocs('Detected Windows host');
  }

  // --- Filesystem location check ---
  if (isWSL) {
    const cwd = process.cwd();
    if (cwd.startsWith('/mnt/')) {
      log(colors.red, `❌ Working in Windows mount: ${cwd}`);
      log(colors.yellow, '   Move your project to Linux FS, e.g., ~/dev/echoforge');
      errors++;
      openDocs('Repo under /mnt in WSL');
    } else {
      log(colors.green, '✅ Working in Linux filesystem - Optimal performance');
    }
  }

  // --- Node.js version ---
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  const requiredNode = 22;
  if (majorVersion >= requiredNode) {
    log(colors.green, `✅ Node.js ${nodeVersion} - Compatible`);
  } else {
    log(colors.red, `❌ Node.js ${nodeVersion} - Please upgrade to Node ${requiredNode}+`);
    errors++;
  }

  // --- pnpm check ---
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    const pnpmMajor = parseInt(pnpmVersion.split('.')[0], 10);
    const requiredPnpm = 10;
    if (pnpmMajor >= requiredPnpm) {
      log(colors.green, `✅ PNPM ${pnpmVersion} - Compatible`);
    } else {
      log(colors.red, `❌ PNPM ${pnpmVersion} - Please upgrade to ${requiredPnpm}+`);
      errors++;
    }
  } catch {
    log(colors.red, '❌ PNPM not found - Run: corepack enable');
    errors++;
  }

  // --- File watchers (Linux/WSL only) ---
  if (isWSL || isLinux) {
    try {
      const watchers = parseInt(
        fs.readFileSync('/proc/sys/fs/inotify/max_user_watches', 'utf8').trim(),
        10
      );
      if (watchers >= 524288) {
        log(colors.green, `✅ File watchers: ${watchers.toLocaleString()} - Sufficient`);
      } else {
        log(colors.yellow, `⚠️  File watchers: ${watchers.toLocaleString()} - Consider increasing`);
        log(colors.yellow, '   Run: echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p');
        warnings++;
      }
    } catch {
      log(colors.yellow, '⚠️  Could not check file watcher limits');
      warnings++;
    }
  }

  // --- Common dev tools ---
  const tools = [
    { name: 'git', command: 'git --version' },
    { name: 'docker', command: 'docker --version', optional: true },
  ];

  for (const tool of tools) {
    try {
      execSync(tool.command, { encoding: 'utf8', stdio: 'pipe' });
      log(colors.green, `✅ ${tool.name} - Available`);
    } catch {
      if (tool.optional) {
        log(colors.yellow, `⚠️  ${tool.name} - Not found (optional)`);
        warnings++;
      } else {
        log(colors.red, `❌ ${tool.name} - Not found`);
        errors++;
      }
    }
  }

  // --- Package.json present ---
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    log(colors.green, '✅ package.json found');

    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      log(colors.green, '✅ node_modules installed');
    } else {
      log(colors.yellow, '⚠️  node_modules not found - Run: pnpm install');
      warnings++;
    }
  } else {
    log(colors.red, '❌ package.json not found - Are you in the project root?');
    errors++;
  }

  // --- Summary ---
  console.log();
  if (errors === 0 && warnings === 0) {
    log(colors.bold + colors.green, '🎉 Environment is optimally configured!');
  } else if (errors === 0) {
    log(colors.bold + colors.yellow, `⚠️  Environment is good with ${warnings} warning(s)`);
  } else {
    log(colors.bold + colors.red, `❌ Environment has ${errors} error(s) and ${warnings} warning(s)`);
  }

  process.exit(errors > 0 ? 1 : 0);
}

if (require.main === module) {
  checkEnvironment();
}

module.exports = { checkEnvironment };
