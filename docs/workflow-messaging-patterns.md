<h1>Workflow Messaging Patterns <img src="/images/signal-with-start-icon.svg" alt="Workflow Messaging Patterns" class="pattern-page-icon"></h1>

These patterns cover how external callers communicate with running Workflows — starting them on demand, sending data in, reading results back, and collecting streams of events. They build on Temporal's Signals and Updates.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="signal-with-start">
<div class="pattern-tile-header">
<img src="/images/signal-with-start-icon.svg" alt="Signal with Start">
<span>Signal with Start</span>
</div>
<p>Starts a Workflow and delivers a Signal in a single atomic operation. If the Workflow already runs, it receives the Signal directly.</p>
</a>
</div>

<div class="pattern-tile">
<a href="request-response-via-updates">
<div class="pattern-tile-header">
<img src="/images/request-response-icon.svg" alt="Request-Response via Updates">
<span>Request-Response via Updates</span>
</div>
<p>Sends a request into a running Workflow and receives a validated result on the same call, using an Update handler.</p>
</a>
</div>

<div class="pattern-tile">
<a href="event-accumulator">
<div class="pattern-tile-header">
<img src="/images/event-accumulator-icon.svg" alt="Event Accumulator">
<span>Event Accumulator</span>
</div>
<p>Collects a stream of incoming Signals into a buffer and processes them together as a batch, rather than one at a time.</p>
</a>
</div>

</div>

## Choosing a Pattern

**You want to send a message without checking whether the Workflow is running**: use [Signal with Start](/signal-with-start).

**You need a result back from the Workflow, with validation**: use [Request-Response via Updates](/request-response-via-updates).

**You receive many events and want to process them in batches**: use the [Event Accumulator](/event-accumulator) to buffer and flush.

## Related Sections

- [Entity & Lifecycle Patterns](/entity-lifecycle-patterns) — long-lived Workflows that consume these messages over time
- [Distributed Transaction Patterns](/distributed-transaction-patterns) — Early Return builds on the Update-with-Start mechanism
