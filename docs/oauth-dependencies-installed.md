# OAuth Dependencies Installation

## ✅ Dependencies Added to package.json

The following dependencies have been added to `package.json`:

### Production Dependencies
- **redis**: `^4.6.10` - Redis client for token caching
- **zod**: `^3.22.0` - Schema validation for API requests

### Development Dependencies
- **@types/node**: `^20.10.0` - TypeScript types for Node.js (already present)

---

## 📦 Installation

### Option 1: Using pnpm (Recommended)

```bash
cd /home/diegomartinez/Desktop/tetrix
pnpm install
```

### Option 2: Using npm

```bash
cd /home/diegomartinez/Desktop/tetrix
npm install
```

### Option 3: Using Installation Script

```bash
cd /home/diegomartinez/Desktop/tetrix
bash scripts/install-oauth-dependencies.sh
```

---

## ✅ Verification

After installation, verify the packages are installed:

```bash
# Check if redis is installed
npm list redis

# Check if zod is installed
npm list zod

# Or check package.json
cat package.json | grep -E "redis|zod"
```

---

## 🔧 Next Steps

1. **Install the dependencies** (run one of the commands above)
2. **Configure environment variables** in `docker.env` (see `docs/oauth-credentials-setup.md`)
3. **Run database migrations** (see `docs/oauth-next-steps.md`)
4. **Test OAuth flows** (see `docs/oauth-next-steps.md`)

---

## 📝 Notes

- The dependencies are now in `package.json` and will be installed when you run `pnpm install` or `npm install`
- Redis is used for token caching and session management
- Zod is used for API request validation in OAuth endpoints
- All OAuth services are ready to use once dependencies are installed

---

## 🐛 Troubleshooting

**Issue**: `pnpm: command not found`
- **Solution**: Install pnpm: `npm install -g pnpm` or use npm instead

**Issue**: `redis` package installation fails
- **Solution**: Ensure Node.js version is 18+ (project requires 20.19.2)

**Issue**: Type errors after installation
- **Solution**: Run `pnpm install` to ensure all dependencies are installed

---

## 📚 Related Documentation

- **Full OAuth Implementation**: `docs/oauth-implementation.md`
- **Next Steps**: `docs/oauth-next-steps.md`
- **Credentials Setup**: `docs/oauth-credentials-setup.md`
- **Quick Start**: `docs/oauth-quick-start.md`
