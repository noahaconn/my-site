# Connexus

**[getconnexus.org](https://getconnexus.org)**

Connexus is Noah Conn's platform for building and shipping real, working software — not
demos, not slides. Today that means three things you can actually use:

- **AI Chatbot** — ask it about Noah's work, backed by the OpenAI API.
- **Book of Mormon Quiz** — a quiz/trivia experience.
- **Greek NT Reader** — an immersive reading tool that progressively swaps English words for
  Greek across the New Testament, one word at a time, to aid language acquisition.

It started as a personal portfolio site. It's becoming something broader — a place to build
full-stack, cloud, and AI-integrated tools worth using on their own merits, with the
infrastructure to grow into whatever that turns out to be: more tools, real user accounts,
persistent state, maybe more than one contributor. Nothing about the architecture assumes
"single owner, single purpose" is permanent.

---

## How it's built

Everything — frontend, infrastructure, and the AI backend — deploys from a single AWS CDK
stack, written in Python, in this one repo. A few choices worth knowing about going in:

- **No public S3, ever.** The frontend bucket is fully private; CloudFront reaches it via
  Origin Access Control, not a public bucket policy.
- **Secrets never touch the repo or an env var.** The OpenAI key lives in Secrets Manager and
  is fetched at request time, scoped to a single, least-privilege IAM grant.
- **Layered cost/abuse controls** on the AI-backed endpoint: API Gateway throttling, Lambda
  concurrency limits, and per-request input/output caps, stacked rather than relying on any
  one of them.

Full technical detail — diagram, repo layout, deploy steps, API contract, security posture —
lives in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Status

Actively developed. Rough edges are expected and are being worked through deliberately rather
than papered over — see the architecture doc for what's solid today and what's still open.

---

## License

Personal project — all rights reserved. Feel free to read the code for reference; please ask
before reusing it wholesale.
