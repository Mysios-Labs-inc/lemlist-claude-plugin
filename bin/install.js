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
      const inline = line.replace(/^description\s*:\s*/, '').replace(/^[>|][-+]?\s*/, '').trim();
      if (inline) buf.push(inline);
      continue;
    }
    if (inDesc) {
      if (/^\S/.test(line)) break;
      buf.push(line.trim());
    }
  }
  return buf.join(' ').replace(/\s+/g, ' ').trim();
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
  const args = { selection: [], force: false, all: false, list: false, help: false, project: false };
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
  npx lemlist-skills                    interactive picker
  npx lemlist-skills <name> [name...]   install named skills
  npx lemlist-skills --all              install every skill
  npx lemlist-skills --list             list available skills

Options:
  --project   install into ./.claude/skills (default: ~/.claude/skills)
  --force     overwrite skills that are already installed
  --help      show this help
`);
}

function truncate(str, n) {
  if (str.length <= n) return str;
  return str.slice(0, n - 3) + '...';
}

async function interactivePicker(skills) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

  const nameWidth = Math.max(...skills.map((s) => s.length));
  process.stdout.write(`\nAvailable skills (${skills.length}):\n\n`);
  skills.forEach((s, i) => {
    const desc = truncate(parseDescription(s), 80);
    process.stdout.write(`  ${String(i + 1).padStart(2)}. ${s.padEnd(nameWidth)}  ${desc}\n`);
  });

  const input = (await ask(`\nEnter numbers/names (comma-separated), 'all', or blank to cancel: `)).trim();
  rl.close();

  if (!input) return [];
  if (input.toLowerCase() === 'all') return skills;

  const tokens = input.split(/[,\s]+/).map((t) => t.trim()).filter(Boolean);
  const selected = new Set();
  for (const t of tokens) {
    const asNum = Number(t);
    if (Number.isInteger(asNum) && asNum >= 1 && asNum <= skills.length) {
      selected.add(skills[asNum - 1]);
    } else if (skills.includes(t)) {
      selected.add(t);
    } else {
      process.stderr.write(`Unknown selection: ${t}\n`);
    }
  }
  return [...selected];
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
    toInstall = await interactivePicker(skills);
  }

  if (!toInstall.length) {
    process.stdout.write('Nothing to install.\n');
    return;
  }

  const target = args.project ? PROJECT_SKILLS : HOME_SKILLS;
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
      process.stdout.write(`  skipped    ${r.name}  (already installed, use --force to overwrite)\n`);
    }
  }
  process.stdout.write(`\n${installed} installed, ${skipped} skipped.\n`);
  process.stdout.write(`Restart Claude Code to pick up new skills.\n`);
}

main().catch((err) => {
  process.stderr.write((err && err.message ? err.message : String(err)) + '\n');
  process.exit(1);
});
