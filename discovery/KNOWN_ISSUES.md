# Known Issues & Caveats — Discovery / Scoring Pipeline

Running punch list of things deliberately deferred, flagged as limitations, or left as open
questions while building the discovery engine and Family Office / Angel Investor scoring.
Nothing here is blocking current work — this exists so none of it gets forgotten.

## Discovery engine (`discover.py`)

1. **Sovereign wealth funds leak into Family Office searches.** Temasek Holdings and GIC
   Private Limited both showed up in a Family Office/Singapore run despite the prompt's "only
   include organizations that plausibly fit [family office categories]" rule — the model matched
   on "long-horizon, patient capital" language and ignored the ownership-type constraint.
   Deliberately deferred to a later data-cleaning pass. **Now has concrete evidence it matters
   more than expected:** in the scored output, Temasek still landed at 64/100 (mid-pack out of
   29), not at the bottom — the scoring layer's 0-on-Family-Office-Fit self-correction softens
   this but doesn't fully hide it from an advisor scanning the ranked list. Fix: add an explicit
   exclusion for sovereign wealth funds / government-owned entities to the Family Office (and
   Angel Investor) prompts specifically, since Institutional/Sovereign should still welcome them.

2. **Generic/templated descriptions from directory-style sources.** Several Luxembourg Family
   Office entries (La Mancha Holding, Orascom TMT Investments, DELTON Logistics, Borletti Group,
   Arvo Investment Holdings, Bemberg Capital) shared identical source URLs and used vague, hedged
   language ("likely operates...", "typical of Luxembourg family offices...") — looks like the
   model pulled names off a single listicle/directory page and generated similar-sounding
   boilerplate per name rather than verifying each individually. Not fixed. Worth a prompt change
   discouraging reliance on a single aggregator source per batch, or a follow-up verification pass
   on entries whose evidence all traces back to one shared source.

3. **Grounding-redirect source URLs aren't always resolved to a readable title.** We added a
   title lookup from `grounding_chunks`, and it works for most links, but some still resolve to
   `null` — likely because a single response can run several search queries and the final
   `grounding_metadata` doesn't always include every chunk referenced along the way. Underlying
   links still work when clicked; just not always labeled.

4. **Country name capitalization is whatever the user typed**, e.g. one early run stored
   `"luxembourg"` (lowercase) while later runs stored `"Luxembourg"`. Downstream tools
   (`export_excel.py`) normalize this with `.title()` at export time, but the raw JSON itself is
   inconsistent. Not a functional bug given the downstream fix, but worth normalizing at the
   source if raw files are ever read directly.

5. **LLM degenerate-repetition failures happen occasionally** (one real occurrence, Luxembourg
   run) — the model gets stuck in a token-repetition loop instead of finishing valid JSON. The
   automatic one-time retry handles this, and the raw-text fallback preserves the broken response
   for inspection if both attempts fail. Documented behavior, not something to "fix" further
   unless it starts happening often.

6. **The `scoring_signals` schema was designed around Family Office's six categories** (core_fit,
   capital_or_operational_orientation, sector_alignment, governance_institutional_mindset,
   strategic_adjacency_tbp, engagement_readiness) and doesn't map cleanly onto other circles'
   distinct category names — e.g. Angel Investor's "Network quality" and "Capital connector
   value" have no dedicated evidence field. Currently worked around by passing the full evidence
   bundle (description + all six generic fields) to each circle's scoring judge rather than
   relying on a 1:1 field mapping. Works, but a circle-aware `scoring_signals` schema would be
   more precise if this becomes a real problem later.

## Scoring engine — design-level caveats

7. **Reference texts are v1 drafts, not confirmed against any canonical TBP strategy document.**
   Particularly the "neutral global trade infrastructure and corridor-formation thesis" language
   — this was synthesized from fragments across the task brief, the corridor-matching table, and
   `Master_List.csv`'s existing region-mapping column, not quoted from a single authoritative
   source. Should be checked against Ribi/TBP leadership's actual strategy materials before being
   treated as final, especially since this same reference text is the fixed yardstick every
   single prospect in a circle gets measured against.

8. **Only Family Office has explicit, PDF-sourced category definitions.** The other four circles'
   categories (Angel Investor, Institutional/Sovereign, Strategic Operational Partner, Capital
   Advisory/Introducer) come from the Tharushi Update document as category names + point values
   only, with no defined question per category — the tier rubrics built for these are my inferred
   interpretations, not confirmed definitions. Worth a sanity-check against whoever wrote the
   original document, or against Ribi, before treating them as settled.

9. **Self-reported company-website text has a structural favorable bias**, most visible in the
   Angel Investor test run: two prospects (Strategic Swiss Partners, Global Strategic Capital AG)
   scored a perfect 100/100, partly because their own marketing copy directly echoes language like
   "connects investors with opportunities" — almost verbatim matching the "Capital connector
   value" question wording. For categories that are inherently about how credible/connected an
   entity presents itself (Capital connector value, Network quality especially), evidence sourced
   only from the entity's own site will tend to score generously, since that's literally what the
   marketing copy is optimized to convey. Not fixed — worth keeping in mind when reviewing any
   near-perfect score, and worth deciding later whether independent (non-self-reported) sources
   should be weighted differently.

## Calibration

10. **Family Office's floor/ceiling (v1) is calibrated from only 29 real prospects across 4
    countries** (Singapore, Luxembourg, Qatar, UAE) plus Switzerland. Frozen for consistency per
    the "don't silently drift" decision, but a small sample — intended to be revisited once
    meaningfully more Family Office prospects have been gathered and scored.

11. **Angel Investor (and any future circle) is using Family Office's calibration numbers as a
    placeholder**, not its own. Concrete early evidence this may already be miscalibrated: 2 of
    the first 3 real Angel Investor prospects clamped at the ceiling (100/100) on both SBERT
    categories. Too small a sample (n=3) to be sure whether Angel Investor genuinely runs a higher
    typical similarity range than Family Office, or whether Switzerland just happened to surface
    two unusually strong matches — but this should be near the top of the list once more Angel
    Investor countries are gathered.

12. **The single-holistic-score design (from the team-meeting pivot) was superseded by the
    current per-category design** (4 tiered LLM-judgment categories + 2 SBERT-similarity
    categories, summed to a total) after the deeper per-circle category analysis. Noting this
    explicitly in case any earlier notes/documents referencing "one holistic score" cause
    confusion later — the per-category version is what's actually implemented.

## Operational / infrastructure

13. **`gemini-2.5-flash` free tier has a 20-requests-per-day cap** (separate from the
    5-requests-per-minute cap, which pacing already handles). This is a real ceiling on scaling to
    more prospects/circles, not something retry logic can work around. Current mitigation: the
    scoring scripts are resumable and save incrementally, so hitting the cap mid-run just means
    continuing the next day. Options if this becomes too slow: check whether a lighter model
    (`gemini-2.5-flash-lite`, `gemini-2.0-flash`) has a separate, more generous daily quota;
    enable billing (likely genuinely cheap at this volume, not yet confirmed with real pricing);
    or move the 4 tiered categories to a rule-based mechanism that doesn't need an LLM call at all.

14. **Dedup matches on exact (Country, Name) after lowercasing/trimming** — won't catch near-
    duplicate name variants (e.g. "XYZ Ltd" vs "XYZ Limited" would be treated as two different
    prospects). Also, if the same prospect appears in two *different, both-new* raw files with
    slightly different data, dedup silently keeps whichever file sorts first alphabetically, not
    necessarily the more complete or recent version. Not a problem with data gathered so far,
    worth knowing if it comes up.

15. **CSV output files can't be overwritten while open in Excel/another program** (hit this
    directly with `family-office.csv`) — not a code bug, just a Windows file-locking reality.
    Worth remembering to close the file before rerunning a scoring script if it's been opened for
    review.

## Not yet handled at all

16. **No Primary/Secondary circle classification.** The original design concept allows one
    organization to belong to more than one circle (Lombard Odier genuinely fits both Family
    Office and Capital Advisory/Introducer in real gathered data) — nothing in the pipeline
    currently tracks or surfaces this; each circle's discovery/scoring runs completely
    independently with no cross-circle awareness.
