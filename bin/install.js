#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

process.stdout.on('error', (err) => {
  if (err.code === 'EPIPE') process.exit(0);
  throw err;
});

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const HOME_SKILLS = path.join(os.homedir(), '.claude', 'skills');
const PROJECT_SKILLS = path.join(process.cwd(), '.claude', 'skills');

function listSkills() {
  return fs
    .readdirSync(PACKAGE_ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => fs.existsSync(path.join(PACKAGE_ROOT, name, 'SKILL.md')))
    .sort();
}

function parseDescription(skillName) {
  const file = path.join(PACKAGE_ROOT, skillName, 'SKILL.md');
  const content = fs.readFileSync(file, 'utf8');
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return '';
  const lines = fm[1].split('\n');
  let inDesc = false;
  let buf = [];
  for (const line of lines) {
    if (/^description\s*:/.test(line)) {
      inDesc = true;
      const inline = line
        .replace(/^description\s*:\s*/, '')
        .replace(/^[>|][-+]?\s*/, '')
        .trim();
      if (inline) buf.push(inline);
      continue;
    }
    if (inDesc) {
      if (/^\S/.test(line)) break;
      buf.push(line.trim());
    }
  }
  // Trim at first sentence boundary for a tighter summary.
  const joined = buf.join(' ').replace(/\s+/g, ' ').trim();
  const firstSentence = joined.match(/^(.+?[.!?])\s/);
  return firstSentence ? firstSentence[1] : joined;
}

function copySkill(name, target, force) {
  const src = path.join(PACKAGE_ROOT, name);
  const destDir = path.join(target, name);

  if (fs.existsSync(destDir) && !force) {
    return { name, status: 'skipped' };
  }

  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      fs.cpSync(from, to, { recursive: true });
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
  return { name, status: 'installed' };
}

function parseArgs(argv) {
  const args = {
    selection: [],
    force: false,
    all: false,
    list: false,
    help: false,
    project: false,
  };
  for (const a of argv) {
    if (a === '--all') args.all = true;
    else if (a === '--force' || a === '-f') args.force = true;
    else if (a === '--list') args.list = true;
    else if (a === '--help' || a === '-h') args.help = true;
    else if (a === '--project') args.project = true;
    else if (a.startsWith('-')) {
      console.error(`Unknown flag: ${a}`);
      process.exit(2);
    } else args.selection.push(a);
  }
  return args;
}

function printHelp() {
  process.stdout.write(`lemlist-skills - install Claude Code skills

Usage:
  npx github:l3mpire/claude-skills                    interactive picker
  npx github:l3mpire/claude-skills <name> [name...]   install named skills
  npx github:l3mpire/claude-skills --all              install every skill
  npx github:l3mpire/claude-skills --list             list available skill names

Options:
  --project   install into ./.claude/skills (default: ~/.claude/skills)
  --force     overwrite skills that are already installed
  --help      show this help

Picker keys:
  arrows / j k    move
  space           toggle current item
  a               toggle-all
  /               filter (type to search, esc to clear)
  enter           confirm
  q / esc / ^C    cancel
`);
}

function truncate(str, n) {
  if (n <= 1) return '';
  if (str.length <= n) return str;
  return str.slice(0, n - 1) + '…';
}

function buildItems(skills, targetDir) {
  const nameWidth = Math.max(...skills.map((s) => s.length));
  return skills.map((name) => ({
    name,
    desc: parseDescription(name),
    installed: fs.existsSync(path.join(targetDir, name)),
    nameWidth,
  }));
}

const ANSI = {
  hideCursor: '\x1b[?25l',
  showCursor: '\x1b[?25h',
  clearDown: '\x1b[J',
  clearLine: '\x1b[2K',
  up: (n) => (n > 0 ? `\x1b[${n}A` : ''),
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  reset: '\x1b[0m',
  invert: '\x1b[7m',
};

async function checkboxPicker(items) {
  const stdin = process.stdin;
  const stdout = process.stdout;

  let cursor = 0;
  let viewportTop = 0;
  const selected = new Set();
  let filter = '';
  let filterActive = false;
  let lastLineCount = 0;

  function visible() {
    if (!filter) return items;
    const q = filter.toLowerCase();
    return items.filter(
      (it) => it.name.toLowerCase().includes(q) || it.desc.toLowerCase().includes(q),
    );
  }

  function pageSize() {
    const reserved = 6; // header + footer + filter line
    const rows = stdout.rows || 24;
    return Math.max(5, Math.min(items.length, rows - reserved));
  }

  function clamp() {
    const list = visible();
    if (cursor < 0) cursor = 0;
    if (cursor >= list.length) cursor = Math.max(0, list.length - 1);
    const ps = pageSize();
    if (cursor < viewportTop) viewportTop = cursor;
    if (cursor >= viewportTop + ps) viewportTop = cursor - ps + 1;
    if (viewportTop < 0) viewportTop = 0;
  }

  function render() {
    if (lastLineCount > 0) {
      stdout.write(ANSI.up(lastLineCount) + ANSI.clearDown);
    }
    const list = visible();
    const ps = pageSize();
    const end = Math.min(viewportTop + ps, list.length);
    const cols = stdout.columns || 100;
    const buf = [];

    const header = filterActive
      ? `${ANSI.bold}Filter:${ANSI.reset} ${filter}${ANSI.dim}_${ANSI.reset}  ${ANSI.dim}(esc to exit filter)${ANSI.reset}`
      : `${ANSI.bold}Select skills to install${ANSI.reset}  ${ANSI.dim}(space toggle · a all · / filter · enter confirm · q quit)${ANSI.reset}`;
    buf.push(header);
    buf.push('');

    if (list.length === 0) {
      buf.push(`  ${ANSI.dim}no matches${ANSI.reset}`);
      for (let i = 1; i < ps; i++) buf.push('');
    } else {
      const nameWidth = Math.max(...list.map((it) => it.name.length));
      for (let i = viewportTop; i < end; i++) {
        const it = list[i];
        const marker = selected.has(it.name)
          ? `${ANSI.green}[x]${ANSI.reset}`
          : '[ ]';
        const pointer = i === cursor ? `${ANSI.cyan}❯${ANSI.reset}` : ' ';
        const tags = [];
        if (it.installed) tags.push(`${ANSI.dim}installed${ANSI.reset}`);
        const tagStr = tags.length ? ` ${tags.join(' ')}` : '';
        const namePart = i === cursor
          ? `${ANSI.bold}${it.name.padEnd(nameWidth)}${ANSI.reset}`
          : it.name.padEnd(nameWidth);
        const prefix = `${pointer} ${marker} ${namePart}${tagStr}  `;
        // Approximate prefix length without ansi codes.
        const prefixLen = 2 + 4 + nameWidth + (it.installed ? 11 : 0) + 2;
        const descRoom = Math.max(10, cols - prefixLen);
        const desc = `${ANSI.dim}${truncate(it.desc, descRoom)}${ANSI.reset}`;
        buf.push(prefix + desc);
      }
      for (let i = end - viewportTop; i < ps; i++) buf.push('');
    }

    const footer = `${ANSI.dim}${selected.size} selected · showing ${list.length}/${items.length}${ANSI.reset}`;
    buf.push('');
    buf.push(footer);

    stdout.write(buf.join('\n') + '\n');
    lastLineCount = buf.length;
  }

  return new Promise((resolve) => {
    const wasRaw = stdin.isRaw;
    let cleanedUp = false;

    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      stdin.removeListener('keypress', onKey);
      try {
        stdin.setRawMode(wasRaw || false);
      } catch (_) {}
      stdin.pause();
      stdout.write(ANSI.showCursor);
    }

    function done(result) {
      cleanup();
      resolve(result);
    }

    function onKey(str, key) {
      if (!key) return;

      if (key.ctrl && key.name === 'c') return done(null);

      if (filterActive) {
        if (key.name === 'escape') {
          filter = '';
          filterActive = false;
        } else if (key.name === 'return') {
          filterActive = false;
        } else if (key.name === 'backspace') {
          filter = filter.slice(0, -1);
        } else if (str && str.length === 1 && str >= ' ' && str !== '\x7f') {
          filter += str;
        }
        cursor = 0;
        viewportTop = 0;
        clamp();
        render();
        return;
      }

      if (key.name === 'q' || key.name === 'escape') return done(null);
      if (key.name === 'return') {
        const result = items.filter((it) => selected.has(it.name)).map((it) => it.name);
        return done(result);
      }

      if (key.name === '/') {
        filterActive = true;
        render();
        return;
      }

      const ps = pageSize();
      if (key.name === 'up' || key.name === 'k') cursor--;
      else if (key.name === 'down' || key.name === 'j') cursor++;
      else if (key.name === 'pageup') cursor -= ps;
      else if (key.name === 'pagedown') cursor += ps;
      else if (key.name === 'home' || (key.ctrl && key.name === 'a' && false)) cursor = 0;
      else if (key.name === 'end') cursor = visible().length - 1;
      else if (key.name === 'space') {
        const list = visible();
        if (list[cursor]) {
          const n = list[cursor].name;
          if (selected.has(n)) selected.delete(n);
          else selected.add(n);
        }
      } else if (key.name === 'a') {
        const list = visible();
        const allSelected = list.every((it) => selected.has(it.name));
        if (allSelected) list.forEach((it) => selected.delete(it.name));
        else list.forEach((it) => selected.add(it.name));
      } else {
        return;
      }
      clamp();
      render();
    }

    try {
      stdin.setRawMode(true);
    } catch (e) {
      resolve(undefined);
      return;
    }
    stdin.resume();
    readline.emitKeypressEvents(stdin);
    stdout.write(ANSI.hideCursor);
    clamp();
    render();
    stdin.on('keypress', onKey);
  });
}

async function numberedPicker(items) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  const nameWidth = Math.max(...items.map((it) => it.name.length));
  process.stdout.write(`\nAvailable skills (${items.length}):\n\n`);
  items.forEach((it, i) => {
    const desc = truncate(it.desc, 80);
    const tag = it.installed ? ' (installed)' : '';
    process.stdout.write(`  ${String(i + 1).padStart(2)}. ${it.name.padEnd(nameWidth)}${tag}  ${desc}\n`);
  });

  const input = (
    await ask(`\nEnter numbers/names (comma-separated), 'all', or blank to cancel: `)
  ).trim();
  rl.close();

  if (!input) return [];
  if (input.toLowerCase() === 'all') return items.map((it) => it.name);

  const tokens = input.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
  const selected = new Set();
  for (const t of tokens) {
    const asNum = Number(t);
    if (Number.isInteger(asNum) && asNum >= 1 && asNum <= items.length) {
      selected.add(items[asNum - 1].name);
    } else if (items.find((it) => it.name === t)) {
      selected.add(t);
    } else {
      process.stderr.write(`Unknown selection: ${t}\n`);
    }
  }
  return [...selected];
}

async function interactivePicker(items) {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  if (interactive) {
    const result = await checkboxPicker(items);
    if (result === undefined) return numberedPicker(items); // raw mode failed
    return result || [];
  }
  return numberedPicker(items);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const skills = listSkills();
  if (!skills.length) {
    process.stderr.write('No skills found in package.\n');
    process.exit(1);
  }

  if (args.list) {
    skills.forEach((s) => process.stdout.write(s + '\n'));
    return;
  }

  const target = args.project ? PROJECT_SKILLS : HOME_SKILLS;

  let toInstall;
  if (args.all) {
    toInstall = skills;
  } else if (args.selection.length) {
    toInstall = [];
    for (const s of args.selection) {
      if (skills.includes(s)) toInstall.push(s);
      else process.stderr.write(`Unknown skill: ${s}\n`);
    }
  } else {
    const items = buildItems(skills, target);
    toInstall = await interactivePicker(items);
  }

  if (!toInstall.length) {
    process.stdout.write('Nothing to install.\n');
    return;
  }

  fs.mkdirSync(target, { recursive: true });

  process.stdout.write(`\nInstalling to ${target}\n\n`);
  let installed = 0;
  let skipped = 0;
  for (const name of toInstall) {
    const r = copySkill(name, target, args.force);
    if (r.status === 'installed') {
      installed++;
      process.stdout.write(`  installed  ${r.name}\n`);
    } else {
      skipped++;
      process.stdout.write(
        `  skipped    ${r.name}  (already installed, use --force to overwrite)\n`,
      );
    }
  }
  process.stdout.write(`\n${installed} installed, ${skipped} skipped.\n`);
  process.stdout.write(`Restart Claude Code to pick up new skills.\n`);
}

main().catch((err) => {
  process.stderr.write((err && err.message ? err.message : String(err)) + '\n');
  process.exit(1);
});
