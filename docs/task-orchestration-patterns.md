<h1>Task Orchestration Patterns <img src="/images/child-workflows-icon.svg" alt="Task Orchestration Patterns" class="pattern-page-icon"></h1>

These patterns compose and coordinate multiple units of work within a Workflow — decomposing large processes into reusable pieces, running work concurrently, and racing alternatives against each other.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="child-workflows">
<div class="pattern-tile-header">
<img src="/images/child-workflows-icon.svg" alt="Child Workflows">
<span>Child Workflows</span>
</div>
<p>Decomposes a complex Workflow into smaller, reusable units. Each child has its own Workflow ID, history, and lifecycle.</p>
</a>
</div>

<div class="pattern-tile">
<a href="parallel-execution">
<div class="pattern-tile-header">
<img src="/images/parallel-execution-icon.svg" alt="Parallel Execution">
<span>Parallel Execution</span>
</div>
<p>Runs multiple Activities concurrently for higher throughput, with error handling and a bound on how many run at once.</p>
</a>
</div>

<div class="pattern-tile">
<a href="pick-first">
<div class="pattern-tile-header">
<img src="/images/pick-first-icon.svg" alt="Pick First">
<span>Pick First (Race)</span>
</div>
<p>Starts multiple Activities in parallel, takes the first result to arrive, and cancels the rest.</p>
</a>
</div>

</div>

## Choosing a Pattern

**A process is large or reused across Workflows**: break it into [Child Workflows](/child-workflows) with independent histories.

**Independent work can run at the same time**: use [Parallel Execution](/parallel-execution) with a concurrency bound.

**Several approaches compete and you want the first to finish**: use [Pick First (Race)](/pick-first) and cancel the losers.

## Related Sections

- [Batch Processing Patterns](/batch-processing-patterns) — fan-out orchestration scaled to large record sets
- [Performance & Latency Patterns](/performance-latency-patterns) — reduce the latency of the work each task performs
