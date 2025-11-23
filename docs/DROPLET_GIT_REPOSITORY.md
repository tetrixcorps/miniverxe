# Droplet Git Repository Documentation

## Repository Location

The git repository on the DigitalOcean droplet is located at:

**Primary Location:** `/root/tetrix`

**Alternative Location:** `/root` (used in some scripts)

## Droplet Connection Details

- **IP Address:** `207.154.193.187` (current) or `167.99.87.123` (legacy)
- **User:** `root`
- **SSH Key:** `~/.ssh/tetrix_droplet_key` or `~/.ssh/tetrix_droplet_key.pem`

## Accessing the Repository

### SSH Connection

```bash
# Standard SSH connection
ssh root@207.154.193.187

# With SSH key
ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
```

### Navigate to Repository

```bash
# Once connected via SSH
cd /root/tetrix
# or
cd /root
```

## Available Scripts

### 1. Check Droplet Git Status
**Script:** `scripts/check-droplet-git-status.sh`

Compares local and droplet git repository status, including:
- Current branch
- Recent commits
- Remote configuration
- File existence checks

**Usage:**
```bash
./scripts/check-droplet-git-status.sh
```

**Repository Path Used:** `/root/tetrix`

### 2. Compare Droplet Branches
**Script:** `scripts/compare-droplet-branches.sh`

Compares local branches (main, staging, dev) with droplet branches.

**Usage:**
```bash
./scripts/compare-droplet-branches.sh [droplet-ip] [droplet-user]
```

**Example:**
```bash
./scripts/compare-droplet-branches.sh 207.154.193.187 root
```

**Repository Path Used:** `/root`

## Git Operations on Droplet

### Check Current Status

```bash
ssh root@207.154.193.187 "cd /root/tetrix && git status"
```

### View Recent Commits

```bash
ssh root@207.154.193.187 "cd /root/tetrix && git log --oneline -5"
```

### Check Current Branch

```bash
ssh root@207.154.193.187 "cd /root/tetrix && git branch --show-current"
```

### View Remote Configuration

```bash
ssh root@207.154.193.187 "cd /root/tetrix && git remote -v"
```

### Pull Latest Changes

```bash
ssh root@207.154.193.187 "cd /root/tetrix && git pull origin main"
```

## Syncing Local and Droplet Repositories

### From Local to Droplet

1. **Push changes to remote:**
   ```bash
   git push origin main
   ```

2. **Pull on droplet:**
   ```bash
   ssh root@207.154.193.187 "cd /root/tetrix && git pull origin main"
   ```

### From Droplet to Local

1. **Create bundle on droplet:**
   ```bash
   ssh root@207.154.193.187 "cd /root/tetrix && git bundle create /tmp/tetrix.bundle --all"
   ```

2. **Copy bundle to local:**
   ```bash
   scp root@207.154.193.187:/tmp/tetrix.bundle /tmp/tetrix.bundle
   ```

3. **Merge bundle into local:**
   ```bash
   git pull /tmp/tetrix.bundle main
   ```

## Branch Strategy

The droplet repository follows the same branch strategy as the local repository:

- **main** - Production branch
- **staging** - Pre-production branch
- **dev** - Development branch

## Important Notes

1. **Path Discrepancy:** Some scripts use `/root/tetrix` while others use `/root`. Verify the actual location on your droplet:
   ```bash
   ssh root@207.154.193.187 "ls -la /root | grep tetrix"
   ```

2. **IP Address:** The droplet IP may have changed. Update scripts if needed:
   - Current: `207.154.193.187`
   - Legacy: `167.99.87.123`

3. **SSH Key:** Ensure your SSH key has proper permissions:
   ```bash
   chmod 600 ~/.ssh/tetrix_droplet_key
   ```

4. **Git Configuration:** The droplet repository should be configured with the same remote as your local repository:
   ```bash
   ssh root@207.154.193.187 "cd /root/tetrix && git remote -v"
   ```

## Troubleshooting

### Cannot Connect via SSH

1. Check SSH key permissions:
   ```bash
   ls -la ~/.ssh/tetrix_droplet_key*
   ```

2. Test SSH connection:
   ```bash
   ssh -i ~/.ssh/tetrix_droplet_key root@207.154.193.187
   ```

3. Verify droplet IP address is correct

### Repository Not Found

1. Check if repository exists:
   ```bash
   ssh root@207.154.193.187 "ls -la /root/tetrix"
   ```

2. Check alternative location:
   ```bash
   ssh root@207.154.193.187 "ls -la /root"
   ```

3. Initialize repository if needed:
   ```bash
   ssh root@207.154.193.187 "cd /root && git init"
   ```

### Branches Out of Sync

1. Check local branches:
   ```bash
   git branch -a
   ```

2. Check droplet branches:
   ```bash
   ssh root@207.154.193.187 "cd /root/tetrix && git branch -a"
   ```

3. Compare commits:
   ```bash
   ./scripts/compare-droplet-branches.sh
   ```

## Related Documentation

- `scripts/check-droplet-git-status.sh` - Status checking script
- `scripts/compare-droplet-branches.sh` - Branch comparison script
- `scripts/git-workflow.sh` - Local git workflow helper

