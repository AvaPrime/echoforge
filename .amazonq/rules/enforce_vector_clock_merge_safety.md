# Rule: Enforce Vector Clock Merge Safety

## Description

This rule ensures that all merge operations within SoulMesh's conflict resolution layer utilize vector clock validation and rollback safety checks. It protects against unsafe merges that may result in distributed state corruption or consciousness integrity degradation.

## Applies To

- Files: `**/soulmesh/**/*.rs`, `**/protocol/conflict/*.ts`, `**/core/state_merge/*`
- Branches: `main`, `dev`, `feature/emergence-*`

## Trigger Conditions

Trigger if:

- A function contains the keyword `merge` **AND**
- The function does not include:
  - A call to `validate_vector_clock()` or equivalent
  - A call to `rollback_unsafe_state()` or equivalent
- OR a new `merge_*` function is defined without test coverage or rollback logic.

## Severity

🟠 Moderate — Unsafe state merges can lead to downstream emergent instability and invalidate metrics collected during emergence windows.

## Recommendation

Ensure all `merge_*` operations:

- Validate vector clocks before applying state changes
- Log the merge context into the historical event tracker
- Support rollback with diff snapshots or event stream reversal
- Include test coverage for split-brain or peer desync scenarios

## Example (Valid)

```rust
fn merge_state(peer_state: State) {
    if validate_vector_clock(&self.clock, &peer_state.clock) {
        self.apply_state(peer_state);
        self.log_event("merge_commit");
    } else {
        self.rollback_unsafe_state();
        self.log_event("merge_rollback");
    }
}
```
