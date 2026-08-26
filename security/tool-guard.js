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
  // 0777 is the more common spelling than 777
  { re: /\bchmod\s+(-[a-zA-Z]+\s+)*0?777\b/, reason: 'chmod 777 (world-writable)' },
  { re: /\b(curl|wget)\b[^|;&]*\|\s*(sudo\s+)?(ba|z|da)?sh\b/, reason: 'pipe-to-shell (curl|bash pattern)' },
  { re: /\beval\s+["']?\$/, reason: 'eval on dynamic input' },
  // match the directory, not the spelling of the home prefix: ~, $HOME and an
  // absolute /Users|/home path all reach the same files
  { re: /(^|[\s"'=(])(~|\$HOME|\$\{HOME\}|\/(Users|home)\/[^\s/"']+)\/\.ssh\//, reason: 'access to ~/.ssh' },
  { re: /\.ssh\/(id_[a-z]|authorized_keys|known_hosts)/, reason: 'access to an ~/.ssh key file' },
  { re: /(^|[\s"'=(])(~|\$HOME|\$\{HOME\}|\/(Users|home)\/[^\s/"']+)\/\.aws\//, reason: 'access to ~/.aws credentials' },
  { re: /\.aws\/credentials/, reason: 'access to ~/.aws credentials' },
];

function isTmpPath(p) {
  const cleaned = p.replace(/^["']|["']$/g, '');
  // a .. segment leaves the temp tree while keeping the prefix, so it never counts
  if (cleaned.split('/').includes('..')) return false;
  // /var/folders/ and /private/var/folders/ are macOS mktemp/TMPDIR locations
  return /^(\/tmp\/|\/private\/tmp\/|\/var\/tmp\/|\/var\/folders\/|\/private\/var\/folders\/|\$TMPDIR)/.test(cleaned);
}

function checkBash(command) {
  for (const { re, reason } of BASH_PATTERNS) {
    if (re.test(command)) deny(reason);
  }

  // git push --force / -f (allow --force-with-lease). A leading + on the refspec
  // is the same overwrite in another spelling.
  if (/\bgit\s+push\b/.test(command)) {
    const stripped = command.replace(/--force-with-lease(=\S+)?/g, '');
    if (/(\s|^)(--force|-f)(\s|$)/.test(stripped)) {
      deny('git push --force (use --force-with-lease deliberately, run manually)');
    }
    if (/\bgit\s+push\b[^|;&\n]*\s\+[\w./-]+(:|\s|$)/.test(stripped)) {
      deny('git push with a + refspec (force push in another spelling)');
    }
  }

  // rm -rf outside temp dirs — every non-flag target must be a temp path.
  // Split on every shell separator INCLUDING newline: a multi-line command is
  // many commands, and checking only the first rm per segment let the second
  // line through.
  for (const segment of command.split(/(?:\|\||&&|[;|\n])/)) {
    for (const rmMatch of segment.matchAll(/\brm\s+((?:-[a-zA-Z]+\s+)+)([^\n]+)/g)) {
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
}

// --- Write/Edit checks -------------------------------------------------------

const SECRET_PATTERNS = [
  { re: /\b(AKIA|ASIA|ABIA|ACCA)[0-9A-Z]{16}/, reason: 'AWS access key' },
  // the algorithm prefix is optional: PKCS#8 (`BEGIN PRIVATE KEY`) is what
  // openssl genpkey writes by default
  { re: /-----BEGIN ((RSA|EC|DSA|OPENSSH|PGP|ENCRYPTED) )?PRIVATE KEY-----/, reason: 'private key material' },
  { re: /\bgh[pousr]_[A-Za-z0-9]{36}/, reason: 'GitHub token' },
  { re: /\bgithub_pat_[A-Za-z0-9_]{22,}/, reason: 'GitHub fine-grained token' },
  { re: /\bglpat-[A-Za-z0-9_-]{20,}/, reason: 'GitLab token' },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}/, reason: 'Slack token' },
  { re: /\bAIza[0-9A-Za-z_-]{35}/, reason: 'Google API key' },
  { re: /\b[sr]k_live_[A-Za-z0-9]{20,}/, reason: 'Stripe live key' },
  // the word boundary matters: without it any kebab-case identifier whose
  // interior spells s-k-hyphen matches, and one blocked a legitimate write
  { re: /\bsk-(proj-|ant-)?[A-Za-z0-9_-]{24,}/, reason: 'API secret key' },
];

// Writing here disables the guard itself or the agent's permission config, which
// is exactly the plausible-but-wrong action the threat model is about.
const SENSITIVE_WRITE_PATHS = [
  { re: /^~\/\.(ssh|aws|gnupg|kube)\//, reason: 'credential directory' },
  { re: /^~\/\.claude\/(hooks|settings)/, reason: 'the guard or permission config itself' },
];

function checkWrite(filePath, content) {
  const p = (filePath || '').replace(HOME, '~');
  for (const { re, reason } of SENSITIVE_WRITE_PATHS) {
    if (re.test(p)) deny(`write to sensitive path ${p} (${reason})`);
  }

  // .env files are the sanctioned place for secrets (AGENTS.md Konventionen) —
  // but .env.example and friends are committed, so they get no exemption
  const base = (filePath || '').split('/').pop() || '';
  if (/^\.env(\..+)?$/.test(base) && !/\.(example|sample|dist|template)$/.test(base)) return;

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
