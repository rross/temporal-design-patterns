import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: 'Temporal Patterns',
  description: 'Common catalog of reusable patterns for Temporal workflows',
  base: process.env.VITEPRESS_BASE ?? '/temporal-design-patterns/',
  head: [
    // Google tag (gtag.js)
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-KCHNTGYY7N' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-KCHNTGYY7N');`]
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/taonic/temporal-design-patterns' }
    ],
    sidebar: [
      {
        text: 'Distributed Transaction Patterns',
        items: [
          { text: 'Saga Pattern', link: '/saga-pattern' },
          { text: 'Early Return', link: '/early-return' },
          { text: 'Idempotent Distributed Transactions', link: '/idempotent-distributed-transactions' }
        ]
      },
      {
        text: 'Entity & Lifecycle Patterns',
        items: [
          { text: 'Entity Workflow', link: '/entity-workflow' },
          { text: 'Continue-As-New', link: '/continue-as-new' },
          { text: 'Updatable Timer', link: '/updatable-timer' }
        ]
      },
      {
        text: 'Workflow Messaging Patterns',
        items: [
          { text: 'Signal with Start', link: '/signal-with-start' },
          { text: 'Request-Response via Updates', link: '/request-response-via-updates' },
          { text: 'Event Accumulator', link: '/event-accumulator' }
        ]
      },
      {
        text: 'Task Orchestration Patterns',
        items: [
          { text: 'Child Workflows', link: '/child-workflows' },
          { text: 'Parallel Execution', link: '/parallel-execution' },
          { text: 'Pick First (Race)', link: '/pick-first' }
        ]
      },
      {
        text: 'External Interaction Patterns',
        items: [
          { text: 'Polling External Services', link: '/polling' },
          { text: 'Long Running Activity', link: '/long-running-activity' },
          { text: 'Approval', link: '/approval' },
          { text: 'Delayed Start', link: '/delayed-start' },
          { text: 'Delayed Callback', link: '/delayed-callback' }
        ]
      },
      {
        text: 'Error Handling & Retry Patterns',
        items: [
          { text: 'Fixed Count of Retries', link: '/fixed-count-retries' },
          { text: 'Fixed Wall-Time Retries', link: '/fixed-wall-time-retries' },
          { text: 'Non-Retryable Errors', link: '/non-retryable-errors' },
          { text: 'Delayed Retry', link: '/delayed-retry' },
          { text: 'Fast/Slow Retries', link: '/fast-slow-retries' },
          { text: 'Retry Alerting via Metrics', link: '/retry-metrics' },
          { text: 'Resumable Activity', link: '/resumable-activity' }
        ]
      },
      {
        text: 'Worker Configuration Patterns',
        items: [
          { text: 'Worker-Specific Task Queues', link: '/worker-specific-taskqueue' },
          { text: 'Activity Dependency Injection', link: '/activity-dependency-injection' }
        ]
      },
      {
        text: 'QoS & Throughput Patterns',
        items: [
          { text: 'Downstream Rate Limiting', link: '/downstream-rate-limiting' },
          { text: 'Priority Task Queues', link: '/priority-task-queues' },
          { text: 'Fairness', link: '/fairness' }
        ]
      },
      {
        text: 'Batch Processing Patterns',
        items: [
          { text: 'Fan-Out with Child Workflows', link: '/fanout-child-workflows' },
          { text: 'Batch Iterator', link: '/batch-iterator' },
          { text: 'Sliding Window', link: '/sliding-window' },
          { text: 'MapReduce Tree', link: '/mapreduce-tree' }
        ]
      },
      {
        text: 'Performance & Latency Patterns',
        items: [
          { text: 'Overview', link: '/performance-latency-patterns' },
          { text: 'Local Activities', link: '/local-activities' },
          { text: 'Early Return + Local Activities', link: '/early-return-local-activities' },
          { text: 'Eager Workflow Start', link: '/eager-workflow-start' }
        ]
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/taonic/temporal-design-patterns' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Temporal Design Patterns Catalog'
    }
  },
  mermaid: {},
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  },
}))
