---
name: grill-me
description: Interview the user relentlessly about a plan or design until reaching shared understanding, resolving each branch of the decision tree. Use when user wants to stress-test a plan, get grilled on their design, or mentions "grill me".
---
Interview me relentlessly about every aspect of this plan until we reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.
If a question can be answered by exploring the codebase, explore the codebase instead.

Use the AskUserQuestion tool to ask each question. Batch related questions together (up to 4 per call). For each question, provide 2-4 concrete options with your recommended answer marked as "(Recommended)". Keep headers short (e.g., "Scope", "Auth", "Storage"). Continue asking rounds of questions until all branches of the decision tree are resolved.
