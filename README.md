# 📦 Releasy CLI

**Releasy** is a lightweight, interactive CLI tool that simplifies versioning, changelog creation, Git tagging, and GitHub releases for Node.js and TypeScript projects.

---

## ✨ Features

- 🔖 Interactive semantic version input (e.g. `v1.2.3`)
- 🧠 Smart Git safety checks (uncommitted or unpushed changes)
- 📝 Markdown changelog capture via terminal input
- 🏷️ Git tagging with annotated changelogs
- 📦 Automatic `package.json` version bump
- 🚀 Draft GitHub release creation using `gh` CLI
- 🧼 Clear CLI output with safety prompts

---

## 🧑‍💻 Installation

### 1. Clone or download the project

```bash
git clone https://github.com/kennedyowusu/releasy-js.git
cd releasy-js
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the CLI

```bash
npm run build
```

### 4. Link globally (optional)

```bash
npm link
```

> Now you can run `releasy` from anywhere.

---

## 🚀 Usage

From any Git-initialized Node.js or TypeScript project:

```bash
releasy
```

### Interactive Prompts

1. **Version tag** (e.g. `v1.2.0`)
2. **Release title**
3. **Markdown changelog** (paste and press `CTRL+D` / `CMD+D` to end)

---

## 🧠 How It Works

Internally, Releasy will:

1. Confirm no uncommitted or unpushed changes
2. Check if the Git tag already exists
3. Prompt for title and changelog
4. Bump `package.json` with semver + build metadata
5. Create an annotated Git tag with changelog
6. Push both commits and tag
7. Use the [GitHub CLI](https://cli.github.com/) to create a **draft release**

---

## 📄 Example

```bash
📦 Releasy CLI — Your JS Release Assistant
🔖 Enter release version (e.g. v1.2.3): v1.4.0
📝 Enter release title: Add auto-sync support

✍️ Paste your changelog (markdown). Press CTRL+D when done:

- Added auto-sync support
- Improved CLI stability
- Refactored git safety logic
```

---

## 🛠️ Requirements

- Git must be initialized
- GitHub CLI (`gh`) must be installed and authenticated

```bash
gh auth login
```

---

## 🗂 .gitignore Recommendation

```gitignore
node_modules/
dist/
.vscode/
.idea/
*.log
.history/
.DS_Store
```

---

## 🧪 Dev Commands

| Action           | Command         |
|------------------|------------------|
| Build CLI        | `npm run build`  |
| Run CLI directly | `npm start`      |
| Link globally    | `npm link`       |
| Unlink           | `npm unlink`     |

---

## 🧾 License

MIT — free to use, modify, and share.

---

> Built with ❤️ by [Kennedy Owusu](https://github.com/kennedyowusu)
