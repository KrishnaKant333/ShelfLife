# Stage 3 - Landing Page and Marketing Experience

Status: Complete. See `specs/UI redesign stage 3 report.md`.

## 1. Objective
Make the landing page the visual benchmark for ShelfLife while keeping its claims accurate.

## 2. Scope
Hero, consumer/business value sections, how-it-works storytelling, AI/safety section, waste section, pricing, final CTA, footer, navbar, and public metadata/content hierarchy.

## 3. Pages/components affected
`src/app/(marketing)/page.tsx`; `Hero`; `ConsumerValue`; `BusinessValue`; `HowItWorks`; `AIApproach`; `WasteReduction`; `Pricing`; `PricingSection`; `FinalCTA`; `Footer`; `BackToTop`; `Navbar`.

## 4. UX requirements
Lead with a clear product promise and one primary CTA. Explain consumer and business value without overclaiming predictive intelligence or deferred barcode functionality. Make pricing scannable and distinguish implemented features from Coming Soon.

## 5. Visual requirements
Use expressive typography, a cinematic but inspectable hero composition, layered product UI or real food/inventory imagery, restrained atmospheric gradients, and scroll rhythm. Avoid generic AI imagery, excessive cards, purple defaults, neon, and all-green surfaces. Sections should be full-width bands with unframed compositions except genuinely framed repeated items.

## 6. Desktop behavior
Use large intentional compositions with a visible hint of the next section. Support wide screens without stretching reading measure. Use sticky or split compositions only when they improve comprehension.

## 7. Mobile behavior
Prioritize brand, promise, and CTA in the first viewport. Reduce decorative layers, reorder content, and keep the next section discoverable. Do not preserve desktop hero density or decorative media at the expense of reading and action.

## 8. Animation/motion requirements
Use staged entrance, section reveals, controlled metric/count animations, hover feedback, and optional scroll-linked storytelling. Motion must clarify product value. Any parallax must be shallow and disabled for reduced motion.

## 9. Accessibility requirements
Use semantic section headings, skip navigation, keyboard-visible links, meaningful image alt text, reduced-motion behavior, contrast-safe overlays, and no text embedded only in imagery.

## 10. Performance requirements
Prefer optimized static images and CSS layers. Video is optional only if it materially improves comprehension; if used, require poster, lazy loading, mobile fallback, reduced-motion fallback, size limits, and no autoplay audio. Avoid Three.js unless Stage 10 approves a concrete purpose.

## 11. Dependencies/libraries
Use existing Next Image, CSS, Lucide, and font system. Do not add animation or 3D libraries in this stage.

## 12. Things explicitly NOT to change
No auth behavior, pricing/business rules, dashboard components, AI logic, barcode scanning, or unimplemented feature claims.

## 13. Acceptance criteria
The landing page has a distinctive visual direction, accurate claims, clear CTA hierarchy, responsive structure at every target width, polished light/dark themes, and accessible motion.

## 14. Definition of Done
Marketing QA confirms the landing page is the strongest visual surface without leaking productivity-screen patterns or introducing fake functionality.

## 15. Dependencies on previous stages
Requires Stages 0-2; does not block authenticated application work after the shared system is stable.
