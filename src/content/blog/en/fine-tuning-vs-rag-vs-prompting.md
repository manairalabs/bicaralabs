---
title: Fine-tuning vs RAG vs prompting — what your business actually needs
description: Three ways to make an AI model do your job. Most teams reach for the expensive one first. Here's how to choose in the right order.
date: 2026-04-28
tag: Guide
cover: /artwork/cover-finetune-rag.webp
dwg: bcl-03
draft: false
---

There are three ways to make a general AI model do *your* specific job. Teams often reach for the most expensive one first. The right order is the opposite.

## Start with prompting

Just tell the model what to do — clearly, with examples, and the rules it must follow. It's free, instant, and solves more problems than people expect. Exhaust this before spending a rupiah on anything else.

## Add RAG when it needs *your* knowledge

Retrieval-Augmented Generation gives the model access to your documents at answer time — policies, product data, past tickets. Use it when the problem is "the model doesn't know our stuff," which is most of the time. It keeps answers current (update the documents, not the model) and lets you cite sources.

## Fine-tune when you need *behaviour*, not facts

Fine-tuning actually trains the model on your examples. It's the right tool when you need a consistent style, a specialised format, or a narrow task done cheaply at scale — and when prompting + RAG have hit their ceiling. It costs more, needs good training data, and has to be redone when the base model changes. Worth it sometimes; overkill often.

## The decision, in one line

**Prompt first. Add RAG for knowledge. Fine-tune only for behaviour you can't get any other way.**

Most "we need to fine-tune" conversations end with a better prompt and some retrieval — at a fraction of the cost. The skill isn't knowing the techniques; it's knowing which one your problem actually needs.
