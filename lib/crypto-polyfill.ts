// Polyfill crypto.randomUUID for non-secure contexts (e.g. LAN HTTP access).
// Must be imported as a side-effect module BEFORE any library that calls
// crypto.randomUUID() at module-initialization time.
if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
  crypto.randomUUID = () =>
    '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
      (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
    ) as `${string}-${string}-${string}-${string}-${string}`;
}
