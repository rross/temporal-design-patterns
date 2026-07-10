# Performance & Latency Patterns

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

### [Local Activities](/local-activities)

Run Activity functions in-process inside the Workflow Task, eliminating all server scheduling round-trips. Best for short, idempotent Activities on a latency-sensitive path.

**Saves:** ~50 ms per Activity call  
**Constraint:** Activities must complete within the Workflow Task timeout  
**SDK support:** All

</div>

<div class="pattern-tile">

### [Early Return + Local Activities](/early-return-local-activities)

Extends [Early Return](/early-return) by running Phase 1 Activities as Local Activities. The client receives its response after Phase 1 completes entirely in-process, achieving the lowest possible first-response latency.

**Saves:** ~105 ms vs plain Early Return (~265 ms → ~160 ms first response)  
**Constraint:** Phase 1 must be short-lived and idempotent  
**SDK support:** All

</div>

<div class="pattern-tile">

### [Eager Workflow Start](/eager-workflow-start)

Dispatch the first Workflow Task directly to a co-located Worker, bypassing the Temporal Matching Service. Requires the starter and Worker to share the same process and client connection.

**Saves:** ~30–50 ms per Workflow start  
**Constraint:** Starter and Worker must be co-located; TypeScript SDK not supported  
**SDK support:** Go, Java, Python

</div>

</div>

## Choosing a Pattern

**You only care about total workflow latency** (not first-response time): use [Local Activities](/local-activities). If co-location is feasible, add [Eager Workflow Start](/eager-workflow-start) for the maximum reduction.

**You care most about first-response latency**: use [Early Return + Local Activities](/early-return-local-activities). The client gets its response in ~160 ms; background work continues independently.

**You are using TypeScript**: use [Local Activities](/local-activities) and [Early Return + Local Activities](/early-return-local-activities). Eager Workflow Start is not available in the TypeScript SDK.

**You want to start simple**: begin with [Local Activities](/local-activities). It requires minimal structural change and provides the most straightforward per-Activity improvement.

## Related Sections

- Distributed Transaction Patterns — the [Early Return](/early-return) pattern lives there, describing the Update-with-Start mechanism in detail
- Worker Configuration Patterns — tuning Worker concurrency and task queue assignments that affect throughput; see [Worker-Specific Task Queues](/worker-specific-taskqueue)
- QoS & Throughput Patterns — rate limiting and fairness patterns for high-volume workloads; see [Downstream Rate Limiting](/downstream-rate-limiting) and [Fairness](/fairness)

<style>
.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}
.pattern-tile {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.25rem 1.5rem;
}
.pattern-tile h3 {
  margin-top: 0;
}
</style>
