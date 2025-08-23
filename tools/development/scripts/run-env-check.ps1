<#
.SYNOPSIS
  Runs the EchoForge env-check scaffolder.
  Creates the ./scripts directory if missing, ensures the init script exists,
  and forwards any arguments (e.g. --force, --force-config).
#>

param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$ArgsPassthrough
)

$ErrorActionPreference = "Stop"

# Resolve script location regardless of where it’s invoked from
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$initScript = Join-Path $scriptRoot 'init-env-check.js'

if (-not (Test-Path $initScript)) {
    Write-Error "Cannot find $initScript - did you copy init-env-check.js into the scripts folder?"
    exit 1
}

# chmod is a no-op on Windows, but keep for *nix shells running PowerShell
try { chmod +x $initScript 2>$null } catch {}

# Forward any arguments you passed to this wrapper
node $initScript @ArgsPassthrough
