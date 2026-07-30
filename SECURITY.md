# Security policy

AccessLoom may contain sensitive workplace observations. Please handle security
reports carefully and use only synthetic data when reproducing a problem.

## Supported versions

AccessLoom is currently an early project. Security fixes are made on the default
branch and included in the next release.

| Version | Supported |
| --- | --- |
| Default branch / latest release | Yes |
| Older releases and forks | No guaranteed support |

Operators of modified or hosted forks are responsible for monitoring upstream
fixes and updating their deployments.

## Report a vulnerability privately

Use the repository’s **Security → Report a vulnerability** option to submit a
private GitHub security advisory.

Please do not open a public issue for a vulnerability that could expose user
data, bypass backup encryption, inject content, poison an update, or compromise
the build. If private vulnerability reporting is unavailable, open a public
issue containing no technical details or exploit material and ask the
maintainer to enable a private reporting channel.

Include, when safe:

- the affected version or commit;
- the browser and operating system;
- the affected component and expected security boundary;
- concise reproduction steps using synthetic data;
- impact and realistic attack prerequisites;
- whether user interaction is required;
- suggested remediation, if known; and
- whether you intend coordinated public disclosure.

Do not attach a real AccessLoom database, workplace note, passport, backup, or
passphrase.

## Response process

This is a volunteer FLOSS project with no paid bug-bounty program or guaranteed
service level. Maintainers aim to:

1. acknowledge a private report within seven days;
2. confirm scope and severity or request more information;
3. prepare and test a fix;
4. coordinate a release and disclosure date; and
5. credit the reporter if requested.

Complex reports may take longer. Please allow a reasonable remediation window
before public disclosure, while raising any evidence of active exploitation
immediately.

## High-value report areas

Reports are especially useful for:

- cross-site scripting or unsafe generated passport HTML;
- unexpected network transmission of IndexedDB records or display preferences;
- reading or writing another origin’s data;
- backup validation bypass;
- weaknesses caused by an implementation error in encrypted export or restore;
- plaintext or key material retained unexpectedly by application code;
- malicious service-worker update or cache behavior;
- dependency or build-pipeline compromise;
- a route that includes raw check-ins or private notes in a selective-share
  output without clear user choice; and
- destructive import or migration behavior that bypasses validation.

## Known boundaries and non-vulnerabilities

The following are documented limitations rather than security defects by
themselves:

- The live IndexedDB database is not encrypted at rest by AccessLoom.
- Anyone with access to the unlocked browser profile, a sufficiently privileged
  browser extension, or a compromised device may be able to inspect local data.
- Clearing site data, losing a profile, or changing origins can make local data
  unavailable.
- A weak, reused, disclosed, or forgotten backup passphrase cannot be recovered
  by AccessLoom.
- Encrypted export protects the backup file, not screenshots, clipboard
  contents, printouts, the live database, or files after decryption.
- Denial of service or traffic exhaustion against the external static hosting
  provider is outside the application’s data boundary.
- External sites opened by a user have their own privacy and security behavior.
- Claims about medical, workplace, or legal suitability are outside the
  software security program.

These limitations do not excuse an application bug that makes exploitation
easier than the documented boundary.

## Testing rules

- Test against a local build or a deployment you control.
- Use fictional data and a disposable browser profile.
- Do not access another person’s device, origin, records, or account.
- Do not degrade the public service, exhaust hosting limits, phish users, or
  perform social engineering.
- Stop testing if you encounter real personal or workplace data.

Safe, good-faith research that follows these rules is welcome. This policy is
not legal authorization to test systems operated by Bolt, GitHub, a browser
vendor, or any linked third party.

## Security design

The detailed threat and trust boundaries are in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The user-facing data notice is in
[PRIVACY.md](PRIVACY.md). In short:

- the app is static and has no application backend;
- workspace records stay in origin-bound IndexedDB unless the user exports or
  shares something;
- backup imports are capped at 25 MB and validate dates, field lengths, record
  counts, and fixed cryptographic parameters before replacement;
- optional backup encryption uses the native Web Crypto API;
- user-controlled values are escaped in generated passport HTML;
- there is no runtime analytics or advertising SDK; and
- the service worker caches application assets, not workspace records.
