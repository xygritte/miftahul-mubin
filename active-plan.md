# STATUS — NEWS EDITOR & DOCX FEATURE


> **Current phase:** PHASE 8 — Editor ↔ Public Visual Contract (design foundation checkpoint pending validation)
> **Overall progress:** The public design system now has a clearer canonical token vocabulary while preserving existing page concepts, component behavior, and legacy compatibility aliases. No page structure, data contract, or database change is included in this checkpoint.
> **Last implementation:** Canonical design foundation — reorganized `app/design-tokens.css` into semantic color, typography, layout, interaction, and header roles; centralized legacy aliases on top of those roles; added missing compatibility variables used by admin/editor CSS; kept the existing light/dark values and responsive gutter behavior.
> **Last repair:** CI dependency install failed because npm attempted to fetch unavailable `baseline-browser-mapping@2.11.27`; `package.json` pins the transitive dependency through npm `overrides` to published `2.11.26`.
> **Last validation:** This design-foundation checkpoint is awaiting `V`; the dependency-install repair also requires CI validation.
> **Next action:** `V` — validate TypeScript, build, CSS loading, token resolution, and public/admin responsive surfaces before the next design slice.
> **Next implementation:** No new `L` until validation confirms this foundation checkpoint.
> **Repository changes for this feature:** ArticleDocument and database schema remain unchanged; this L changes only the design-token foundation and its status checkpoint.
> **Visual limitation:** Automated validation can confirm build/deployment integrity, but manual visual review is still required for cascade-sensitive CSS and theme changes.
> **Open verification item:** Effective news INSERT/UPDATE/DELETE authorization still requires live Supabase policy verification before changing the rich-editor write path.
> **Status rule:** Update this section after each completed `L`/checkpoint; do not mark a phase complete until its validation gate and checkpoint is satisfied.
