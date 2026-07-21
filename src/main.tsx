// Standalone entry. Runs only when you launch this remote on its own (`bun dev`).
// When a host federates this app in, it imports the exposed `./main` module
// directly and this file never executes.
import './index.css';

// Async boundary (Module Federation): the shared scope must initialize before any
// shared singleton (react, wagmi, @tanstack/react-query, react-i18next) is
// evaluated. A *static* import of ./bootstrap would evaluate those too early and
// throw "React.createContext is not a function" on standalone launch. The dynamic
// import guarantees the entry — where MF injects its init — runs first.
import('./bootstrap');
