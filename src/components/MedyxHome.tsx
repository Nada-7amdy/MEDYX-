import { useEffect, useRef, useState } from 'react';
import { AmbientCanvas } from './AmbientCanvas';
import { TopNav } from './TopNav';
import { Hero } from './Hero';
import { FeatureCapsule } from './FeatureCapsule';
import { RescueSearchPanel } from './rescue/RescueSearchPanel';
import { useRescueSearch } from '../lib/useRescueSearch';
import { useAuth } from '../auth/AuthProvider';
import {
  PRIMARY_FEATURE,
  HOME_SECONDARY_FEATURES,
  type FeatureId,
} from '../design/features';

/**
 * MEDYX Home — the authenticated product surface.
 *
 * Deliberately NOT a dashboard: no sidebar, no KPI grid, no charts. There is
 * exactly one dominant action (search for a medicine) and a small set of
 * supporting capsules that describe where the journey goes next.
 */
export function MedyxHome() {
  const { user } = useAuth();
  // Only one capsule is expanded at a time — the interface stays calm.
  const [openId, setOpenId] = useState<FeatureId | null>('rescue-search');
  const engine = useRescueSearch();
  const panelRef = useRef<HTMLDivElement>(null);

  function toggle(id: FeatureId, next: boolean) {
    setOpenId(next ? id : null);
  }

  /** A search always drives the Rescue Search capsule open. */
  function handleSearch(query: string) {
    setOpenId('rescue-search');
    engine.search(query);
  }

  // Bring results into view when a search starts from the hero field.
  useEffect(() => {
    if (engine.phase === 'searching' && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [engine.phase]);

  // Live chip + metric on the Rescue Search capsule head.
  const rescueLabel = engine.busy
    ? 'Searching'
    : engine.phase === 'exhausted'
      ? 'Exhausted'
      : engine.ring && engine.ring.results.length > 0
        ? `${engine.ring.results.length} found`
        : engine.phase === 'results'
          ? 'None in ring'
          : undefined;

  const firstName = user?.fullName?.split(' ')[0];

  return (
    <div id="top" className="min-h-dvh">
      <AmbientCanvas />
      <TopNav />

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
        <Hero
          greetingName={firstName}
          onSearch={handleSearch}
          searching={engine.busy}
          location={engine.location}
          onLocationChange={engine.changeLocation}
        />

        {/* ---------------- Rescue Search: the dominant capsule ------------- */}
        <section aria-labelledby="rescue-heading" className="mt-14 sm:mt-20">
          <h2 id="rescue-heading" className="sr-only">
            Rescue Search
          </h2>
          <div ref={panelRef} id="rescue-search" className="scroll-mt-24">
            <FeatureCapsule
              feature={PRIMARY_FEATURE}
              expanded={openId === PRIMARY_FEATURE.id}
              onToggle={(next) => toggle(PRIMARY_FEATURE.id, next)}
              loading={engine.busy}
              statusLabel={rescueLabel}
              metric={{ value: `${engine.radius} km`, caption: 'current ring' }}
            >
              <RescueSearchPanel engine={engine} />
            </FeatureCapsule>
          </div>
        </section>

        {/* ---------------- Supporting capsules (not yet built) ------------- */}
        <section aria-labelledby="features-heading" className="mt-12 sm:mt-16">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-cyan-600 uppercase">
                Where the journey goes next
              </p>
              <h2
                id="features-heading"
                className="mt-1.5 text-lg font-bold tracking-tight text-ink-900 sm:text-xl"
              >
                Supporting the search
              </h2>
            </div>
            <p className="max-w-sm text-[13px] text-ink-500">
              Previews only — these interfaces arrive in a later phase.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
            {HOME_SECONDARY_FEATURES.map((feature) => (
              <FeatureCapsule
                key={feature.id}
                feature={feature}
                expanded={openId === feature.id}
                onToggle={(next) => toggle(feature.id, next)}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-ice-300/70 bg-paper/50 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-7 text-[12px] text-ink-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-semibold tracking-[0.12em] text-ink-600 uppercase">
            MEDYX · Supply Rescue
          </p>
          <p className="max-w-lg leading-relaxed">
            MEDYX is not a government platform, not an insurance provider and not
            a diagnosis system. It helps locate medicines and connect eligible
            patients to pre-funded support.
          </p>
        </div>
      </footer>
    </div>
  );
}
