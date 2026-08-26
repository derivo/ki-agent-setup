#!/usr/bin/env node
// Security Tool Guard — PreToolUse block hook (security/02-tool-guard.md)
// Blocks dangerous tool calls before execution: destructive shell commands,
// force pushes, pipe-to-shell, secret writes, sensitive-path access.
//
// Triggers on: Bash, Write, Edit
// Action: BLOCKING — exit 2 on match, stderr message goes back to the agent.
// Fail-closed on pattern match; malformed hook input exits 0 (matches gsd-* guards,
// avoids deadlocking the whole session on harness changes).

const os = require('os');
const HOME = os.homedir();

function deny(reason) {
  process.stderr.write(`[security-tool-guard] BLOCKED: ${reason}\n`);
  process.exit(2);
}

// --- Bash command checks -----------------------------------------------------

const BASH_PATTERNS = [
  { re: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/, reason: 'fork bomb' },
  { re: /\bdd\b[^|;&]*\bof=\/dev\//, reason: 'dd writing to a device node' },
  { re: /\bchmod\s+(-[a-zA-Z]+\s+)*777\b/, reason: 'chmod 777 (world-writable)' },
  { re: /\b(curl|wget)\b[^|;&]*\|\s*(sudo\s+)?(ba|z|da)?sh\b/, reason: 'pipe-to-shell (curl|bash pattern)' },
  { re: /\beval\s+["']?\$/, reason: 'eval on dynamic input' },
  { re: /~\/\.ssh\/|\.ssh\/id_[a-z]/, reason: 'access to ~/.ssh' },
  { re: /~\/\.aws\/|\.aws\/credentials/, reason: 'access to ~/.aws credentials' },
];

function isTmpPath(p) {
  const cleaned = p.replace(/^["']|["']$/g, '');
  // /var/folders/ and /private/var/folders/ are macOS mktemp/TMPDIR locations
  return /^(\/tmp\/|\/private\/tmp\/|\/var\/tmp\/|\/var\/folders\/|\/private\/var\/folders\/|\$TMPDIR)/.test(cleaned);
}

function checkBash(command) {
  for (const { re, reason } of BASH_PATTERNS) {
    if (re.test(command)) deny(reason);
  }

  // git push --force / -f (allow --force-with-lease)
  if (/\bgit\s+push\b/.test(command)) {
    const stripped = command.replace(/--force-with-lease(=\S+)?/g, '');
    if (/(\s|^)(--force|-f)(\s|$)/.test(stripped)) {
      deny('git push --force (use --force-with-lease deliberately, run manually)');
    }
  }

  // rm -rf outside temp dirs — every non-flag target must be a temp path.
  // Check per shell segment so targets don't bleed across ;, &&, || or |.
  for (const segment of command.split(/(?:\|\||&&|[;|])/)) {
    const rmMatch = segment.match(/\brm\s+((?:-[a-zA-Z]+\s+)+)(.+)/);
    if (!rmMatch) continue;
    const flags = rmMatch[1];
    const recursive = /r/i.test(flags);
    const force = /f/.test(flags);
    if (recursive && force) {
      const targets = rmMatch[2].split(/\s+/).filter(t => t && !t.startsWith('-'));
      const allTmp = targets.length > 0 && targets.every(isTmpPath);
      if (!allTmp) deny('rm -rf on non-temporary path');
    }
  }
}

// --- Write/Edit checks -------------------------------------------------------

const SECRET_PATTERNS = [
  { re: /AKIA[0-9A-Z]{16}/, reason: 'AWS access key' },
  { re: /-----BEGIN (RSA|EC|DSA|OPENSSH|PGP) PRIVATE KEY-----/, reason: 'private key material' },
  { re: /ghp_[A-Za-z0-9]{36}/, reason: 'GitHub personal access token' },
  { re: /github_pat_[A-Za-z0-9_]{22,}/, reason: 'GitHub fine-grained token' },
  { re: /xox[baprs]-[A-Za-z0-9-]{10,}/, reason: 'Slack token' },
  { re: /AIza[0-9A-Za-z_-]{35}/, reason: 'Google API key' },
  { re: /sk-(proj-|ant-)?[A-Za-z0-9_-]{24,}/, reason: 'API secret key (sk-…)' },
];

function checkWrite(filePath, content) {
  const p = (filePath || '').replace(HOME, '~');
  if (/^~\/\.(ssh|aws)\//.test(p)) deny(`write to sensitive path ${p}`);

  // .env files are the sanctioned place for secrets (AGENTS.md Konventionen)
  const base = (filePath || '').split('/').pop() || '';
  if (/^\.env(\..+)?$/.test(base)) return;

  for (const { re, reason } of SECRET_PATTERNS) {
    if (re.test(content)) deny(`secret pattern in file content (${reason}) — put it in .env / secret store`);
  }
}

// --- main ---------------------------------------------------------------------

let input = '';
const stdinTimeout = setTimeout(() => process.exit(0), 3000);
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout);
  try {
    const data = JSON.parse(input);
    const tool = data.tool_name;
    if (tool === 'Bash') {
      checkBash(data.tool_input?.command || '');
    } else if (tool === 'Write' || tool === 'Edit') {
      const content = data.tool_input?.content || data.tool_input?.new_string || '';
      checkWrite(data.tool_input?.file_path || '', content);
    }
    process.exit(0);
  } catch (e) {
    process.exit(0);
  }
});
