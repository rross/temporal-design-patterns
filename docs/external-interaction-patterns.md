<h1>External Interaction Patterns <img src="/images/polling-icon.svg" alt="External Interaction Patterns" class="pattern-page-icon"></h1>

These patterns cover how a Workflow waits on or interacts with the world outside it — external APIs, human decisions, scheduled delays, and inbound or outbound callbacks — while staying durable across failures.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="polling">
<div class="pattern-tile-header">
<img src="/images/polling-icon.svg" alt="Polling External Services">
<span>Polling External Services</span>
</div>
<p>Checks an external resource on a schedule until it reaches the state you need, with frequent, infrequent, and periodic variants.</p>
</a>
</div>

<div class="pattern-tile">
<a href="long-running-activity">
<div class="pattern-tile-header">
<img src="/images/long-running-activity-icon.svg" alt="Long Running Activity">
<span>Long Running Activity</span>
</div>
<p>Reports progress via heartbeats and resumes after failures, with cancellation support, for Activities that run for minutes to hours.</p>
</a>
</div>

<div class="pattern-tile">
<a href="approval">
<div class="pattern-tile-header">
<img src="/images/approval-icon.svg" alt="Approval">
<span>Approval</span>
</div>
<p>Blocks the Workflow until an external decision arrives, capturing the approval and its metadata through a Signal.</p>
</a>
</div>

<div class="pattern-tile">
<a href="delayed-start">
<div class="pattern-tile-header">
<img src="/images/delayed-start-icon.svg" alt="Delayed Start">
<span>Delayed Start</span>
</div>
<p>Creates the Workflow immediately but defers execution until a delay expires.</p>
</a>
</div>

<div class="pattern-tile">
<a href="delayed-callback">
<div class="pattern-tile-header">
<img src="/images/webhooks-icon.svg" alt="Delayed Callback (Webhooks)">
<span>Delayed Callback (Webhooks)</span>
</div>
<p>Integrates webhooks durably: receive inbound webhooks via Signals, fire delayed outbound callbacks with durable timers, and complete Activities asynchronously via task tokens.</p>
</a>
</div>

</div>

## Choosing a Pattern

**The external system offers no notification**: use [Polling External Services](/polling) and tune the interval to the expected latency.

**One Activity runs for a long time**: use a [Long Running Activity](/long-running-activity) with heartbeats so failures resume instead of restarting.

**A person or external system must decide**: use [Approval](/approval) to block on a Signal.

**Execution should begin later**: use [Delayed Start](/delayed-start).

**You send or receive HTTP callbacks**: use [Delayed Callback (Webhooks)](/delayed-callback).

## Related Sections

- [Error Handling & Retry Patterns](/error-handling-patterns) — retry strategies for the external calls these patterns make
- [Workflow Messaging Patterns](/workflow-messaging-patterns) — the Signals that deliver external decisions into a Workflow
