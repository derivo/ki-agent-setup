const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const os = require('node:os');

const root = path.resolve(__dirname, '..');
const script = process.argv[2] || path.join(root, 'harness/hooks/statusline.js');
const output = execFileSync(process.execPath, [script], {
  input: JSON.stringify({
    workspace: { current_dir: root },
    context_window: { remaining_percentage: 79.96 },
    rate_limits: {
      five_hour: { used_percentage: 27, resets_at: 1800000000 },
      seven_day: { used_percentage: 26, resets_at: 1800000000 },
    },
  }),
  env: { ...process.env, CLAUDE_CODE_AUTO_COMPACT_WINDOW: '0', TZ: 'UTC' },
  encoding: 'utf8',
  stdio: ['pipe', 'pipe', 'ignore'],
});
const rows = output.replace(/\x1b\[[0-9;]*m/g, '').split('\n');
assert.equal(rows.length, 4);
assert.ok(rows[0].includes('███████░░░ 76% frei'));
assert.ok(rows[1].includes('███████░░░ 73% frei - 08:00'));
assert.ok(rows[1].includes('███████░░░ 74% frei - Fr 08:00'));
assert.ok(rows[2].includes(root.replace(os.homedir(), '~')));
assert.ok(rows[2].includes(execFileSync('git', ['branch', '--show-current'], {
  cwd: root, encoding: 'utf8',
}).trim()));
assert.ok(output.includes('\x1b[32m███████░░░ 76% frei'));
console.log(rows.join('\n'));
console.log('statusline: remaining budgets, reset times, directory and branch OK');
