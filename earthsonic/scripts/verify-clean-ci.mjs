import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const sourceDir = path.resolve('earthsonic');
const tempBase = path.join(os.tmpdir(), 'earthsonic_ci_test_' + Date.now());
console.log('Testing clean clone in:', tempBase);

try {
  fs.mkdirSync(tempBase, { recursive: true });

  // Copy files except node_modules, dist, _qa_backup
  const entries = fs.readdirSync(sourceDir);
  for (const entry of entries) {
    if (['node_modules', 'dist', '_qa_backup', '.git'].includes(entry)) continue;
    const src = path.join(sourceDir, entry);
    const dest = path.join(tempBase, entry);
    fs.cpSync(src, dest, { recursive: true });
  }

  console.log('Running npm ci in clean directory...');
  execSync('npm ci', { cwd: tempBase, stdio: 'inherit', shell: true });

  console.log('Running npm run build in clean directory...');
  execSync('npm run build', { cwd: tempBase, stdio: 'inherit', shell: true });

  console.log('Running npm run lint in clean directory...');
  execSync('npm run lint', { cwd: tempBase, stdio: 'inherit', shell: true });

  console.log('ALL CLEAN CI CHECKS PASSED SUCCESSFULLY!');
} catch (err) {
  console.error('Clean CI verification failed:', err);
  process.exit(1);
} finally {
  try {
    fs.rmSync(tempBase, { recursive: true, force: true });
    console.log('Cleaned up temporary directory.');
  } catch (e) {
    // Ignore cleanup errors
  }
}
