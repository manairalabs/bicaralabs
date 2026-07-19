---
title: Getting good AI results in Bahasa Indonesia
description: Most AI models are trained mostly on English. Here's how to get reliable, natural results in Bahasa Indonesia — and the mistakes that quietly wreck quality.
date: 2026-04-09
tag: Field Notes
cover: /artwork/cover-bahasa.webp
dwg: bcl-05
draft: false
---

Most large language models are trained mostly on English. They speak Bahasa Indonesia well enough to demo — and just badly enough to embarrass you in production if you're not careful. Here's what actually moves quality.

## Test in the language, not in English

The most common mistake: teams evaluate a model in English, ship it, and discover the Indonesian output is stiff, over-formal, or subtly wrong. Always test on real Indonesian inputs — including the messy, mixed-language, slang-filled way customers actually write on WhatsApp.

## Watch the register

Indonesian carries formality that English doesn't. A model defaulting to textbook *Bahasa baku* can sound cold to a customer expecting warmth, or too casual for a formal notice. Pin the tone deliberately in the system prompt, with examples.

## Ground it in your own words

Retrieval (RAG) over your Indonesian documents beats relying on the model's general knowledge — it keeps terminology, product names, and phrasing consistent with how *you* speak, not how the internet does.

## Consider the mix

Real Indonesian business writing code-switches — English tech terms inside Indonesian sentences. A good setup handles that gracefully instead of "correcting" it into something no one would say.

## When bigger isn't better

Sometimes a model with stronger multilingual training beats a bigger, English-centric one on your task. Test both. Vendor-neutral means we pick the one that scores best on *your* Indonesian, not the one with the loudest marketing.

Language is where a lot of AI projects quietly lose trust. Get it right and everything downstream feels more reliable.
