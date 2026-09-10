---
title: Terms of Use
description: What AMD Radeon Cloud is, what it is not, and the rules for using it.
sidebar:
  order: 1
---

Last updated: 2026-09-10

AMD Radeon Cloud is run by the AMD developer community as a **trial and
development platform** for people building on AMD hardware. It is free, and it
is offered on an as-is basis.

By requesting an API key or launching an instance, you agree to what follows.

## What this service is for

The platform exists so that you can try AMD accelerators and the models running
on them, prototype against them, and decide whether they fit your work. Typical
uses are evaluation, experimentation, learning, demos, hackathons, and
open-source development.

## Not for production

**Do not build a production system on top of this service.** It has no service
level agreement, no uptime commitment, and no support obligation.

In practice that means:

- Models, endpoints and prices in the catalog can change or be withdrawn, and a
  model can disappear with little or no notice.
- Instances, endpoints and API keys can be restarted, migrated or revoked for
  operational reasons.
- Capacity is shared. Requests can be rate limited or rejected when the platform
  is busy.
- Nothing here is designed for high availability, and no data stored on the
  platform should be treated as durable.

If your work depends on the service being up, run it somewhere with a commercial
agreement behind it.

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

The service is free. Credits, quotas and rate limits shown in the console are
capacity controls, not currency, and carry no monetary value.

Free also means you have no purchased entitlement. Quotas can change, and access
can be suspended, without compensation.

## Your account

One person, one account. You are responsible for everything done with your API
keys, so keep them secret and rotate them if they leak.

The following will get an account suspended:

- Registering more than one account for the same person, including through
  address aliases such as dots or `+` tags in an email address.
- Sharing, transferring, or selling an API key.
- Automating account creation.

## Reselling is not allowed

**You may not resell, sublicense, or otherwise provide this service to others,
whether for money or not.** This includes:

- Exposing the API to third parties, directly or behind a proxy, gateway or
  aggregator.
- Presenting the service, or its models, as your own product or as another
  vendor's product.
- Instructing a model to misreport which model or which provider is answering.
- Pooling accounts or keys to raise the capacity available to a group.

Anyone may use the service directly, for free, by registering at the
[Token Factory](https://developer.amd.com.cn/radeon/modelapis). There is no
reason for anyone to pay a third party for access to it, and no third party is
authorised to sell it.

Keys found to be reselling are disabled. Requests made with a disabled key are
answered with a notice explaining why, so that anyone who obtained access
through a reseller can see what happened and register directly.

## Acceptable use

Do not use the service to:

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
  trial platform; do not send it anything confidential.**

## What we log, and what we do not do with it

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

## Availability and changes

We may change, suspend or discontinue any part of the service, and we may amend
these terms, at any time. Material changes will be reflected here with a new
date at the top. Continuing to use the service after a change means you accept
it.

## Suspension

Accounts that break these terms may be suspended or terminated without notice.
We may also suspend an account when we reasonably suspect abuse and are still
investigating.

If you think your account was suspended in error, write to
[member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn).

## No warranty, no liability

The service is provided **as is** and **as available**, without warranty of any
kind. To the extent permitted by law, we are not liable for any loss arising
from your use of it, including lost data, lost profits, or the consequences of
acting on model output.

## Contact

[member-service@mail.developer.amd.com.cn](mailto:member-service@mail.developer.amd.com.cn)
