# TradeMind frontend repository

This folder is the independent frontend repository. Suggested GitHub name: trademind-frontend. Run Git and application commands here. See [local setup](local_setup.md).

## Documentation

Keep only frontend documentation in this repository. Its specification and implementation plan live in doc/. The companion repository owns its own specification, plan, setup and handoffs. The authoritative shared auth contract lives in [backend/doc/auth_contract.md](../../backend/doc/auth_contract.md).

Companion links assume sibling frontend/ and backend/ checkouts. For other folder names, locate the companion checkout explicitly. Once GitHub repositories exist, use their actual URLs when linking across repositories in GitHub; no remote URLs have been invented.

Specification contents were preserved byte-for-byte. Folder diagrams and bootstrap commands inside them describe the former combined workspace; use local setup for current commands. Phase handoffs contain this side's historical delivery and verification results, not checks rerun during restructuring. The original combined handoffs/setup were preserved outside both repositories in the ignored parent .tools/restructure-original-docs directory.

Both plans retain the shared phase sequence and backend prerequisites. Coordinate API changes with linked pull requests across the repositories and record compatible companion commit IDs. Never duplicate the companion specification or silently change its contracts.

## GitHub setup

The local repository uses main, with no initial commit or remote. Create an empty GitHub repository, then run:

```powershell
git add .
git diff --cached --stat
git status
# Review the staged files before committing.
```
```powershell
git commit -m "chore: add frontend baseline"
git remote add origin https://github.com/YOUR_USERNAME/trademind-frontend.git
git push -u origin main
```

Use a task branch and pull request for subsequent work. No GitHub repository is created or published by this local restructuring.


