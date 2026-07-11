<h1>Entity & Lifecycle Patterns <img src="/images/entity-workflow-icon.svg" alt="Entity & Lifecycle Patterns" class="pattern-page-icon"></h1>

These patterns model long-lived business entities as Workflows and keep those Workflows healthy as they run for days, months, or indefinitely. They cover how an entity holds and mutates state, how you bound Workflow history growth, and how you manage timers that change over time.

## Patterns in This Section

<div class="pattern-grid">
<div class="pattern-tile">
<a href="entity-workflow">
<div class="pattern-tile-header">
<img src="/images/entity-workflow-icon.svg" alt="Entity Workflow">
<span>Entity Workflow</span>
</div>
<p>Models a long-lived business entity as a single Workflow that persists for the entity's entire lifetime, handling every state transition through Signals and Updates.</p>
</a>
</div>

<div class="pattern-tile">
<a href="continue-as-new">
<div class="pattern-tile-header">
<img src="/images/continue-as-new-icon.svg" alt="Continue-As-New">
<span>Continue-As-New</span>
</div>
<p>Prevents unbounded history growth by completing the current execution and starting a fresh one that carries forward the current state.</p>
</a>
</div>

<div class="pattern-tile">
<a href="updatable-timer">
<div class="pattern-tile-header">
<img src="/images/updatable-timer-icon.svg" alt="Updatable Timer">
<span>Updatable Timer</span>
</div>
<p>Provides a timer you can extend, shorten, or cancel in response to Signals or Updates while the Workflow waits.</p>
</a>
</div>

</div>

## Choosing a Pattern

**You are modeling something with an ongoing lifecycle** — an account, a device, a subscription: use an [Entity Workflow](/entity-workflow) as the single source of truth for that entity.

**Your Workflow runs long enough to grow a large history**: apply [Continue-As-New](/continue-as-new) to reset history while preserving state.

**You need a wait that responds to new information**: use an [Updatable Timer](/updatable-timer) instead of a fixed sleep.

## Related Sections

- [Workflow Messaging Patterns](/workflow-messaging-patterns) — the Signals and Updates that drive entity state transitions
- [Task Orchestration Patterns](/task-orchestration-patterns) — decompose a large entity into child Workflows
