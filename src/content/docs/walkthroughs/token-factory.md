---
title: "Walkthrough: Token Lab (API)"
description: "Get your API key and base URL, pick a model, and make your first call."
---

**When:** You want to call hosted models from your own code, without running an instance.

![Animated walkthrough: Token Lab](/radeon-cloud-docs/walkthroughs/en/token-factory.gif)

## Steps

1. Open **Token Lab**. Your API key and base URL are at the top.
2. Keep the key secret: use **Copy**, and regenerate it in Settings if it ever leaks.
3. Pick a model. Its card has a ready-to-run example (OpenAI or Anthropic format).
4. Use the model id exactly as shown. `GET /v1/models` lists them.
5. Call it from your own code with the key and base URL. Some models think first, so leave `max_tokens` room.
6. Check your limits with `GET /v1/usage`: requests per minute, the daily limit and when it resets.

## Common pitfalls

- Some models return a `reasoning` field and think before answering. If `max_tokens` is too small, `content` comes back empty.
- There are per-minute and daily limits. When the daily limit is used up, calls return HTTP 429 “Daily usage limit exceeded” until the reset time shown by `/v1/usage`.
- Treat the API key like a password. If it leaks, regenerate it in Settings: the old key stops working within about a minute.

More detail: [Token Lab](/radeon-cloud-docs/guides/token-factory/)
