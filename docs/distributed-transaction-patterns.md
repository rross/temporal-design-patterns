<h1>Distributed Transaction Patterns <img src="/images/saga-icon.svg" alt="Distributed Transaction Patterns" class="pattern-page-icon"></h1>

Distributed transactions span multiple services that each own their own data, with no shared database transaction to roll back. These patterns coordinate the steps, undo completed work when a later step fails, and keep external side effects correct under retries.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="saga-pattern">
<div class="pattern-tile-header">
<img src="/images/saga-icon.svg" alt="Saga Pattern">
<span>Saga Pattern</span>
</div>
<p>Manages a distributed transaction as a sequence of local steps, where each step defines a compensating action that undoes its effect if a later step fails.</p>
</a>
</div>

<div class="pattern-tile">
<a href="early-return">
<div class="pattern-tile-header">
<img src="/images/early-return-icon.svg" alt="Early Return">
<span>Early Return</span>
</div>
<p>Returns a result to the caller as soon as initialization succeeds, while the remaining work continues asynchronously in the background.</p>
</a>
</div>

</div>

## Choosing a Pattern

**You need to undo completed steps when a later step fails**: use the [Saga Pattern](/saga-pattern) and define a compensation for every step that has an external effect.

**You need to respond to the caller before the transaction finishes**: use [Early Return](/early-return) to acknowledge after initialization and continue processing in the background.

## Related Sections

- [Error Handling & Retry Patterns](/error-handling-patterns) — control how each step retries before a compensation triggers
- [Workflow Messaging Patterns](/workflow-messaging-patterns) — the Update-with-Start mechanism behind Early Return
- [Performance & Latency Patterns](/performance-latency-patterns) — combine Early Return with Local Activities for the lowest first-response latency
