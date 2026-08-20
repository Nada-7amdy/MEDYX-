/**
 * MEDYX icons — a deliberately small, hand-drawn set.
 * One icon per feature, plus a few UI marks. No icon library, no clutter.
 */
import type { SVGProps } from 'react';
import type { FeatureId } from '../design/features';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** The MEDYX mark: a capsule split into found / rescued halves. */
export function CapsuleMark(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="8" width="19" height="8" rx="4" />
      <path d="M12 8v8" />
      <path d="M6.5 12h2" />
    </svg>
  );
}

export function SearchExpandIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="4" />
      <path d="M10.5 2.6a7.9 7.9 0 0 1 0 15.8" opacity="0.55" />
      <path d="M10.5 18.4a7.9 7.9 0 0 1 0-15.8" opacity="0.25" />
      <path d="m15 15 6 6" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.2 13.7 9l5.8 1.7-5.8 1.7L12 18.2 10.3 12.4 4.5 10.7 10.3 9z" />
      <path d="M18.5 3.5v3M20 5h-3" opacity="0.6" />
    </svg>
  );
}

export function PulseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 12h4l2-5.5 3.5 11 2.5-7 1.8 3.5h5.2" />
    </svg>
  );
}

export function RadarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.6" opacity="0.5" />
      <path d="M12 12 18 7" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PharmacyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5 12 3l8 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M12 10.5v5M9.5 13h5" />
    </svg>
  );
}

export function SupportIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20.4S3.8 15.7 3.8 9.9A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8.2 2.3c0 5.8-8.2 10.5-8.2 10.5z" />
    </svg>
  );
}

export function IntelligenceIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 17.5 9 11l4 3.6 7.2-8" />
      <path d="M15.6 6.6h4.6v4.6" opacity="0.6" />
    </svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21.2s6.8-5.6 6.8-10.6a6.8 6.8 0 1 0-13.6 0c0 5 6.8 10.6 6.8 10.6z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20a7.4 7.4 0 0 1 14.4 0" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 12h14" />
      <path d="m13 6.5 5.5 5.5L13 17.5" />
    </svg>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 8.5h3.2l1.4-2.2h7.8l1.4 2.2h3.2v10a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
      <circle cx="12" cy="13.4" r="3.2" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

export const FEATURE_ICON: Record<
  FeatureId,
  (props: IconProps) => React.JSX.Element
> = {
  'rescue-search': SearchExpandIcon,
  'gemini-ai': SparkIcon,
  'stock-pulse': PulseIcon,
  'shortage-radar': RadarIcon,
  'pharmacy-network': PharmacyIcon,
  'rescue-support': SupportIcon,
  'supply-intelligence': IntelligenceIcon,
};
