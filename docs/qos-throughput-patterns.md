<h1>QoS & Throughput Patterns <img src="/images/downstream-rate-limiting-icon.svg" alt="QoS & Throughput Patterns" class="pattern-page-icon"></h1>

These patterns control how fast work executes, protect downstream services from overload, and make sure no single caller or tenant monopolizes Worker capacity at the expense of others.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="downstream-rate-limiting">
<div class="pattern-tile-header">
<img src="/images/downstream-rate-limiting-icon.svg" alt="Downstream Rate Limiting">
<span>Downstream Rate Limiting</span>
</div>
<p>Caps the Activity execution rate against a downstream service by routing throttled Activities to a dedicated Task Queue whose Workers enforce a throughput limit.</p>
</a>
</div>

<div class="pattern-tile">
<a href="priority-task-queues">
<div class="pattern-tile-header">
<img src="/images/priority-task-queues-icon.svg" alt="Priority Task Queues">
<span>Priority Task Queues</span>
</div>
<p>Assigns a priority level to Workflows and Activities so time-sensitive work runs ahead of lower-priority work on the same Task Queue.</p>
</a>
</div>

<div class="pattern-tile">
<a href="fairness">
<div class="pattern-tile-header">
<img src="/images/fairness-icon.svg" alt="Fairness">
<span>Fairness</span>
</div>
<p>Distributes Worker capacity evenly across tenants or users so a burst from one caller does not starve the others.</p>
</a>
</div>

</div>

## Choosing a Pattern

**A downstream dependency has a fixed rate limit**: use [Downstream Rate Limiting](/downstream-rate-limiting) to cap throughput at the Worker.

**Urgent work must not wait behind bulk work**: use [Priority Task Queues](/priority-task-queues).

**Multiple tenants share the same Workers**: use [Fairness](/fairness) to keep one tenant's burst from starving others.

## Related Sections

- [Worker Configuration Patterns](/worker-configuration-patterns) — the Task Queue and Worker setup these patterns route through
- [Batch Processing Patterns](/batch-processing-patterns) — rate-control patterns for large record sets
- [Error Handling & Retry Patterns](/error-handling-patterns) — back off and retry when a rate limit is hit
