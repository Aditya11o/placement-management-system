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

---

## 📂 Manual Backup File Details

- **File Pattern**: `pms_backup_*.zip`
- **Contents**: Full source code (`frontend`, `backend`), documentation, `.env` files, and `uploads`.
- **Restoration**: Unzip into a new directory and run `npm run install-all` from the root.

## 🛠️ Restoration Steps

1.  **Extract the Zip**: Unzip any preferred backup into a new directory.
2.  **Install Dependencies**: Run `npm run install-all` from the root folder.
3.  **Run Dev Environment**: Run `npm run dev` from the root (requires `concurrently` package).

---
*Maintained by Antigravity*
