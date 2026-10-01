# STATUS — NEWS EDITOR & DOCX FEATURE

> **Current phase:** PHASE 8 — Editor ↔ Public Visual Contract (implementation checkpoint pending validation)
> **Overall progress:** Public article redesign and latest-content context rail refinement are implemented; the latest-content rail now has an explicit loading contract so the editorial hierarchy remains visible before live sidebar data arrives.
> **Last implementation:** Immediate latest-content context rail — loading state and skeletons added for News/Islamic sections; legacy portal navigation remains secondary; duplicated sidebar CSS layers removed and the sidebar visual contract consolidated.
> **Last validation:** GitHub Actions run #560 for `70099b65bf379b3d633a7363eb4d2512e5aa8f1c` passed build, deploy, and public smoke jobs; this latest implementation is not yet validated.
> **Next action:** `V` — run the validation gate for the immediate latest-content context rail implementation.
> **Next implementation:** No new `L` until validation confirms typecheck, build, consumer integrity, and runtime behavior.
> **Repository changes for this feature:** ArticleDocument, database schema, and existing repository contracts remain unchanged by this UI/state refinement; realtime subscriptions remain intact.
> **Visual limitation:** Automated validation confirms build/deployment integrity, not pixel-level visual fidelity across browsers; manual visual review remains a separate check.
> **Open verification item:** Effective news INSERT/UPDATE/DELETE authorization still requires live Supabase policy verification before changing the rich-editor write path.
> **Status rule:** Update this section after each completed `L`/checkpoint; do not mark a phase complete until its validation gate and checkpoint is satisfied.

