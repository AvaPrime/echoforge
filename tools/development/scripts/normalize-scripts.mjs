import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const readJson = (p) => fs.readFile(p, 'utf8').then(JSON.parse);
const writeJson = (p, o) => fs.writeFile(p, JSON.stringify(o, null, 2) + '\n');

const libraryScripts = {
  build: 'tsup src/index.ts --dts --sourcemap --format cjs,esm --out-dir dist',
  test: 'vitest run',
  typecheck: 'tsc -p tsconfig.json --noEmit',
  lint: 'eslint .',
  clean: 'rimraf dist',
};

const appScripts = {
  dev: 'next dev',
  build: 'next build',
  start: 'next start -p ${PORT:-3000}',
  test: 'vitest run',
  typecheck: 'tsc -p tsconfig.json --noEmit',
  lint: 'eslint .',
  clean: 'rimraf .next build dist',
};

const baseTsConfig = {
  extends: '../../config/tsconfig.base.json',
  include: ['src', 'tests', 'vitest.config.ts'],
};

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

const main = async () => {
  // Process packages
  const packages = await walk('packages');
  for (const pkgDir of packages) {
    const pkgPath = join(pkgDir, 'package.json');
    const pkg = await readJson(pkgPath);

    // Apply library scripts template
    pkg.scripts = { ...pkg.scripts, ...libraryScripts };
    await writeJson(pkgPath, pkg);

    // Update tsconfig.json
    const tsPath = join(pkgDir, 'tsconfig.json');
    try {
      await writeJson(tsPath, baseTsConfig);
    } catch (e) {
      console.log(`Creating tsconfig.json for ${pkgDir}`);
      await writeJson(tsPath, baseTsConfig);
    }
  }

  // Process apps
  const apps = await walk('apps');
  for (const appDir of apps) {
    const pkgPath = join(appDir, 'package.json');
    const pkg = await readJson(pkgPath);

    // Apply app scripts template
    pkg.scripts = { ...pkg.scripts, ...appScripts };
    await writeJson(pkgPath, pkg);

    // Update tsconfig.json
    const tsPath = join(appDir, 'tsconfig.json');
    try {
      await writeJson(tsPath, baseTsConfig);
    } catch (e) {
      console.log(`Creating tsconfig.json for ${appDir}`);
      await writeJson(tsPath, baseTsConfig);
    }
  }

  console.log('Script normalization complete!');
};

main().catch(console.error);
