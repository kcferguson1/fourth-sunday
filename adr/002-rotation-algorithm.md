# ADR 002 — Rotation algorithm choice

**Status:** Accepted

---

## Context

Three options were considered for distributing speaking assignments:

**Round-robin** — speaker 0 goes first in month 0, speaker 1 in month 1, same ward ordering every month. Simple but every ward always gets the same speaker for consecutive months until the list cycles.

**Latin square** — each month shifts the starting position by one, so ward i gets speaker (monthIndex + wardIndex) % N. No ward sees the same speaker two months in a row as long as N > 1.

**Constraint-solver** — a backtracking or ILP solver that could respect hard constraints (avoid speaker's own ward, no more than X assignments per year, preferred pairings). Maximum flexibility, significant complexity.

---

## Decision

Latin square.

---

## Reasons

1. **Stakes are small.** With ~17 speakers and ~9 wards, a Latin square distributes workload evenly enough that no solver is needed. The exec sec can handle edge cases manually.

2. **Transparent and predictable.** The exec sec can understand and predict the output without running the tool. If they know speaker 3 is at position 3, they can mentally project the next few months. A solver's output is opaque.

3. **No constraint configuration burden.** A solver needs constraints defined. That's a maintenance surface — callings change, ward configurations change, preferences change. Removing that configuration layer means less to break.

4. **Locked rows and overrides cover the real edge cases.** Ward Conferences and swap requests handle the real-world disruptions. The remaining need is just even distribution, which the Latin square provides.

5. **Unit-testable pure function.** The Latin-square formula is three lines. The test suite covers it exhaustively in under a second.

---

## Trade-offs accepted

If a stake has strong preferences (e.g., "never assign speaker X to ward Y"), those must be handled manually via post-rollover edits and locked rows. The algorithm does not model them.

If future demand warrants it, a constraint solver could be added as an alternative `Rollover Algorithm` setting without changing the existing code path.
