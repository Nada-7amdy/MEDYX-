/**
 * Ambient background: soft gradient blooms + a faint grid.
 * Subtle only — this must never read as cyberpunk.
 *
 * Both themes are driven by tokens: light is an ice-blue wash, dark is a deep
 * navy field with dimmer, cooler blooms (a re-design, not an inversion).
 */
export function AmbientCanvas() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Base wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, var(--md-canvas) 0%, var(--md-canvas) 40%, var(--md-canvas-deep) 100%)',
        }}
      />

      {/* Blooms — opacity is token-driven so dark mode stays restrained. */}
      <div
        className="animate-drift absolute -top-32 -left-24 size-[420px] rounded-full blur-[110px] sm:size-[560px]"
        style={{ background: 'var(--md-bloom-medic)' }}
      />
      <div
        className="animate-drift absolute -top-16 right-[-10%] size-[380px] rounded-full blur-[110px] sm:size-[520px]"
        style={{ background: 'var(--md-bloom-cyan)', animationDelay: '-6s' }}
      />
      <div
        className="animate-drift absolute bottom-[-15%] left-1/3 size-[400px] rounded-full blur-[120px] sm:size-[560px]"
        style={{ background: 'var(--md-bloom-neon)', animationDelay: '-12s' }}
      />

      {/* Faint grid for structure */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 'var(--md-grid-opacity)',
          backgroundImage:
            'linear-gradient(to right, var(--md-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--md-grid-line) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 60% at 50% 0%, #000 20%, transparent 75%)',
        }}
      />
    </div>
  );
}
