---
title: Clef
description: Decision model — answers typed questions about a situation with probabilities, on its own endpoint.
sidebar:
  order: 14
---

<div class="rc-endpoint">
  <span class="rc-method" data-m="POST">POST</span>
  <span class="rc-path">/v1/systemone</span>
  <span class="rc-auth">model: <code>Clef</code></span>
</div>

:::caution[This model is not on `/v1/chat/completions`]
Clef does not write text. You describe a situation, ask named questions, and get back a
probability for every possible answer, all in one forward pass. `messages`, `max_tokens`,
`temperature` and `stream` do not apply.
:::

Clef is Cloudflare's 27B decision model, post-trained from Qwen3.8-27B. Use it where you would
otherwise ask a chat model to classify, route or grade something and then parse its reply.

## At a glance

| | |
|---|---|
| Endpoint | `POST /v1/systemone` |
| Input | a `state` (text or any JSON) and optional images |
| Output | one answer per question, with probabilities |
| Question types | `choice`, `noul`, `score` |
| Streaming | ❌ |
| Billing | per input token, reported as `usage.input_tokens`; `output_tokens` is always `0` |
| State length | truncated to 16,384 tokens |
| Stability | `experimental` |

## Request

| Field | | |
|---|---|---|
| `model` | required | `Clef` |
| `state` | required | the situation to decide about: a string, or any JSON value |
| `questions` | required | an object mapping your own question names to questions, at least one |
| `images` | optional | an array of images as `data:` URL strings |

`temperature`, `prompt_format_version` and `return_prompt_token_ids` are refused by name with a
`422`. Unknown keys inside a question are refused too, so a misspelled `instruction` fails loudly
instead of being ignored.

### Question types

| `type` | `criteria` | Answer |
|---|---|---|
| `choice` | an object of options, `{"name": "what this option means", …}`, 1–255 entries | `choice`, `confidence`, `probabilities` per option |
| `noul` | optional `{"true": "…", "false": "…"}`; give `instructions`, `criteria`, or both | `noul`: the probability that the answer is yes (or that `true` holds), 0–1 |
| `score` | an ordered array of 1–10 levels, lowest first | `score` (the expected level, counting from 0), `confidence`, `legend`, `probabilities` per level |

Every question can carry `instructions`, the question itself in plain words.

## Response

```json
{
  "answers": {
    "status": {
      "type": "choice",
      "choice": "overdue",
      "confidence": 0.9895,
      "probabilities": { "paid": 0.0041, "overdue": 0.9930, "draft": 0.0029 }
    },
    "large": { "type": "noul", "noul": 0.9934 },
    "urgency": {
      "type": "score",
      "score": 1.5326,
      "confidence": 0.2989,
      "legend": { "0": "Can wait", "1": "This week", "2": "Today" },
      "probabilities": { "0": 0.0575, "1": 0.3524, "2": 0.5901 }
    }
  },
  "usage": { "input_tokens": 340, "output_tokens": 0 },
  "model": "Clef"
}
```

Use the probabilities rather than only the top answer: a `noul` of 0.55 and one of 0.99 are both
"yes", but only one of them is safe to act on automatically.

## Example

```bash
curl https://developer.amd.com.cn/radeon/api/v1/systemone \
  -H "Authorization: Bearer $RADEON_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "Clef",
    "state": {"invoice": {"vendor": "Acme", "total": 1250.0, "currency": "USD", "status": "overdue"}},
    "questions": {
      "status": {
        "type": "choice",
        "instructions": "What is the invoice status?",
        "criteria": {"paid": "Invoice is paid.", "overdue": "Invoice is past due.", "draft": "Not sent."}
      },
      "large": {"type": "noul", "instructions": "Is the total above 1000 USD?"},
      "urgency": {"type": "score", "instructions": "How urgent is follow-up?", "criteria": ["Can wait", "This week", "Today"]}
    }
  }'
```

With an image:

```json
{
  "model": "Clef",
  "state": "Look at the attached picture.",
  "images": ["data:image/png;base64,iVBORw0KGgo..."],
  "questions": {
    "colour": {
      "type": "choice",
      "instructions": "What colour fills the image?",
      "criteria": {"red": "Red", "green": "Green", "blue": "Blue"}
    }
  }
}
```

:::caution[Validation errors are not in the OpenAI shape]
A malformed question comes back as `422` with FastAPI's `{"detail": [ … ]}` body, which names the
offending field, for example `["body", "questions", "q", "noul", "instruction"]`. Authentication
and rate-limit errors use the usual `{"error": { … }}` shape.
:::

:::note[Fast for short states]
A few hundred input tokens answer in well under a second. A state near the 16,384-token limit
takes on the order of 20 s.
:::
