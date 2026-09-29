#!/usr/bin/env node
// Four-line statusline (harness spec, ki-agent-setup/README.md "Statusline-Aufbau"):
//   1  model + context meter + cached tokens
//   2  5h limit + weekly limit (each "used% - reset") + session cost
//   3  path + git branch
//   4  GSD milestone/state + phase + project   <- GSD renderer + .planning/STATE.md
// Fixed column widths and a fixed line count, so the layout is identical in every
// directory. Cells that don't fit are truncated, never allowed to shift the grid.
// Kept separate from gsd-statusline.js so GSD updates don't clobber it.
// Fails soft everywhere: a missing value becomes '–', never an exception.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const DIM = '\x1b[2m';
const OFF = '\x1b[0m';
const NONE = '–';
const COL = [46, 26]; // fixed widths of column 1 and 2; column 3 is free
const input = fs.readFileSync(0, 'utf8');

/** Visible width: ANSI escapes don't occupy columns. */
function vis(s) { return s.replace(/\x1b\[[0-9;]*m/g, '').length; }

/** Truncate to `max` visible columns, keeping ANSI intact by cutting plain runs. */
function fit(s, max) {
  if (vis(s) <= max) return s;
  let out = '', width = 0;
  const re = /(\x1b\[[0-9;]*m)|([\s\S])/g;
  let m;
  while ((m = re.exec(s))) {
    if (m[1]) { out += m[1]; continue; }
    if (width >= max - 1) break;
    out += m[2];
    width++;
  }
  return out + '…' + OFF;
}

/** Lay rows out on the fixed grid so every │ sits in the same column. */
function grid(rows) {
  return rows.map((row) => row
    .map((cell, i) => {
      if (i >= row.length - 1) return cell;
      // Two-cell rows (path, GSD state) span both columns, so their separator
      // lands on the second separator position instead of the first.
      const w = row.length === 2 && i === 0 ? COL[0] + COL[1] + 3 : COL[i];
      const cut = fit(cell, w);
      return cut + ' '.repeat(Math.max(1, w - vis(cut) + 1));
    })
    .join(`${DIM}│ ${OFF}`));
}

/** 10-segment bar, colored by used percentage (GSD thresholds 50/65/80). */
function meter(used) {
  const pct = Math.max(0, Math.min(100, Math.round(used)));
  const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
  const color = pct < 50 ? '\x1b[32m' : pct < 65 ? '\x1b[33m' : pct < 80 ? '\x1b[38;5;208m' : '\x1b[31m';
  return `${color}${bar} ${pct}%${OFF}`;
}

function formatTokens(n) {
  if (!n) return '0';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/** "Opus 5 (1M context)" -> "Opus 5 (1M)"; mirrors the GSD renderer. */
function compactModel(name) {
  return name.replace(/\s*\(([^)]+?)\s+(?:context|ctx)\)$/i, ' ($1)');
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
function resetTime(epochSeconds, withDay) {
  if (!epochSeconds) return '';
  const d = new Date(epochSeconds * 1000);
  const hhmm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return withDay ? `${WEEKDAYS[d.getDay()]} ${hhmm}` : hhmm;
}

/** Branch from .git/HEAD without spawning git; follows worktree gitdir files. */
function gitBranch(startDir) {
  let dir = startDir;
  for (let i = 0; i < 30 && dir; i++) {
    const gitPath = path.join(dir, '.git');
    let head = null;
    try {
      const st = fs.statSync(gitPath);
      if (st.isDirectory()) head = path.join(gitPath, 'HEAD');
      else if (st.isFile()) {
        const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(gitPath, 'utf8'));
        if (m) head = path.join(path.resolve(dir, m[1].trim()), 'HEAD');
      }
    } catch {}
    if (head) {
      try {
        const ref = fs.readFileSync(head, 'utf8').trim();
        const m = /^ref:\s*refs\/heads\/(.+)$/.exec(ref);
        return m ? m[1] : ref.slice(0, 7);
      } catch { return ''; }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return '';
}

/**
 * Walk up for .planning/STATE.md and pull what the GSD renderer omits:
 * the project name and the phase currently in play.
 */
function planningState(startDir) {
  let dir = startDir;
  for (let i = 0; i < 30 && dir; i++) {
    const file = path.join(dir, '.planning', 'STATE.md');
    if (fs.existsSync(file)) {
      try {
        const text = fs.readFileSync(file, 'utf8');
        return {
          project: /^#\s*Project State:\s*(.+)$/m.exec(text)?.[1].trim() || '',
          phase: /^Phase:\s*([0-9.]+)/m.exec(text)?.[1] || '',
        };
      } catch { return null; }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

let data = {};
try { data = JSON.parse(input); } catch {}
const dir = data.workspace?.current_dir || process.cwd();

// --- line 4 source: GSD renderer, minus its own model segment and context meter
let gsdLine = '';
try {
  gsdLine = execFileSync(process.execPath, [path.join(__dirname, 'gsd-statusline.js')], {
    input, encoding: 'utf8',
  }).replace(/\n+$/, '');
  // The GSD renderer prints a full four-line block of its own; only its last
  // line carries the milestone/phase/project cells. Keeping the whole output
  // would paste its model and limit lines underneath this grid.
  gsdLine = gsdLine.split('\n').pop();
  gsdLine = gsdLine.replace(`${DIM}${compactModel(data.model?.display_name || 'Claude')}${OFF} │ `, '');
  gsdLine = gsdLine.replace(/\s*\x1b\[[0-9;]*m(?:💀 )?[█░]{10} \d+%(?: \([^)]*\))?\x1b\[0m/, '');
} catch {}

const rows = [];

// --- line 1: model + context meter + cached tokens ----------------------------
{
  const remaining = data.context_window?.remaining_percentage;
  let ctx = DIM + NONE + OFF;
  if (remaining != null) {
    // Same normalization as the GSD renderer: discount the auto-compact reserve
    // so the meter shows the share of *usable* context that is spent.
    const total = data.context_window?.total_tokens || 1_000_000;
    const acw = parseInt(process.env.CLAUDE_CODE_AUTO_COMPACT_WINDOW || '0', 10);
    const buffer = acw > 0 ? Math.min(100, Math.max(0, (1 - acw / total) * 100)) : 16.5;
    ctx = meter(100 - Math.max(0, ((remaining - buffer) / (100 - buffer)) * 100));
  }
  const cached = data.context_window?.current_usage?.cache_read_input_tokens;
  rows.push([
    DIM + compactModel(data.model?.display_name || 'Claude') + OFF,
    ctx,
    DIM + (cached ? `${formatTokens(cached)} cached` : NONE) + OFF,
  ]);
}

// --- line 2: 5h limit + weekly limit + session cost ---------------------------
{
  const rl = data.rate_limits || {};
  const limit = (window, withDay) => {
    if (!window) return DIM + NONE + OFF;
    const at = resetTime(window.resets_at, withDay);
    return meter(window.used_percentage) + (at ? `${DIM} - ${at}${OFF}` : '');
  };
  const cost = data.cost?.total_cost_usd;
  rows.push([
    limit(rl.five_hour, false),
    limit(rl.seven_day, true),
    DIM + (typeof cost === 'number' ? `$${cost.toFixed(2)}` : NONE) + OFF,
  ]);
}

// --- line 3: path + git branch -------------------------------------------------
{
  const home = os.homedir();
  const shown = dir.startsWith(home + path.sep) ? '~' + dir.slice(home.length) : dir;
  rows.push([DIM + shown + OFF, DIM + (gitBranch(dir) || NONE) + OFF]);
}

// --- line 4: GSD state + phase + project ---------------------------------------
{
  const st = planningState(dir);
  const cells = gsdLine ? gsdLine.split(' │ ') : [];
  // Without a .planning state the GSD line degrades to the bare dirname — that
  // carries no milestone, so show the placeholder instead of a stray directory.
  const hasState = cells.length > 1;
  let left = hasState ? cells[0] : DIM + NONE + OFF;
  // The GSD cell already names the phase while an orchestrator is in flight;
  // only add it when that is missing, otherwise it reads "Phase 02 … · Phase 02".
  if (hasState && st?.phase && !/Phase\s/.test(left))
    left = left.replace(/\x1b\[0m$/, '') + ` · Phase ${st.phase}` + OFF;
  rows.push([left, DIM + (st?.project || path.basename(dir)) + OFF]);
}

process.stdout.write(grid(rows).join('\n'));
