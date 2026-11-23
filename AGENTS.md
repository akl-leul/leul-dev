# Architecture rules
- Page share metadata (title, description, og:image, canonical on leul.tech) is set in each route's `head()` via `shareHead`, with loaders fetching project/post data; server rendering makes it crawler-visible, so never set meta tags client-side.
- Hero totals use an isolated count-up component with a tested easing function and reduced-motion bypass; this preserves exact database totals without announcing every animation frame.
- Experience entries use an accessible expandable chronological ledger, not animated cards; this separates intentional detail transitions from card hover behavior.
