<h1>Performance & Latency Patterns <img src="/images/performance-latency-icon.svg" alt="Performance & Latency Patterns" class="pattern-page-icon"></h1>

Temporal Workflows are durable and reliable, but a default implementation—using regular Activities scheduled through the Temporal server—carries inherent latency. Each regular Activity incurs multiple server round-trips, and each new Workflow begins with a Matching Service routing step. On Temporal Cloud, this baseline can reach 850 ms or more for a typical three-Activity workflow.

This section covers three complementary patterns that each target a different source of latency. They can be applied individually or combined depending on your requirements.

## Latency Sources in a Typical Workflow

```mermaid
flowchart LR
    A[Client\nExecuteWorkflow] --> B[Matching Service\nroutes first WFT]
    B --> C[Worker\nexecutes WFT]
    C --> D[Server\nschedules Activity]
    D --> E[Worker\nexecutes Activity]
    E --> F[Server\nrecords completion]
    F --> G[Worker\nresumes WFT]
    G --> H[Repeat per\nActivity]
```

| Source | Overhead | Pattern that removes it |
|---|---|---|
| Matching Service (first Workflow Task) | ~30–50 ms | [Eager Workflow Start](/eager-workflow-start) |
| Activity scheduling round-trip | ~50 ms per Activity | [Local Activities](/local-activities) |
| Client waiting for full workflow | Total duration | [Early Return](/early-return) |

## Pattern Comparison

The numbers below are approximate benchmarks based on a three-Activity transaction workflow running on Temporal Cloud. Actual results vary by region, Activity implementation, and server load.

| Pattern | First Response | Total Latency | SDK Support |
|---|---|---|---|
| Baseline (regular Activities) | ~850 ms | ~850 ms | All |
| [Early Return](/early-return) | ~265 ms | ~850 ms | All |
| [Local Activities](/local-activities) | ~275 ms | ~275 ms | All |
| [Early Return + Local Activities](/early-return-local-activities) | ~160 ms | ~275 ms | All |
| [Eager Workflow Start](/eager-workflow-start) + Local Activities | ~265 ms | ~265 ms | Go, Java, Python |
| Early Return + Local Activities + Eager Start | ~160 ms | ~265 ms | Go, Java, Python |

**First Response** is the time until the client receives an actionable result. **Total Latency** is the time until the Workflow fully completes.

:::tip TypeScript users
Eager Workflow Start is not available in the TypeScript SDK, but the latency gap is small (~30–50 ms per Workflow start). [Local Activities](/local-activities) and [Early Return + Local Activities](/early-return-local-activities) are fully supported and achieve competitive results: ~275 ms total latency and ~160 ms first-response latency respectively.
:::

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="local-activities">
<div class="pattern-tile-header">
<img src="/images/local-activities-icon.svg" alt="Local Activities">
<span>Local Activities</span>
</div>
<p>Run Activity functions in-process inside the Workflow Task, eliminating all server scheduling round-trips. Best for short, idempotent Activities on a latency-sensitive path.</p>
</a>
</div>

<div class="pattern-tile">
<a href="early-return-local-activities">
<div class="pattern-tile-header">
<img src="/images/early-return-local-activities-icon.svg" alt="Early Return + Local Activities">
<span>Early Return + Local Activities</span>
</div>
<p>Extends Early Return by running Phase 1 Activities as Local Activities. The client receives its response after Phase 1 completes entirely in-process, achieving the lowest possible first-response latency.</p>
</a>
</div>

<div class="pattern-tile">
<a href="eager-workflow-start">
<div class="pattern-tile-header">
<img src="/images/eager-workflow-start-icon.svg" alt="Eager Workflow Start">
<span>Eager Workflow Start</span>
</div>
<p>Dispatch the first Workflow Task directly to a co-located Worker, bypassing the Temporal Matching Service. Requires the starter and Worker to share the same process and client connection.</p>
</a>
</div>

</div>

## Choosing a Pattern

**You only care about total workflow latency** (not first-response time): use [Local Activities](/local-activities). If co-location is feasible, add [Eager Workflow Start](/eager-workflow-start) for the maximum reduction.

**You care most about first-response latency**: use [Early Return + Local Activities](/early-return-local-activities). The client gets its response in ~160 ms; background work continues independently.

**You are using TypeScript**: use [Local Activities](/local-activities) and [Early Return + Local Activities](/early-return-local-activities). Eager Workflow Start is not available in the TypeScript SDK.

**You want to start simple**: begin with [Local Activities](/local-activities). It requires minimal structural change and provides the most straightforward per-Activity improvement.

## Related Sections

- [Distributed Transaction Patterns](/distributed-transaction-patterns) — the [Early Return](/early-return) pattern lives there, describing the Update-with-Start mechanism in detail
- [Worker Configuration Patterns](/worker-configuration-patterns) — tuning Worker concurrency and task queue assignments that affect throughput
- [QoS & Throughput Patterns](/qos-throughput-patterns) — rate limiting and fairness patterns for high-volume workloads
