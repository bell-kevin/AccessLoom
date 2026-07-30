# AccessLoom privacy notice

Last updated: 29 July 2026

AccessLoom is designed so its application operator does not need a copy of your
workplace observations. The core application is static, has no AccessLoom
account, and has no application backend, analytics SDK, advertising SDK, remote
font, or required third-party API.

This notice describes the AccessLoom application code in this repository. A
website host, browser vendor, operating system, downloaded-file destination, or
external site may process information independently under its own policy.

## What AccessLoom stores

AccessLoom stores the substantive workspace in an IndexedDB database named
`accessloom` in your current browser profile and origin:

- optional passport profile information;
- passport section choices;
- workplace-friction check-ins;
- support ideas and experiments;
- self-entered ratings and review notes;
- follow-through commitments; and
- whether a support is selected for the passport.

Display choices for text scale, contrast, and motion are stored separately in
`localStorage` under `accessloom-display`.

The service worker and browser cache may store application HTML, CSS,
JavaScript, the web app manifest, and icons for availability. They do not store
workspace records.

The fictional demo is ordinary local data and is clearly marked as a demo.

## What application code sends automatically

AccessLoom application code does not automatically send workspace or preference
data to a server.

Loading the website necessarily requests static files from its host. That host
may process ordinary delivery information such as IP address, user agent,
request path, timestamp, and operational logs. AccessLoom application code does
not receive or combine those logs with your workspace. Consult the policy of
the host serving the copy you use.

The application does not set its own tracking cookies.

## Actions that move data

Data crosses the local application boundary only through an action you choose:

- **Plain backup:** downloads a readable, unencrypted JSON copy containing every
  check-in and private note in the complete workspace.
- **Encrypted backup:** encrypts the complete workspace in the browser and
  downloads an encrypted JSON envelope.
- **Restore:** after a replacement warning, reads a backup file you select and
  replaces the current workspace only after size, decryption, and schema
  validation.
- **Passport copy:** writes the selected passport text to the operating-system
  clipboard.
- **Passport download:** creates a standalone HTML file from selected passport
  sections and supports.
- **Print or save PDF:** sends the selected passport to the browser/operating
  system print flow.
- **Conversation draft copy:** copies a selected support conversation to the
  clipboard.
- **External link:** opens source, license, or public guidance in another site.

Your browser, operating system, password manager, clipboard manager, cloud-drive
folder, backup software, printer, or recipient may retain these outputs. Review
their settings and policies.

Raw check-ins and private notes are not automatically included in passport
outputs. The user controls passport sections and which supports are selected.
Generated support summaries may include aggregate counts and averages from
linked check-ins; they are labeled as descriptive rather than causal.

## Backup encryption

Encrypted backup export currently uses:

- AES-GCM with a 256-bit key;
- PBKDF2 with SHA-256 and 310,000 iterations;
- a fresh random 16-byte salt; and
- a fresh random 12-byte initialization vector.

Encryption and decryption occur through the browser’s Web Crypto API. The
passphrase and derived key are not stored by AccessLoom.

There is no passphrase reset or recovery service. Keep the passphrase separately
from the backup. A forgotten passphrase makes the encrypted backup
unrecoverable. The export form requires a matching confirmation to reduce the
risk of an unnoticed typo.

Encrypted export protects that downloaded file. It does not encrypt the live
IndexedDB database, a plain export, clipboard contents, screenshots, printouts,
or a passport after it has been opened or decrypted.

## Browser and origin limits

Browser storage is scoped to an exact origin. The following have separate
workspaces:

- a local development URL and a live website;
- a Bolt preview and a `*.bolt.host` deployment;
- two different `*.bolt.host` names;
- a `*.bolt.host` name and a custom domain;
- different browser profiles; and
- different devices.

Changing the hostname does not transfer data. Export a complete backup on the
old origin, keep that origin available, restore on the new origin, verify the
records, and only then retire the old origin.

Requesting durable browser storage may lower automatic eviction risk, but the
browser can deny the request and it is never a backup.

## Retention and deletion

Records remain in the browser until one of these occurs:

- you delete an individual check-in or follow-through record;
- you replace them by restoring another valid backup;
- you start a fresh/demo workspace after confirming replacement;
- you choose **Clear this browser’s workspace**;
- you clear the site’s browser data;
- the browser evicts storage; or
- the browser profile or device is removed or lost.

Clearing the AccessLoom workspace removes the four application data tables but
does not necessarily remove cached application files or display preferences.
To remove everything for an origin, use the browser’s site-data controls.

Because application code does not hold a server copy, project maintainers
cannot retrieve, correct, delete, or recover your workspace for you. Those
controls are local.

## Sensitive-data guidance

- A diagnosis is not required. Record the minimum detail useful to you.
- Use neutral labels when a shared screen or browser profile could expose data.
- Prefer an encrypted backup for sensitive records.
- Store the backup and passphrase separately.
- Review passport and conversation output before sharing.
- Confirm the recipient and destination before pasting, printing, or sending.
- Do not use AccessLoom as the only record for an urgent, medical, legal, or
  safety-critical process.

## No sale, advertising, or application analytics

The AccessLoom code in this repository does not sell personal data, profile
users for advertising, or run application analytics. A modified fork can change
that behavior; review the source and privacy notice of the particular deployment
you use.

## Changes and questions

Material privacy changes should update this file, the date above, the
architecture documentation, and the in-app explanation. A feature that adds
sync or accounts must be opt-in and disclose the provider, data flow, retention,
access controls, and whether the provider can read record contents.

For a suspected security issue, follow [SECURITY.md](SECURITY.md). For the exact
current data flow, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
