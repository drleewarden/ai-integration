import type { AuditBand } from "@/lib/members/tools/audits/types";

const POSITION: Record<AuditBand, string> = {
  low: "16.67%",
  medium: "50%",
  high: "83.33%",
};

const COLOR: Record<AuditBand, string> = {
  low: "var(--forest-signal)",
  medium: "var(--liquid-gold)",
  high: "#c0392b",
};

/**
 * Decorative severity meter under an audit result. The band itself is
 * announced through the result copy, so this is aria-hidden; the marker
 * slides between thirds via a CSS transition as answers change.
 */
export default function BandMeter({ band }: { band: AuditBand }) {
  return (
    <div aria-hidden="true" className="band-meter">
      <span
        className="band-meter-marker"
        style={{ left: POSITION[band], background: COLOR[band] }}
      />
    </div>
  );
}
