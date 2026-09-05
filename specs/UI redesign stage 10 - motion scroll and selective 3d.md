# Stage 10 - Advanced Motion, Scroll Storytelling, and Selective 3D

Status: Complete.

## Current checkpoint

Stage 10 is active after completion of the AI, recipe, insight, and waste experience pass. Motion work must remain selective, responsive, reduced-motion safe, and subordinate to task clarity; any 3D use requires clear product value and performance evidence.

## Current checkpoint

The marketing hero and core Consumer, Business, and How It Works bands now use short staggered reveals from the existing CSS motion system. The static layout and content remain available, mobile behavior stays unchanged, and the global `prefers-reduced-motion` override removes the nonessential animation. No 3D dependency is being added at this checkpoint because the existing layered product UI already communicates the product promise without WebGL cost.

The shared root body now provides a fixed top and bottom viewport-edge fog treatment on every scrollable route, including marketing, auth, and authenticated workspaces. It is implemented as pointer-transparent CSS gradients below navigation/dialog layers, does not change document flow, uses light/dark canvas tokens, and is reduced in height and opacity on handheld widths.

The remaining marketing bands retain progressive CSS view-timeline reveals as an opt-in enhancement through `.sl-scroll-motion`, with fully visible static content by default and explicit reduced-motion overrides. The default experience therefore remains calm and adjustable without removing the capability. Stage 10 does not add 3D because no concrete comprehension benefit or performance case was established for this product.

## 1. Objective
Add only high-value motion and optional 3D where it improves understanding or brand distinctiveness.

## 2. Scope
Marketing scroll choreography, sticky storytelling, layered compositions, metric reveals, product UI transitions, and one explicitly approved selective 3D experiment if justified.

## 3. Pages/components affected
Primarily marketing hero/sections and selected chart/product demonstrations. Authenticated dashboards receive only restrained transitions established earlier.

## 4. UX requirements
Motion must explain sequence, priority, or state. Every animated section needs a readable static state and must not delay primary actions or hide content.

## 5. Visual requirements
Prefer subtle depth, light/shadow movement, layered food/product imagery, and well-timed typography over spectacle. Do not use 3D in forms, tables, dashboards, or ordinary productivity interactions.

## 6. Desktop behavior
Use sticky scroll storytelling only for short, comprehensible sequences with stable reading measure and no scroll-jacking. Any 3D hero must remain secondary to the product promise.

## 7. Mobile behavior
Disable or simplify parallax and 3D at handheld widths unless performance and comprehension are demonstrably improved. Use static poster/image fallback and preserve the same narrative order.

## 8. Animation/motion requirements
Define enter/exit choreography, hover/press feedback, scroll thresholds, cancellation, reduced-motion alternatives, and no-motion loading states. Use one motion system; do not mix libraries casually.

## 9. Accessibility requirements
Honor `prefers-reduced-motion`, preserve keyboard and screen-reader order, avoid flashing, maintain focus visibility, and ensure animated content does not move under focus.

## 10. Performance requirements
Measure CPU/GPU cost, bundle impact, memory, first contentful paint, LCP, and mobile frame rate. Lazy-load motion/3D assets, pause offscreen work, cap device pixel ratio, and avoid WebGL on unsupported/low-power devices.

## 11. Dependencies/libraries
Evaluate Motion/Framer Motion versus GSAP only if scroll choreography requires it. Evaluate React Three Fiber/Three.js only for a documented hero/product visualization purpose. Add at most the minimum required library after a prototype comparison.

## 12. Things explicitly NOT to change
No data or feature logic, no route changes, no barcode scanning, no decorative 3D in authenticated productivity screens, and no motion that blocks usability.

## 13. Acceptance criteria
Every advanced effect has a purpose, static fallback, mobile behavior, reduced-motion behavior, performance budget, and test evidence. The page remains coherent with motion disabled.

## 14. Definition of Done
Motion/3D review approves only effects that materially improve comprehension or brand quality and rejects everything that is decorative overhead.

## 15. Dependencies on previous stages
Requires stable Stage 1 tokens, Stage 2 layout, Stage 3 marketing composition, and Stage 8 visual structures. Must follow rather than destabilize feature stages.
