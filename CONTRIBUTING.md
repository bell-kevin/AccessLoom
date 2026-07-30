# Contributing to AccessLoom

Thank you for helping make workplace support more inspectable, private, and
person-controlled.

AccessLoom welcomes code, tests, accessibility findings, design feedback,
documentation, translations, research corrections, and carefully scoped feature
proposals. Lived experience is valuable. Nobody needs to disclose a diagnosis,
employer, or personal workplace record to contribute.

## Ground rules

- Treat disability, neurodivergence, chronic illness, and access needs with
  respect.
- Discuss barriers and environmental fit without diagnosing another person.
- Do not submit real workplace records, medical information, employer-confidential
  material, or another person’s identifying data in issues, tests, screenshots,
  or pull requests.
- Use fictional or synthetic fixtures.
- Do not represent AccessLoom output as medical, statistical, employment, or
  legal proof.
- Report suspected vulnerabilities privately as described in
  [SECURITY.md](SECURITY.md).

Harassment, coercive disclosure, demeaning language, and attempts to turn the
project into hidden employee monitoring are not acceptable.

## Before a large change

Open an issue or discussion before investing in a large feature, data-model
change, new dependency, or architectural rewrite. Describe:

- the user problem;
- who controls the data;
- what, if anything, would leave the browser;
- the effect on selective disclosure and accessibility;
- the effect on static Bolt deployment and bundle size; and
- a smaller alternative, if one exists.

Small fixes, focused tests, copy corrections, and documentation improvements can
go directly to a pull request.

## Development setup

Use Node.js 22 and npm.

```sh
git clone <your-fork-url>
cd accessloom
npm ci
npm run dev
```

No backend, database account, or API credential is required. The optional
`VITE_SOURCE_URL` value controls only the public source-code link.

## Required checks

Before opening a pull request, run:

```sh
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

For changes affecting interactions, layout, routing, dialogs, or production
startup, also run:

```sh
npm run smoke
```

The smoke check requires an installed Chromium-family browser and available
ports 4173 and 9333. It writes review screenshots to `.artifacts/`; do not add
those generated screenshots to a commit unless a maintainer specifically asks
for them.

Add or update tests for changed behavior. The existing unit tests cover
descriptive pattern calculations and portable-data behavior. Prefer tests that
state the privacy or uncertainty invariant they protect.

## Architecture invariants

Changes should preserve these defaults:

1. **Useful without an account.** The core workflow works locally and offline
   after the application shell has loaded.
2. **No silent upload.** Workspace data does not leave the browser without a
   specific, understandable user action.
3. **Private before shared.** Raw check-ins and notes are not automatically
   copied into a passport or conversation draft.
4. **Transparent patterns.** Show counts, comparison conditions, and
   uncertainty. Do not imply diagnosis or causation.
5. **Portable data.** Users can export their complete workspace in a documented,
   versioned format.
6. **Replaceable infrastructure.** A future opt-in sync provider must be an
   adapter, not the domain model, and the Dexie-only workflow must keep working.
7. **Static deployability.** Production remains compatible with Vite static
   output and hash navigation unless the project explicitly adopts and
   documents another model.
8. **Accessible interaction.** Keyboard, focus, motion, contrast, zoom/text
   scale, screen-reader naming, mobile layout, and print output are design
   inputs, not cleanup work.

Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before changing persistence,
backup, passport, encryption, or PWA code.

## Data-model and backup changes

The IndexedDB schema version and portable backup schema version are separate.

When changing stored data:

- add an explicit Dexie migration rather than mutating old records ad hoc;
- test an upgrade from realistic previous-version data;
- decide whether old code can safely read the upgraded database;
- update Zod backup schemas and add a forward migration when necessary;
- retain user data and selective-sharing choices;
- test plain and encrypted export/restore;
- document whether restore replaces or merges data; and
- update architecture and deployment documentation.

Never weaken validation merely to accept a broken fixture.

## Security-sensitive changes

Take extra care around:

- user-controlled HTML or URLs;
- generated passports and print output;
- clipboard and file operations;
- service-worker cache behavior;
- backup parsing, cryptography, and passphrases;
- cross-origin requests;
- dependencies that execute code at build or runtime; and
- any feature that introduces authentication or synchronization.

Do not implement custom cryptographic primitives. Use audited browser APIs or a
well-reviewed FLOSS library, document the format, and add interoperability and
failure tests.

## Dependencies

Prefer the browser platform and small, actively maintained FLOSS packages.

A dependency proposal must:

- have a clear need that cannot be met reasonably by current code;
- use an AGPLv3-compatible license;
- work in Bolt/StackBlitz’s JavaScript/WebAssembly environment without an
  unsupported native add-on;
- avoid telemetry, remote-code loading, proprietary hosted requirements, and
  unnecessary transitive weight;
- be reviewed for bundle and security impact;
- update `package-lock.json`; and
- update [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

Do not add a remote font, analytics tag, CDN script, or proprietary API for
convenience.

## PWA changes

`public/sw.js` is hand-maintained. When a release should activate a new worker
and cache, increment `CACHE_VERSION` and test upgrading from the previous
production build. Preserve the user-controlled update prompt; do not reload an
open form without consent.

PWA functionality is progressive enhancement. The online website must still
work when service-worker registration or installation is unavailable.

## Writing and research

Use direct, non-pathologizing language. Prefer:

- “reported in four check-ins” over “proven”;
- “support” or “adjustment” over “fixing the person”;
- “descriptive association” over “cause”; and
- “may help” over “will work.”

Novelty and market claims need a dated method and sources. Do not use “first,”
“only,” or equivalent absolute language. Corrections to
[docs/RESEARCH.md](docs/RESEARCH.md) should explain what was rechecked and when.

## Pull requests

Keep each pull request focused. Include:

- the problem and chosen approach;
- user-visible and privacy effects;
- tests performed;
- screenshots for meaningful visual changes, using fictional data;
- migration or rollback notes, if applicable; and
- documentation and third-party notice updates.

CI must pass. A green CI result does not replace manual keyboard, mobile,
offline, print, or assistive-technology review where relevant.

## Contribution license

The project is `AGPL-3.0-only`. By submitting a contribution, you certify that
you have the right to provide it and agree that it will be distributed under
the GNU Affero General Public License version 3 only. No separate contributor
license agreement is required.

