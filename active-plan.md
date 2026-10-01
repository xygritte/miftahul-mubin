# STATUS — NEWS EDITOR & DOCX FEATURE

> **Current phase:** PHASE 8 — Editor ↔ Public Visual Contract (validated)
> **Overall progress:** Public detail surfaces now share one Context Rail contract across News, Islamic, and Events, with section-aware navigation, related content, loading states, and supporting notes.
> **Last implementation:** Context Rail standardization — reusable `ContentContextRail` contract introduced for article/event detail surfaces; News and Islamic retain latest groups through the shared rail; Events now receive related agenda items; active section is explicit instead of inferred from `backHref`.
> **Last validation:** GitHub Actions run #565 for `4c054ddd3b73dfc2ae40862e3c1fb7fadefcfb6a` passed build, TypeScript check, static build, Pages output verification, deployment, and public smoke/dynamic-route fallback checks. Live Supabase audit also confirms 6 published News items, 6 published Islamic items, and 5 Events available for the related-content flows.
> **Next action:** `C` — audit the next implementation slice before any new `L`.
> **Next implementation:** No new `L` until the next `C` establishes scope and consumers.
> **Repository changes for this feature:** ArticleDocument and database schema remain unchanged; the validated slice is limited to detail presentation, shared Context Rail, and Event related-content fetching.
> **Visual limitation:** Automated validation confirms build/deployment integrity and route fallback, not pixel-level visual fidelity across browsers; manual visual review remains a separate check.
> **Open verification item:** Effective news INSERT/UPDATE/DELETE authorization still requires live Supabase policy verification before changing the rich-editor write path.
> **Status rule:** Update this section after each completed `L`/checkpoint; do not mark a phase complete until its validation gate and checkpoint is satisfied.

