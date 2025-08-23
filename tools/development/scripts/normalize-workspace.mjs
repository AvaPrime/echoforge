import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const roots = ['apps', 'packages'];
const isApp = (p) => p.startsWith('apps/');
const readJson = (p) => fs.readFile(p, 'utf8').then(JSON.parse);
const writeJson = (p, o) => fs.writeFile(p, JSON.stringify(o, null, 2) + '\n');

const walk = async (dir) => {
  const ents = await fs.readdir(dir, { withFileTypes: true });
  const pkgs = [];
  for (const e of ents) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      if ((await fs.readdir(p)).includes('package.json')) pkgs.push(p);
      else pkgs.push(...(await walk(p)));
    }
  }
  return pkgs;
};

const ensureWorkspaceProtocol = (deps) => {
  for (const k of Object.keys(deps || {})) {
    if (k.startsWith('@org/') || k.startsWith('@echoforge/'))
      deps[k] = 'workspace:*';
  }
};

const main = async () => {
  for (const r of roots) {
    const pkgs = await walk(r);
    for (const pkgDir of pkgs) {
      const pkgPath = join(pkgDir, 'package.json');
      const pkg = await readJson(pkgPath);

      // mark apps private; keep libs as-is unless already public
      if (isApp(pkgDir)) pkg.private = true;

      // Mark unpublished libraries as private (those without explicit publishConfig)
      if (!isApp(pkgDir) && !pkg.publishConfig) {
        pkg.private = true;
      }

      ensureWorkspaceProtocol(pkg.dependencies);
      ensureWorkspaceProtocol(pkg.devDependencies);
      ensureWorkspaceProtocol(pkg.peerDependencies);

      pkg.scripts ||= {};
      pkg.scripts.test ||= 'vitest run';
      pkg.scripts.lint ||= 'eslint .';
      pkg.scripts.clean ||= 'rimraf dist .next build';

      await writeJson(pkgPath, pkg);

      // ensure tsconfig extends base
      const tsPath = join(pkgDir, 'tsconfig.json');
      try {
        const ts = await readJson(tsPath);
        ts.extends = '../../config/tsconfig.base.json';
        await writeJson(tsPath, ts);
      } catch {
        /* skip */
      }

      // ensure .env.example for apps
      if (isApp(pkgDir)) {
        const envEx = join(pkgDir, '.env.example');
        try {
          await fs.access(envEx);
        } catch {
          await fs.writeFile(
            envEx,
            'NODE_ENV=development\nPORT=3000\nLOG_LEVEL=info\n'
          );
        }
      }
    }
  }
};
main();
