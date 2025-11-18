const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', '.env');
const outPath = path.resolve(__dirname, '..', 'app', 'config', 'env.ts');

function parseDotEnv(content) {
  const lines = content.split(/\r?\n/);
  const result = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    result[key] = val;
  }
  return result;
}

function generateFile(data) {
  return `// GENERATED FILE - DO NOT EDIT
// This file was generated from the repository .env by scripts/generate-env.js
export const ENV = ${JSON.stringify(data, null, 2)} as Record<string, string>;
export default ENV;
`;
}

try {
  if (!fs.existsSync(envPath)) {
    console.error('.env not found at', envPath);
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf8');
  const parsed = parseDotEnv(content);

  const out = generateFile(parsed);
  fs.writeFileSync(outPath, out, 'utf8');
  console.log('Generated', outPath);
} catch (err) {
  console.error('Error generating env file', err);
  process.exit(1);
}
