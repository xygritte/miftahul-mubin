# STATUS — NEWS EDITOR & DOCX FEATURE

> **Current phase:** PHASE 8 — Editor ↔ Public Visual Contract (implementation checkpoint pending validation)
> **Overall progress:** Public detail surfaces now share one Context Rail contract across News, Islamic, and Events, with section-aware navigation, related content, loading states, and supporting notes.
> **Last implementation:** Context Rail standardization — reusable `ContentContextRail` contract introduced for article/event detail surfaces; News and Islamic retain latest groups through the shared rail; Events now receive related agenda items; active section is explicit instead of inferred from `backHref`.
> **Last validation:** GitHub Actions run #560 validated the previous checkpoint; this Context Rail standardization is not yet validated.
> **Next action:** `V` — validate typecheck, build, consumer integrity, detail routing, and responsive behavior.
> **Next implementation:** No new `L` until validation confirms the shared Context Rail contract.
> **Repository changes for this feature:** ArticleDocument and database schema remain unchanged; this L changes detail presentation, shared rail contract, and event related-content fetching only.
> **Visual limitation:** Automated validation confirms build/deployment integrity, not pixel-level visual fidelity across browsers; manual visual review remains a separate check.
> **Open verification item:** Effective news INSERT/UPDATE/DELETE authorization still requires live Supabase policy verification before changing the rich-editor write path.
> **Status rule:** Update this section after each completed `L`/checkpoint; do not mark a phase complete until its validation gate and checkpoint is satisfied.
