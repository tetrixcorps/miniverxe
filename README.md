# TETRIX & JoRoMi Voice API

A comprehensive voice API implementation with Telnyx, Deepgram STT, and SHANGO AI integration for cross-platform unified messaging.

## 📚 Documentation

All project documentation is organized in the [`/docs`](./docs/) directory:

- **[API Documentation](./docs/api/)** - API implementation and testing
- **[Database Documentation](./docs/database/)** - Database setup and management
- **[Testing Documentation](./docs/testing/)** - Testing strategies and results
- **[Deployment Documentation](./docs/deployment/)** - Deployment guides and status
- **[Analysis Documentation](./docs/analysis/)** - System analysis and architecture

## 🚀 Project Overview
TETRIX is a professional services SaaS platform. This site is designed to:
- Showcase solutions, services, and company info
- Provide a bold, modern, and accessible user experience
- Feature a dynamic, animated logo and a fiery red/burnt orange color scheme

## 🛠️ Tech Stack
- [Astro](https://astro.build/) (v5+)
- [Tailwind CSS](https://tailwindcss.com/) (v3)
- Custom SVG logo with animation
- Modular, accessible components

## 📁 Project Structure
```
tetrix/
  src/
    components/
      layout/      # Layout, Header, Footer, Logo
      shared/      # Reusable UI components (Button, FeatureCard, etc.)
    pages/         # All main site pages (index, about, solutions, services, contact)
    styles/        # Tailwind CSS entry
  public/          # Static assets (favicon, etc.)
  tailwind.config.js
  astro.config.mjs
  README.md
```

## 🎨 Color Scheme & Theme
- **Primary:** Fiery Red (`#FF3B30`)
- **Accent:** Burnt Orange (`#FF9500`), Yellow (`#FFB300`)
- **Dark:** Deep Maroon (`#B71C1C`)
- **Light:** Off-white (`#FFF8E1`)
- All gradients, buttons, and highlights use this palette for a bold, energetic look.

## ✨ Features
- **Dynamic SVG Logo:** Animated, geometric, and brand-aligned
- **Responsive Navigation:** Desktop and mobile menus, with Home button on every page
- **Componentized UI:** Button, FeatureCard, TestimonialCard, LogoGrid, etc.
- **Modern Layout:** Hero, partner logos, features, testimonials, and more
- **Accessible:** Semantic HTML, focus states, color contrast
- **Customizable:** Easily update theme, content, or add new pages/components

## 🖥️ Local Development
1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the dev server:**
   ```bash
   npm run dev
   ```
3. **Visit:** [http://localhost:8082](http://localhost:8082) (or the port shown in your terminal)

## 🐳 Docker Support
- A `Dockerfile` is included for containerized builds and deployment.

## 🧩 Customization
- **Colors:** Edit `tailwind.config.js` under `theme.extend.colors.brand`
- **Logo:** Update `src/components/layout/Logo.astro` for animation or style tweaks
- **Navigation:** Edit `src/components/layout/Header.astro`
- **Content:** All main pages are in `src/pages/`

## 📝 Further Improvements
- Add dark mode or seasonal logo variants
- Integrate a CMS or Firestore backend
- Add more advanced SaaS features (blog, dashboard, etc.)
- Polish accessibility and SEO further

---

**Built with ❤️ for modern SaaS.**

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
