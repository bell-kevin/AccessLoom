# AccessLoom market and prior-art research

Last checked: **29 July 2026**

This document records the research behind AccessLoom, a local-first workplace
support lab and access-passport builder. It is intended to make the project's
novelty claims inspectable and appropriately cautious.

The short conclusion is:

> We found access-passport forms, proprietary workplace-adjustment platforms,
> private-source mobile applications, and separate wellbeing trackers. We did
> not find a FLOSS application that joins private longitudinal work-friction
> check-ins, time-bounded support experiments, transparent on-device pattern
> analysis, and deliberate promotion of selected findings into a portable
> access passport.

That is a bounded research finding, not proof that no such software exists.
AccessLoom should not be described as “the first access passport.”

## How this review was conducted

We searched GitHub repository metadata, README files, and, where relevant, code
search results. The exact workplace-focused repository queries included:

- `"workplace adjustment passport"`
- `"reasonable adjustment passport"`
- `"workplace access passport disability"`
- `"employee accommodation tracker"`
- `"neurodiversity workplace accommodations"`
- `"disability passport app"`
- `"health passport workplace employee"`
- `"inclusion passport workplace"`

Adjacent searches covered co-parenting coordination, custody calendars and
expenses, warranty and purchase tracking, adaptive scheduling, family emergency
binders, digital legacy, and evidence-timeline builders.

Repository links and any homepage or demo links advertised by those repositories
were checked separately. A homepage link was not assumed to be a working
application.

The status labels used below mean:

- **Verified working app:** the rendered site exposed a meaningful application
  workflow or a functional application login/demo, not just promotional copy.
- **Live marketing page:** the page rendered successfully and described a
  product, but did not provide a public product workflow.
- **Reachable, workflow not verified:** the server returned HTTP 200 and the
  application shell or JavaScript was present, but a complete workflow could not
  be confirmed.
- **No public demo:** no demo or usable application link was supplied.
- **Dead:** the linked host failed DNS resolution or otherwise did not load.

HTTP 200 alone is evidence that a URL is reachable, not that its application is
usable. Statuses are a snapshot from 29 July 2026 and may change.

Star counts, commit counts, prices, and product plans are similarly
time-sensitive snapshots. Vendor pricing is reported from the vendor or official
procurement page linked beside it.

## The selected opportunity

AccessLoom addresses a gap between a blank workplace-adjustment document and an
employer-controlled accommodation case-management system.

Its distinctive loop is:

1. Record a short, private work-friction check-in.
2. Observe recurring barriers and contextual patterns locally.
3. Turn a support idea into a time-bounded experiment.
4. Review the experiment as keep, change, or stop.
5. Deliberately select only useful conclusions for a shareable passport.

Private observations are not automatically disclosed. Pattern summaries are
descriptive rather than diagnostic or causal. An example of an appropriate
claim is “reported in four of five afternoon check-ins,” not “afternoons cause
this condition.”

This separation between a **private learning space** and a **selective sharing
space** is central to the project. It also makes a completely client-side
implementation practical: IndexedDB for local data, Web Crypto for encrypted
backups, browser print/export, and no required account, cloud database, paid API,
or employer dashboard.

## Closest GitHub repositories

### Explaity

[anubisalpha/explaity-feedback](https://github.com/anubisalpha/explaity-feedback)
is the closest repository found to an individual reasonable-adjustments
passport.

Its README describes a private Android application that stores data on-device
and exports a Reasonable Adjustments Passport as a PDF. The README also
explicitly says that the application source is private. At the time of review,
the public repository was a one-commit feedback repository with no source
release, open-source license, package, application-store link, or live demo.

**Collision with AccessLoom:** local ownership and a portable passport.

**Difference:** no public source and no evidence of longitudinal friction
analysis, time-bounded support experiments, or a private-to-shared promotion
workflow.

### Mosaity

[anubisalpha/mosaity-feedback](https://github.com/anubisalpha/mosaity-feedback)
describes a private Android wellbeing application for recording mood, energy,
and daily patterns. It identifies Explaity as a companion application and also
states that its source is private.

At the time of review, the repository contained feedback documentation rather
than application source and supplied no license, release, store listing, or live
demo.

**Collision with AccessLoom:** private daily pattern tracking.

**Difference:** the pattern tracker and passport are separate private-source
products, and no adjustment-experiment or selective-publication loop was shown.

### Neurodiversity accommodations list

[parul-parallelminds/neurodiversity-accommodations](https://github.com/parul-parallelminds/neurodiversity-accommodations)
is a small Markdown collection of accommodation ideas and tools. It is a useful
resource, but it is not an application and does not implement check-ins,
experiments, analysis, or passport generation.

### Other adjacent results

[ReasonableMedia/ReasonableCMS](https://github.com/ReasonableMedia/ReasonableCMS)
is an early legal/discrimination case-management project. It is not an
employee-owned workplace passport or support-learning application and had no
public demo during this review.

The GitHub results support a narrow claim: no inspected FLOSS repository
implemented AccessLoom's complete loop. They do not support an absolute claim
that no unpublished, unindexed, differently named, or future project does so.

## Existing passports and commercial products

### INVISABLE Access Passport

The [INVISABLE Access Passport](https://www.invisable.co.uk/access-passport) was
a **verified working app**. It rendered a four-step, browser-local form covering
work impact, barriers, useful supports, a difficult-day plan, communication, and
review triggers. It offered print/save-as-PDF, text download, copy, and clear
controls, and stated that answers remain in the browser unless the user exports
them.

This is important prior art. A private, browser-based access-passport form is
already live and useful.

During this review we found no linked source repository or open-source license.
The site's separate check-in and support-app material was described as
founding-stage or in development, rather than as a public integrated workflow.
No price was displayed for the passport form.

### TryMosaic

[TryMosaic's expense information](https://www.trymosaic.co/expenses) was a
**live marketing and pricing page**. It advertised one workplace-adjustments
passport for one named person, a guided process, a secure share link or export,
and a permanent reusable record for **£40 as a one-off purchase**.

The linked application host returned a minimal successful response, but we did
not verify a public interactive product demo. The public site states “All rights
reserved” and no FLOSS source repository was found.

### OneSpace

The [OneSpace workplace passport](https://theonespace.co.uk/workplace/) was a
**live marketing page** with a demo-request path. It described an
employee-controlled profile covering ways of working, performance barriers,
adjustments, communication preferences, selective sharing with managers or HR,
and later review.

No public application workflow, public price, or FLOSS repository was verified.

### AllAccessible

[AllAccessible accommodation pricing](https://www.allaccessible.org/accommodation-pricing)
was a **live pricing page**, and its trial link opened a live signup form. It
advertised an employer-oriented ADA accommodation workflow at:

- **$49/month** for up to 10 requests
- **$149/month** for up to 50 requests
- **$399/month** for an enterprise tier

The page described routing, approvals, audit trails, HRIS integrations, API
access, and organizational analytics. This is a materially different model from
AccessLoom's private, employee-owned workspace. We did not verify a public
product demo that could be used without signup.

The page also publishes comparisons with other vendors. Prices attributed there
to those competitors should be treated as AllAccessible's claims, not as
independently verified competitor prices.

### Microlink Digital Workplace Adjustment System

The UK Digital Marketplace hosted a live
[Microlink pricing document](https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/700908/632414841418278-pricing-document-2024-05-04-0920.pdf)
for an end-to-end workplace-adjustment case-management service.

For August 2025 through July 2026, the official table listed:

- **£3,808 excluding VAT** for the 0–10-cases-per-month service tier
- **£4,062 excluding VAT** as an organizational onboarding fee
- **£330 excluding VAT** per pan-disability workplace-needs assessment

The document also listed per-case, training, technical-support, installation,
and consultancy charges. This was official procurement and pricing material,
not a public application demo.

### Workday/CloudRock

The
[Workday Marketplace listing for Workplace Adjustment Passport](https://marketplace.workday.com/en-US/apps/458518/workplace-adjustment-passport/overview)
was reachable as a marketplace product page. Public case-study material
described centralized requests, approvals, reviews, and Workday integration.
No public hands-on demo or public price was verified; the product is positioned
as an organizational implementation.

### Government template

The UK government's
[Health Adjustment Passport](https://www.gov.uk/government/publications/health-adjustment-passport)
page was live and supplied PDF, editable ODT, easy-read, and large-print
documents under the Open Government Licence.

This is another reason not to frame AccessLoom as inventing the passport. Its
contribution is helping a person learn which practical supports are useful
before deciding what to place in a passport.

## Defensible novelty statement

Recommended language for the README and project site:

> As of 29 July 2026, targeted GitHub searches found no FLOSS application that
> combines private longitudinal workplace-friction logs, time-bounded support
> experiments, transparent on-device pattern analysis, and user-selected
> promotion of findings into a portable access passport.

Avoid these stronger claims:

- “The first access passport”
- “The only workplace-adjustment application”
- “Scientifically proves which accommodation works”
- “Diagnoses workplace conditions”
- “Guarantees or establishes entitlement to an accommodation”
- “Creates a legally binding adjustment agreement”

AccessLoom is a communication and self-reflection aid. It should continue to
show observation counts and uncertainty, keep raw check-ins out of passport
exports by default, and avoid medical, employment, or legal advice.

## Concepts investigated but not selected

### Co-parent handoff ledger

[KidsCompass](https://github.com/FaLLeNaNg3L82/kidscompass) is an MIT-licensed,
local SQLite desktop application for recording and visualizing custody visits.
It had no public web demo.

[child-custody-expense-tracker](https://github.com/AlliNeuman/child-custody-expense-tracker)
was an old, small, unlicensed repository with no demo.

[Togetherly](https://github.com/jarredgearing10-hub/togetherly) linked to a
[site that returned HTTP 200](https://togetherly-hazel.vercel.app), but the
rendered site was only a landing/waitlist page, not a working co-parenting
application.

The commercial need is real:
[TalkingParents](https://talkingparents.com/pricing) advertised paid plans at
**$7, $16, and $32 per month** and stated that a paid subscription had been
required for application access since 30 March 2026.

A local-first custody rotation, swap, expense, medication, and item-handoff
ledger remains promising. It was not selected because multi-party
authentication, a shared source of truth, and any court-record claims would
require considerably more infrastructure and legal care than a static Bolt
deployment.

### Purchase-aftercare cockpit

[Warracker](https://github.com/sassanix/Warracker) is an active AGPL-3.0
warranty-management project covering receipts, documents, claims, audit history,
and alerts. Its advertised homepage redirected to GitHub rather than a public
demo.

[Homebox](https://github.com/sysadminsmedia/homebox) is an established,
active AGPL home-inventory project. Its
[public demo](https://demo.homebox.software) was a **verified working
application login** and exposed published demo credentials.

[HomeZada's pricing page](https://www.homezada.com/homeowners/pricing/) was live
and advertised a **$99/year** premium plan and **$189/year** multi-home plan.

A product could still emphasize return windows, price protection, rebates,
recalls, repair-versus-replace decisions, and resale timing. It was rejected as
the primary idea because the nearby FLOSS warranty and home-inventory space is
already mature, making a strong “not done before in FLOSS” claim difficult.

### Adaptive personal scheduler

[sp-autoplan](https://github.com/00sapo/sp-autoplan) is a GPL-3.0 auto-planning
plugin for Super Productivity. It was archived in 2026 and had no standalone
public demo.

[smart-agentic-calendar](https://github.com/fbdo/smart-agentic-calendar) is a
small MIT-licensed, local-first calendar/MCP experiment with no public consumer
demo.

[SkedPal's live pricing page](https://www.skedpal.com/pricing) advertised
automatic scheduling at **$9.95/month** for Core and **$14.95/month** for Pro
when billed annually.

An explainable planner based on energy, capacity, interruptions, and a
“minimum viable day” could be useful. It was not selected because auto-planning
already has FLOSS prior art and useful calendar synchronization would add
authentication and integration complexity.

### Family emergency-readiness map

[FamilyVault](https://github.com/dwayne-brown-jr/familyvault) was a small,
unlicensed Next.js/Supabase project. Its
[deployed URL](https://familyvault-blue.vercel.app) returned HTTP 200 and
rendered a polished **marketing page**, but a usable public vault workflow was
not verified.

[family-emergency-binder](https://github.com/cloud7-dev/family-emergency-binder)
was archived and unlicensed.

Commercial products remain expensive:

- [Trustworthy](https://www.trustworthy.com/pricing) advertised free, **$10**,
  **$20**, and **$40 per month** household plans, with paid plans billed
  annually.
- [Everplans](https://www.everplans.com/pricing) advertised a limited free plan
  and **$99.99/year** Premium.

A privacy-preserving readiness map could store metadata such as what exists,
where a physical original is held, who knows, and when it was last reviewed
without storing passwords or financial secrets. It remains a good future idea,
but safe successor access, identity verification, and recovery are difficult to
provide in a static local-only application.

### Personal evidence chronology

[castle-bravo-project/evidence-timeline-builder](https://github.com/castle-bravo-project/evidence-timeline-builder)
was a very small, unlicensed repository. Its
[GitHub Pages deployment](https://castle-bravo-project.github.io/evidence-timeline-builder/)
returned HTTP 200 and loaded an application shell and JavaScript asset, but a
complete interactive workflow was **not verified**. It should not be cited as a
confirmed working demo.

[dougdevitre/evidence-timeline-builder](https://github.com/dougdevitre/evidence-timeline-builder)
was a small archived MIT repository with no public demo.

[Uwazi](https://github.com/huridocs/uwazi) is mature MIT-licensed
document-and-evidence collection software with a heavier MongoDB,
Elasticsearch, Redis, and object-storage stack. Its
[public demo](https://demo.uwazi.io) was a **verified working application**
showing a populated demonstration collection.

[ThreadLock](https://threadlock.ai/) was a live commercial site for
self-represented litigants, and its application endpoint was reachable. The
site advertised individual case organization beginning at **$29/month**, with
journals, evidence management, OCR, and a timeline builder.

A local-first chronology with source links, hashes, redaction, exhibit indexes,
and print export is technically feasible. It was rejected because statements
about admissibility, verification, or tamper resistance would introduce
high-stakes legal risk, while Uwazi already supplies substantial FLOSS prior
art.

### Wardrobe management

[gpatkinson/open_wardrobe](https://github.com/gpatkinson/open_wardrobe) was an
MIT-licensed Flutter/Supabase project, but its advertised
[homepage](https://openwd.sug.lol) failed DNS resolution during this review.
The link was therefore recorded as **dead**, not as a live demo.

The category was not pursued further because its commercial-cost case was
weaker than workplace adjustments and its proposed functionality was less
distinctive.

## Why AccessLoom was selected

AccessLoom had the best combination of:

- a concrete everyday problem;
- conspicuously expensive employer-oriented alternatives;
- proprietary individual passport products;
- free document templates that still leave the learning problem unsolved;
- no inspected FLOSS implementation of the complete feedback loop;
- a privacy model that improves when there is no backend;
- a polished scope feasible on static Bolt hosting; and
- a meaningful reason to use AGPLv3 for public, modified web deployments.

The project's strongest position is not that nothing similar exists. It is that
the existing landscape separates private self-observation, support testing, and
selective workplace communication. AccessLoom makes those stages one coherent,
inspectable, user-controlled FLOSS workflow.
