## Core Principles

### 1. Think Before Writing Code

Do not assume intent.

If requirements are ambiguous:

* State the ambiguity.
* Present options.
* Do not pick silently.

If something is unclear, stop and surface it.

If a simpler approach exists, say so.

Do not invent APIs, data models, or flows.

---

### 2. Simplicity First

Minimum code that solves the problem.

No speculative features.
No premature abstractions.
No “future-proofing”.
No configurable systems unless explicitly requested.

Avoid patterns unless they are already used in the project.

If 150 lines can be 40, make it 40.

---

### 3. Surgical Changes Only

When modifying existing code:

* Touch only what is required for the task.
* Do not reformat unrelated code.
* Do not refactor adjacent logic.
* Do not rename things unless necessary.
* Match existing style even if imperfect.

Every changed line must directly support the user request.

If you notice unrelated issues, mention them. Do not fix them.

If your changes introduce unused imports or variables, remove only those you created.

---

### 4. Respect Project Rules

Always follow project-specific guidelines exactly, including:

* Language choices
* Folder structure
* Naming conventions
* Formatting
* Dependency limits
* Database access rules

Never introduce new dependencies unless explicitly requested.

Never move database logic outside its designated folder.

Never add comments unless explicitly asked.

Preserve backwards compatibility for inputs and outputs.

---

### 5. No Hidden Behavior

Do not introduce:

* Background jobs
* Implicit retries
* Silent fallbacks
* Magic defaults
* Side effects outside the requested scope

All behavior must be obvious from the code.

---

### 6. Validation and Errors

Validate only realistic failure cases.

Do not add defensive checks for impossible scenarios.

Handle errors directly and explicitly.

No generic catch-all logic.

---

### 7. Output Discipline

Do not generate:

* Example usage unless requested
* Tests unless requested
* Documentation unless requested
* Alternative implementations unless requested

Return only what was asked for.

---

### 8. Prefer Direct Code Over Framework Cleverness

Avoid:

* Overengineering
* Pattern stacking
* Abstract factories
* Excessive indirection

Prefer straightforward TypeScript.

Senior engineer test:
Would this look reasonable in a production PR?
If not, simplify.

---

## TypeScript Enforcement

These rules are mandatory:

* Explicit return types on all exported functions, methods, and class members.
* No implicit `any`. Ever.
* No default exports. Use named exports only.
* Avoid `as` casting unless strictly necessary. Prefer proper typing.
* Do not use `any`. If unavoidable, use `unknown` and narrow explicitly.
* Prefer `interface` for object shapes and public contracts.
* Prefer `type` for unions and utility compositions.
* No optional chaining as a substitute for proper validation.
* No non-null assertions (`!`) unless there is a provable invariant.
* Public APIs must have stable, explicit types.
* Avoid widening types (`string`, `number`) when literals or unions are more accurate.
* Async functions must return `Promise<T>` explicitly when exported.
* Do not rely on inferred types for cross-module boundaries.

---

## Code Standards / Key Guidelines

1. Use **TypeScript** with strict typing.
2. Use **clear, consistent naming**.
3. **Validate props** and handle errors gracefully.
4. **Minimize dependencies** and avoid unnecessary side effects.
5. Maintain **backwards compatibility** for inputs and outputs.
6. **Do not add comments**.
7. Use pnpm for package management.
8. Implement database functions using the Prisma Client and place them in the `src/database/` folder only.

---

## Next Steps

* Do not ask questions about anything already stated in the guidelines or next steps.
* Do not add comments unless explicitly requested.
* Only suggest improvements that are not already clearly covered.