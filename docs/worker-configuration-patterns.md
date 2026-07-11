<h1>Worker Configuration Patterns <img src="/images/worker-specific-taskqueue-icon.svg" alt="Worker Configuration Patterns" class="pattern-page-icon"></h1>

These patterns cover how you set up Workers, route work to them, and give Activities the external dependencies they need — while keeping Workflow code deterministic and testable.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="worker-specific-taskqueue">
<div class="pattern-tile-header">
<img src="/images/worker-specific-taskqueue-icon.svg" alt="Worker-Specific Task Queues">
<span>Worker-Specific Task Queues</span>
</div>
<p>Routes Activities to a specific Worker using a unique Task Queue, for Worker affinity and host-specific processing.</p>
</a>
</div>

<div class="pattern-tile">
<a href="activity-dependency-injection">
<div class="pattern-tile-header">
<img src="/images/activity-dependency-injection-icon.svg" alt="Activity Dependency Injection">
<span>Activity Dependency Injection</span>
</div>
<p>Injects external dependencies — clients, connections, configuration — into Activities at Worker startup, keeping Workflow code deterministic and Activities testable.</p>
</a>
</div>

</div>

## Choosing a Pattern

**A sequence of Activities must run on the same Worker host**: use [Worker-Specific Task Queues](/worker-specific-taskqueue) to pin them to one Worker.

**Activities depend on external resources**: use [Activity Dependency Injection](/activity-dependency-injection) to supply them at startup rather than constructing them inside each Activity.

## Related Sections

- [QoS & Throughput Patterns](/qos-throughput-patterns) — Task Queue routing for rate control and fairness
- [Performance & Latency Patterns](/performance-latency-patterns) — run Activities in-process with Local Activities
