---
title: API terms of use
description: What the Model API is for, and the rules that apply when you call it.
sidebar:
  order: 3
---

Last updated: 2026-09-10

These terms cover the **Model API** — the free shared endpoints documented in
this section. They do not govern GPU instances, templates, or the rest of the
platform.

The Model API is offered by the AMD developer community as a **trial and
development service** for people building on AMD hardware. It is free, and it is
provided as is.

By requesting an API key and calling these endpoints, you accept what follows.

## What it is for

Evaluate the models, prototype against them, and decide whether AMD accelerators
fit your work. Typical uses are evaluation, experimentation, learning, demos,
hackathons, and open-source development.

## Not for production

**Do not put a production workload behind these endpoints.** There is no service
level agreement, no uptime commitment, and no support obligation.

Concretely:

- Models can be added, changed, or withdrawn from the catalog with little or no
  notice.
- Endpoints and API keys can be restarted or revoked for operational reasons.
- Capacity is shared. Requests can be rate limited or rejected when the service
  is busy.
- Nothing here is designed for high availability.

If your work depends on the endpoint being up, run it somewhere with a
commercial agreement behind it.

## The models are the upstream originals

Models are served from their **published upstream weights**, unmodified, running
on AMD accelerators. We do not fine-tune them, distill them, or substitute a
different model behind a familiar name.

Two consequences follow:

- The behaviour, capabilities and limits are those of the upstream model. Read
  its model card. Its licence applies to your use of its outputs.
- We do not warrant that any output is accurate, safe, current, or fit for any
  purpose. Review anything you rely on.

The model name a response reports is the model that produced it. **If you reached
this service through a third party who told you it was a different vendor's
model, you were misinformed** — see [Reselling](#reselling-is-not-allowed).

## Free of charge

The Model API is free. Credits, quotas and rate limits are capacity controls,
not currency, and carry no monetary value. Free also means no purchased
entitlement: quotas can change and access can be suspended without compensation.

## Keys and accounts

One person, one API key. You are responsible for everything done with your key,
so keep it secret and rotate it if it leaks.

The following will get a key disabled:

- Holding keys on more than one account for the same person, including through
  address aliases such as dots or `+` tags in an email address.
- Sharing, transferring, or selling a key.
- Automating account creation to obtain more keys.

## Reselling is not allowed

**You may not resell, sublicense, or otherwise provide access to these endpoints,
whether for money or not.** This includes:

- Exposing the API to third parties, directly or behind a proxy, gateway or
  aggregator.
- Presenting the service, or its models, as your own product or as another
  vendor's product.
- Instructing a model to misreport which model or which provider is answering.
- Pooling accounts or keys to raise the capacity available to a group.

Anyone can register directly and use these endpoints for free at the
[Token Factory](https://developer.amd.com.cn/radeon/modelapis). There is no
reason to pay a third party for access, and no third party is authorised to sell
it.

Keys found to be reselling are disabled. Calls made with a disabled key are
answered with a notice explaining why, so that anyone who obtained access through
a reseller can see what happened and register directly.

## Acceptable use

Do not use the Model API to:

- Break the law, or infringe anyone's rights.
- Generate malware, exploits, or tooling for unauthorised access to systems.
- Attack, probe, or overload any system, including this one — testing your own
  systems is fine, testing other people's is not.
- Circumvent quotas, rate limits, authentication, or content safeguards.
- Generate sexual content involving minors, or content that harasses, defames,
  or incites violence against people.
- Impersonate a person or an organisation, or generate content presented as
  authored by one.
- Process personal, health, financial, or otherwise sensitive data. **This is a
  trial service; do not send it anything confidential.**

## What we log

We log API requests, including **the content of prompts and model outputs**,
together with metadata such as timestamps, model, token counts and errors.

- **Conversation content is kept for a short rolling window** — currently two
  days — and then removed. Metadata is kept longer for usage accounting.
- Content is used **only** to operate the service: capacity planning, debugging,
  abuse detection, and enforcement of these terms.
- **We do not train models on your data**, and we do not sell it or share it with
  third parties for their own use.

Content may be retained beyond the normal window when needed to investigate a
specific abuse case or to comply with a legal obligation.

We are telling you this because it is true, not because it is comfortable: if
you would not want a prompt stored, do not send it.

## Suspension

Keys that break these terms may be disabled without notice. We may also disable a
key when we reasonably suspect abuse and are still investigating.

If you think your key was disabled in error, write to
[member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn).

## Availability and changes

We may change, suspend or discontinue any part of the Model API, and we may amend
these terms, at any time. Material changes will be reflected here with a new date
at the top. Continuing to call the endpoints after a change means you accept it.

## No warranty, no liability

The Model API is provided **as is** and **as available**, without warranty of any
kind. To the extent permitted by law, we are not liable for any loss arising from
your use of it, including lost data, lost profits, or the consequences of acting
on model output.

## Contact

[member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)
