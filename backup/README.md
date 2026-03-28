# Project Backup System

This folder contains the automated backups for the **Placement Management System**.

## 🚀 Automated Backup

To create a new timestamped backup, run this command from the project root:

```ps1
npm run backup
```

### What it Does
1.  **Timestamping**: Creates a new zip file named `pms_backup_YYYYMMDD_HHMM.zip`.
2.  **Smart Exclusions**: Automatically excludes `node_modules`, `.git`, and the `backup` folder to keep the backup efficient.
3.  **Rotation Logic**: Automatically keeps only the **last 5 backups** to save disk space.
4.  **Includes .env**: Your `.env` secrets file IS included in backups (unlike git, which ignores it).

---

## 🔐 Important: About the `.env` File

The `.env` file contains **all your secret credentials** (database passwords, API keys, JWT secrets). It is located at:

```
backend/.env
```

### How to Find It
- **In VS Code**: The file is hidden by default. Press `Ctrl+Shift+P` → type "Files: Exclude" → temporarily remove `**/.env` if it's listed, OR simply open the file directly via `File > Open File` → navigate to `backend/.env`.
- **In File Explorer**: Enable "Show hidden items" in the View menu, then navigate to the `backend` folder.
- **In Terminal**: Run `notepad backend\.env` from the project root.

### How to Edit It
Open `backend/.env` in any text editor. The format is `KEY=VALUE` (one per line). Example:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pms
JWT_SECRET=your_long_random_secret_here
SMTP_USER=your_email@gmail.com
```

### Why It's Not in Git
`.env` is listed in `.gitignore` to prevent you from accidentally pushing passwords to GitHub. This is a **security best practice**. Instead, we maintain a safe template at `backend/.env.example` that IS committed to git.

### If You Lose Your `.env`
1. Copy the template: `cp backend/.env.example backend/.env`
2. Fill in your actual credentials
3. Generate new JWT secrets with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## 📂 Backup File Details

- **File Pattern**: `pms_backup_*.zip`
- **Contents**: Full source code (`frontend`, `backend`), documentation, `.env` files, and `uploads`.
- **Restoration**: Unzip into a new directory and run `npm run install-all` from the root.

## 🛠️ Restoration Steps

1.  **Extract the Zip**: Unzip any preferred backup into a new directory.
2.  **Install Dependencies**: Run `npm run install-all` from the root folder.
3.  **Verify `.env`**: Ensure `backend/.env` exists and has correct values (it should be included in the zip).
4.  **Run Dev Environment**: Run `npm run dev` from the root (requires `concurrently` package).

---
*Maintained by Antigravity*
