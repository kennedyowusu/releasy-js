# 📦 Releasy-it CLI

[![npm version](https://img.shields.io/npm/v/releasy-it.svg)](https://www.npmjs.com/package/releasy-it)

**Releasy-it** is a lightweight, interactive CLI tool for versioning, tagging, changelog generation, and GitHub release automation in TypeScript/Node.js projects.

🟢 Live on npm: [https://www.npmjs.com/package/releasy-it](https://www.npmjs.com/package/releasy-it)

---

## ✨ Features

- 🔖 Semantic versioning with optional build metadata
- 🧠 Git safety checks: uncommitted or unpushed changes
- 📝 Markdown changelog input via terminal
- 🏷️ Git tagging and pushing
- 🚀 GitHub release creation via `gh` CLI
- 🧩 `.releasyrc.json` for default config
- 🧪 `--dry-run` support
- ✅ `--yes` for auto-confirm
- 🛠️ `--config`, `--changelog` overrides
- 📖 `--help` built-in documentation

---

## 📦 Installation

### Using npm

```bash
npm install -g releasy-it
```

### Using Yarn

```bash
yarn global add releasy-it
```

---

## 🚀 Usage

```bash
releasy-it [options]
```

### Options

| Flag              | Description                                      |
|-------------------|--------------------------------------------------|
| `--help`          | Show CLI help message                            |
| `--dry-run`       | Simulate the release process (no writes)         |
| `--yes`           | Skip all confirmation prompts                    |
| `--config <file>` | Use custom config instead of `.releasyrc.json`   |
| `--changelog <file>` | Save changelog to a specific file             |

---

### Example

```bash
releasy-it --changelog tool/changelog_v2.1.0.md --yes
```

---

## 🔧 .releasyrc.json (optional)

```json
{
  "repo": "kennedyowusu/releasy-js",
  "defaultTitle": "My Release",
  "skipConfirm": true,
  "useBuildNumber": true,
  "autoPush": true,
  "changelogFilePath": "tool/changelog_latest.md"
}
```

---

## 🛠 Development

### Build and link locally

```bash
npm install
npm run build
npm link
```

### Run manually

```bash
node dist/bin/index.js
```

---

## 🧾 License

MIT — feel free to use, improve, and share.

> Built with ❤️ by [Kennedy Owusu](https://github.com/kennedyowusu)
