if (process.argv.includes('--help')) {
  console.log(`\n📦 Releasy-it CLI — Your Release Assistant

Usage:
  releasy-it [options]

Options:
  --help              Show this help message
  --dry-run           Run without making any changes
  --yes               Skip all confirmation prompts
  --config <path>     Use custom config file instead of .releasyrc.json
  --changelog <path>  Write changelog to a specific file

Example:
  releasy-it --dry-run --changelog tool/changelog_v2.0.0.md

`);
  process.exit(0);
}

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { runCommand } from './utils.js';
import readline from 'node:readline';
import chalk from 'chalk';

interface ReleasyConfig {
  repo?: string;
  defaultTitle?: string;
  skipConfirm?: boolean;
  useBuildNumber?: boolean;
  autoPush?: boolean;
  changelogFilePath?: string;
}

function loadConfig(): ReleasyConfig {
  const configFlagIndex = process.argv.indexOf('--config');
  const configPath = configFlagIndex !== -1 ? process.argv[configFlagIndex + 1] : '.releasyrc.json';

  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    console.log(chalk.cyan(`⚙️ Using config from ${configPath}`));
    return JSON.parse(configData);
  } catch {
    console.warn(chalk.yellow(`⚠️ No config file found at ${configPath}, using defaults.`));
    return {};
  }
}


const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log(chalk.cyan('🧪 Running in dry-run mode. No changes will be written.'));
}

export async function runReleasy() {
  const config = loadConfig();

  console.log(chalk.green('\n📦 Releasy CLI — Your JS Release Assistant'));

  const { versionInput } = await inquirer.prompt([
    {
      type: 'input',
      name: 'versionInput',
      message: '🔖 Enter release version (e.g. v1.2.1):',
      validate(input: string) {
        return /^v\d+\.\d+\.\d+$/.test(input)
          ? true
          : '❌ Use "vX.Y.Z" format';
      },
    },
  ]);

  const version = versionInput.slice(1);
  const buildNumber = config.useBuildNumber ? (Date.now() % 1000 + 60) : 0;
  const fullVersion = buildNumber ? `${version}+${buildNumber}` : version;

  console.log(chalk.blue('🔍 Checking Git status...'));

  const status = await runCommand('git', ['status', '--porcelain']);
  if (status) {
    console.error(chalk.red('❌ Uncommitted changes found. Please commit or stash them.'));
    process.exit(1);
  }

  const unpushed = await runCommand('git', ['log', '@{upstream}..HEAD']);
  if (unpushed) {
    console.error(chalk.red('❌ Unpushed commits found. Please push them first.'));
    process.exit(1);
  }

  const tags = await runCommand('git', ['tag', '--list', versionInput]);
  if (tags) {
    console.error(chalk.red('❌ Tag already exists.'));
    process.exit(1);
  }

  const { title } = await inquirer.prompt([
    {
      type: 'input',
      name: 'title',
      message: '📝 Enter release title:',
      default: config.defaultTitle ?? '',
    },
  ]);

  console.log(chalk.yellow('\n✍️ Paste your changelog. Press CTRL+D (or CMD+D) when done:\n'));
  const changelogLines: string[] = [];

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });

  await new Promise<void>((resolve) => {
    rl.on('line', (line: string) => changelogLines.push(line));
    rl.on('close', () => resolve());
  });

  const changelog = changelogLines.join('\n').trim();
  const changelogArgIndex = process.argv.indexOf('--changelog');
  const changelogPath =
    changelogArgIndex !== -1
      ? process.argv[changelogArgIndex + 1]
      : config.changelogFilePath || path.join('tool', `changelog_${versionInput}.md`);
  fs.mkdirSync('tool', { recursive: true });
  fs.writeFileSync(changelogPath, changelog);

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = fullVersion;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  console.log(chalk.green(`📦 package.json updated to: ${fullVersion}`));

  if (!isDryRun) await runCommand('git', ['add', 'package.json']);

  const diff = await runCommand('git', ['diff', '--cached']);
  if (diff) console.log(chalk.blue('\n🔍 Git diff preview:\n') + diff);

  const forceConfirm = process.argv.includes('--yes');
  let confirm = true;
  if (!config.skipConfirm && !forceConfirm) {
    const confirmation = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `🚀 Tag and release ${versionInput}?`,
        default: false,
      },
    ]);
    confirm = confirmation.confirm;
  }

  if (!confirm) {
    console.log(chalk.red('❌ Cancelled.'));
    process.exit(0);
  }

  if (!isDryRun) await runCommand('git', ['commit', '-m', `chore: bump version to ${versionInput} `]);
  if (!isDryRun) await runCommand('git', ['tag', '-a', versionInput, '-F', changelogPath]);

  if (config.autoPush) {
    if (!isDryRun) await runCommand('git', ['push']);
    if (!isDryRun) await runCommand('git', ['push', 'origin', versionInput]);
  }

  try {
    const ghArgs = [
      'release',
      'create',
      versionInput,
      '-F',
      changelogPath,
      '-t',
      title,
      '--draft',
    ];

    if (config.repo) {
      ghArgs.push('--repo', config.repo);
    }

    if (!isDryRun) await runCommand('gh', ghArgs);
    console.log(chalk.green(`🎉 Draft GitHub release created for ${versionInput}!`));
  } catch (err) {
    console.error(chalk.red(`⚠️ GitHub release failed: \n${err} `));
  }
}
