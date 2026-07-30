# Third-party software and licenses

Last verified from installed npm package metadata: 29 July 2026

AccessLoom itself is licensed `AGPL-3.0-only`. This notice records the direct
third-party packages used by the lockfile-resolved project. Package names,
versions, and SPDX license identifiers below were read from each installed
package’s `package.json`, not inferred from memory.

## Runtime dependencies

| Package | Resolved version | Declared license | Upstream |
| --- | ---: | --- | --- |
| `dexie` | 4.4.4 | Apache-2.0 | [dexie/Dexie.js](https://github.com/dexie/Dexie.js) |
| `dexie-react-hooks` | 1.1.7 | Apache-2.0 | [dexie/Dexie.js](https://github.com/dexie/Dexie.js) |
| `lucide-react` | 0.468.0 | ISC | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) |
| `react` | 18.3.1 | MIT | [facebook/react](https://github.com/facebook/react) |
| `react-dom` | 18.3.1 | MIT | [facebook/react](https://github.com/facebook/react) |
| `zod` | 3.25.76 | MIT | [colinhacks/zod](https://github.com/colinhacks/zod) |

## Development dependencies

| Package | Resolved version | Declared license | Upstream |
| --- | ---: | --- | --- |
| `@types/react` | 18.3.31 | MIT | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react) |
| `@types/react-dom` | 18.3.7 | MIT | [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-dom) |
| `@vitejs/plugin-react` | 4.7.0 | MIT | [vitejs/vite-plugin-react](https://github.com/vitejs/vite-plugin-react) |
| `typescript` | 5.6.3 | Apache-2.0 | [microsoft/TypeScript](https://github.com/microsoft/TypeScript) |
| `vite` | 6.4.3 | MIT | [vitejs/vite](https://github.com/vitejs/vite) |
| `vitest` | 4.1.10 | MIT | [vitest-dev/vitest](https://github.com/vitest-dev/vitest) |

## Transitive dependency audit

The installed dependency tree at the verification date contained 106 package
directories. Their declared license identifiers were:

| License identifier | Package count |
| --- | ---: |
| MIT | 91 |
| ISC | 7 |
| Apache-2.0 | 5 |
| BSD-2-Clause | 1 |
| BSD-3-Clause | 1 |
| CC-BY-4.0 | 1 |

The non-MIT transitive packages observed were:

| Package | Resolved version | Declared license |
| --- | ---: | --- |
| `baseline-browser-mapping` | 2.11.7 | Apache-2.0 |
| `dexie` | 4.4.4 | Apache-2.0 |
| `dexie-react-hooks` | 1.1.7 | Apache-2.0 |
| `expect-type` | 1.4.0 | Apache-2.0 |
| `typescript` | 5.6.3 | Apache-2.0 |
| `terser` | 5.49.0 | BSD-2-Clause |
| `source-map-js` | 1.2.1 | BSD-3-Clause |
| `caniuse-lite` | 1.0.30001806 | CC-BY-4.0 |
| `electron-to-chromium` | 1.5.398 | ISC |
| `lru-cache` | 5.1.1 | ISC |
| `lucide-react` | 0.468.0 | ISC |
| `picocolors` | 1.1.1 | ISC |
| `semver` | 6.3.1 | ISC |
| `siginfo` | 2.0.0 | ISC |
| `yallist` | 3.1.1 | ISC |

This summary is not a replacement for the license text, attribution, copyright,
or notice files shipped by each package. Canonical texts are available in the
package distributions and linked upstream repositories. Downstream
distributors should retain every notice required by the exact dependency graph
they ship.

`package-lock.json` is authoritative for resolved dependency versions. Regenerate
and recheck this notice whenever dependencies change; permissive license status
is a release gate, not an assumption.

Browser APIs, IndexedDB, Web Crypto, CSS system fonts, and the user’s browser are
platform capabilities rather than bundled npm dependencies. Bolt hosting,
GitHub, and external guidance sites are services/links and are not included in
the application’s third-party source distribution.

