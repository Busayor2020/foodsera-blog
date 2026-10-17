# Foodsera

Nigerian recipe blog at [foodsera.com](https://foodsera.com). React 19, React Router v8 (framework mode, fully prerendered), Tailwind CSS v4.

See [CLAUDE.md](CLAUDE.md) for the project rules, structure and build phases. The design handoff in `design/` is the source of truth for the UI.

## Commands

```bash
npm install
npm run dev          # dev server (add -- --host to test on a phone)
npm run build        # static build with prerendering, output in build/client
npm run typecheck
npm run lint
npm run test
npx serve build/client   # preview the static build
```

Requires Node 22.22 or newer.
