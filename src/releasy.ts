import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { runCommand } from './utils.js';
import chalk from 'chalk';

export async function runReleasy() {
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
  const buildNumber = Date.now() % 1000 + 60;
  const fullVersion = `${version}+${buildNumber}`;

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
    },
  ]);

  console.log(chalk.yellow('\n✍️ Paste your changelog. Press CTRL+D (or CMD+D) when done:\n'));
  const changelogLines: string[] = [];

  await new Promise<void>((resolve) => {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on('line', (line: string) => {
      changelogLines.push(line);
    });

    rl.on('close', () => resolve());
  });

  const changelog = changelogLines.join('\n').trim();
  const changelogPath = path.join('tool', `changelog_${versionInput}.md`);
  fs.mkdirSync('tool', { recursive: true });
  fs.writeFileSync(changelogPath, changelog);

  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  pkg.version = fullVersion;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
  console.log(chalk.green(`📦 package.json updated to: ${fullVersion}`));

  await runCommand('git', ['add', 'package.json']);

  const diff = await runCommand('git', ['diff', '--cached']);
  if (diff) console.log(chalk.blue('\n🔍 Git diff preview:\n') + diff);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `🚀 Tag and release ${versionInput}?`,
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.red('❌ Cancelled.'));
    process.exit(0);
  }

  await runCommand('git', ['commit', '-m', `chore: bump version to ${versionInput}`]);
  await runCommand('git', ['tag', '-a', versionInput, '-F', changelogPath]);
  await runCommand('git', ['push']);
  await runCommand('git', ['push', 'origin', versionInput]);

  try {
    await runCommand('gh', [
      'release',
      'create',
      versionInput,
      '-F',
      changelogPath,
      '-t',
      title,
      '--draft',
    ]);
    console.log(chalk.green(`🎉 Draft GitHub release created for ${versionInput}!`));
  } catch (err) {
    console.error(chalk.red(`⚠️ GitHub release failed:\n${err}`));
  }
}
