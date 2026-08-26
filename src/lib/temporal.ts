import { Temporal as TemporalPolyfill } from "@js-temporal/polyfill";

declare global {
  var Temporal: typeof TemporalPolyfill | undefined;
}

if (!globalThis.Temporal) {
  globalThis.Temporal = TemporalPolyfill;
}

export const Temporal = TemporalPolyfill;