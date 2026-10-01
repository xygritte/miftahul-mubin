# STATUS — NEWS EDITOR & DOCX FEATURE

> **Current phase:** PHASE 8 — Editor ↔ Public Visual Contract (implementation checkpoint pending validation)
> **Overall progress:** Public article redesign and context side-menu redesign are implemented; the secondary navigation now has a dedicated visual contract and active-page state.
> **Last implementation:** Context side-menu redesign — dedicated bordered panel, green top rule, numbered navigation, active-page highlighting, hover/focus treatment, responsive touch targets, dark-mode parity, and isolated note styling.
> **Last validation:** GitHub Actions run #560 for `70099b65bf379b3d633a7363eb4d2512e5aa8f1c` validated the previous checkpoint; this latest implementation is not yet validated.
> **Next action:** `V` — run the validation gate for the context side-menu redesign.
> **Next implementation:** No new `L` until validation confirms typecheck, build, consumer integrity, and runtime behavior.
> **Repository changes for this feature:** ArticleDocument, database schema, and repository contracts remain unchanged; this L changes ArticleDetail presentation and scoped article CSS only.
> **Visual limitation:** Automated validation confirms build/deployment integrity, not pixel-level visual fidelity across browsers; manual visual review remains a separate check.
> **Open verification item:** Effective news INSERT/UPDATE/DELETE authorization still requires live Supabase policy verification before changing the rich-editor write path.
> **Status rule:** Update this section after each completed `L`/checkpoint; do not mark a phase complete until its validation gate and checkpoint is satisfied.
