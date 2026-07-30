<a name="readme-top"></a>

# AccessLoom

> Work should fit humans.

https://accessloom.org 

AccessLoom is a private, local-first workplace-support lab and access-passport
builder. It helps a person notice friction, try a small practical support,
observe what changes, track follow-through, and share only the conclusions they
choose.

There is no account, application backend, analytics SDK, ad network, or required
cloud database. The useful product runs in the browser and is licensed
**AGPL-3.0-only**.

## The core loop

```text
Notice privately
      ↓
Try one small, time-bounded support
      ↓
Observe descriptive patterns
      ↓
Keep, change, pause, or stop
      ↓
Promote only selected findings into an access passport
```

AccessLoom separates a **private learning space** from a **selective sharing
space**. Raw check-ins and private notes are never placed in the passport.
Selecting a support can include a clearly labeled count-and-average summary,
without disclosing individual entries.

## What it can do

- Capture short check-ins about context, workplace barriers, friction, capacity,
  supports used, notes, and wins.
- Turn a support idea into a concrete experiment with setup guidance, a success
  marker, status, ratings, and a review date.
- Calculate transparent, on-device summaries with observation counts and
  cautious labels such as “Early clue” and “Needs more data.”
- Compare self-reported friction for the same barrier and work context with and
  without a selected support, using an explicit trial and baseline window.
- Track agreed actions, owners, dates, and follow-through.
- Build a section-by-section access passport from only the profile details and
  supports the user selects, including transparent aggregate evidence when it
  exists.
- Copy passport text, download a standalone HTML passport, or print/save it as
  PDF.
- Export a complete versioned JSON backup.
- Export and restore a passphrase-encrypted backup using browser-native
  AES-256-GCM and PBKDF2-SHA-256.
- Validate restore sizes, dates, field lengths, record counts, and fixed
  cryptographic parameters before replacing any local data.
- Delete mistaken check-ins or follow-through records without resetting the
  whole workspace.
- Work as a responsive static website, with optional install and offline
  behavior after a successful online load.
- Start with a clearly marked fictional demo or a blank private workspace.

AccessLoom is not a productivity score, diagnosis tool, medical record, legal
determination, or automatic approval of a workplace adjustment. Its pattern
language describes associations in self-recorded observations; it does not
prove causation.

## Why this project

Access-passport documents and proprietary workplace-adjustment systems already
exist. AccessLoom does not claim to have invented the access passport.

Targeted research completed on 29 July 2026 found no inspected FLOSS application
that combined all four of these elements:

1. private longitudinal workplace-friction check-ins;
2. time-bounded support experiments;
3. transparent on-device pattern analysis; and
4. user-selected promotion of findings into a portable access passport.

That is a bounded prior-art finding, not an absolute “world’s first” claim.
Searches can miss unpublished, unindexed, differently named, or future work.
Read the methods, closest prior art, live-site checks, and cautious novelty
language in [the research record](docs/RESEARCH.md).

## Privacy model

Workspace data is stored in the browser’s IndexedDB database named
`accessloom`. Display preferences use `localStorage`. Application code does not
upload either one.

Important limitations:

- The live IndexedDB database is **not encrypted at rest by AccessLoom**.
  Someone with access to the unlocked browser profile, a malicious browser
  extension, compromised device, or malicious same-origin script may be able to
  inspect it.
- Data belongs to the exact browser origin, profile, and device. A Bolt preview,
  a `*.bolt.host` site, a renamed hostname, and a custom domain each have
  separate storage.
- Clearing site data or losing the browser profile can remove the workspace.
- Browser durable-storage permission reduces eviction risk but is not a backup.
- PWA caching stores application files, not workspace records, and is not a
  backup.
- Plain JSON backups are readable. Encrypted export protects the downloaded
  backup file only; it does not encrypt the live database.
- There is no passphrase reset or recovery service.
- Downloads, printing, clipboard operations, and external links cross the local
  application boundary only when the user chooses them. The operating system,
  browser, or another application may retain those outputs.
- The static host may independently process ordinary web-server data such as IP
  addresses and request logs under its own policy. AccessLoom application code
  does not receive that data.

Export a backup before changing domains, browsers, or devices. Keep an encrypted
backup and its passphrase in separate trusted places when the records are
sensitive.

See [PRIVACY.md](PRIVACY.md) for the user-facing privacy notice and
[the architecture document](docs/ARCHITECTURE.md) for data flows and security
boundaries.

## Quick start

Node.js 22 and npm are recommended.

```sh
git clone <your-fork-or-repository-url>
cd accessloom
npm ci
npm run dev
```

Open the local URL printed by Vite. No environment variable is required.

To make the in-app **Source code** link point to a particular public repository:

```sh
cp .env.example .env
```

Then set:

```text
VITE_SOURCE_URL=https://github.com/your-name/accessloom
```

`VITE_` variables are compiled into public browser code. Never put secrets in
them.

The app runs without this variable, but a public AGPL deployment should set it
to the exact corresponding-source repository before publication.

## Quality checks

```sh
npm run typecheck
npm test
npm run build
npm run smoke
```

`npm run smoke` is a real-browser production check. It rebuilds the project,
starts Vite preview on port 4173, launches a headless Chromium-family browser,
and verifies the welcome screen, fictional demo, all four hash views, dialog
behavior, a check-in that survives reload, unnamed interactive controls in the
accessibility tree, and dashboard/ledger mobile layouts. It saves screenshots
in `.artifacts/`.

The smoke test requires a locally installed Microsoft Edge, Google Chrome, or
Chromium in one of the standard paths listed in
[`scripts/browser-smoke.mjs`](scripts/browser-smoke.mjs). It also needs ports
4173 and 9333 to be available. A browserless server will fail with
“A Chromium-family browser was not found.”

## Deploy with Bolt

AccessLoom is deliberately compatible with Bolt’s static publishing path:

- Vite produces `dist/`;
- navigation uses URL hashes, so no server rewrite is required;
- there is no production Node process or database;
- all PWA paths target the origin root.

Follow [Deploying AccessLoom with Bolt](docs/DEPLOYING_WITH_BOLT.md) for GitHub
import, build checks, publishing, PWA validation, free-host resource limits, and
the backup-before-domain-change procedure.

## Accessibility

AccessLoom is designed to make its interface fit too. The current implementation
includes:

- semantic landmarks and heading structure;
- a skip link;
- keyboard-operable controls and dialogs;
- visible focus indicators;
- status announcements for important actions;
- larger interface text, high-contrast, and reduced-motion preferences;
- responsive desktop and mobile navigation;
- print styles for the access passport; and
- plain language that avoids turning disability or access needs into a
  performance score.

This is not a claim of formal WCAG conformance. Accessibility reviews, assistive
technology testing, and reports from people with varied access needs are
especially welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Technical shape

- React 18 + TypeScript
- Vite static build
- Dexie over IndexedDB
- Zod backup validation
- Web Crypto encrypted exports
- Lucide icons
- Vitest unit tests
- hand-written service worker with user-controlled updates
- no runtime third-party service dependency

The architecture, table schema, selective-sharing boundary, encryption format,
and replaceable future-sync principles are documented in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Direct dependency licenses and
resolved versions are recorded in
[THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Project status

AccessLoom is an early public project (`0.1.0`). Use synthetic data while
evaluating it, maintain backups, and review generated material before sharing
it. Do not rely on it for emergency, medical, employment, or legal decisions.

Security concerns should follow [SECURITY.md](SECURITY.md). Contributions are
welcome under [CONTRIBUTING.md](CONTRIBUTING.md).

## License

AccessLoom is free/libre and open-source software licensed
[GNU Affero General Public License v3.0 only](LICENSE), expressed by the SPDX
identifier `AGPL-3.0-only`.

By contributing, you agree that your contribution is available under that same
license. The network-use source provision is intentional: people interacting
with a modified hosted version should be able to obtain its corresponding
source.

<p align="right"><a href="#readme-top">back to top</a></p>
