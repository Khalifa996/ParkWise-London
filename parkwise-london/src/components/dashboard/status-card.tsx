import type { ParkingDecision } from "@/types/parking";

const statusStyles = {
  allowed: {
    shell: "border-emerald-300/60 bg-emerald-500/12 text-emerald-50",
    badge: "bg-emerald-300 text-emerald-950",
  },
  limited: {
    shell: "border-amber-300/60 bg-amber-400/12 text-amber-50",
    badge: "bg-amber-200 text-amber-950",
  },
  not_allowed: {
    shell: "border-rose-300/60 bg-rose-500/12 text-rose-50",
    badge: "bg-rose-200 text-rose-950",
  },
} as const;

function formatVehicleType(vehicleType: ParkingDecision["vehicleType"]) {
  switch (vehicleType) {
    case "motorcycle":
      return "Motorcycle";
    case "electric":
      return "Electric vehicle";
    case "commercial":
      return "Commercial vehicle";
    default:
      return "Car";
  }
}

type StatusCardProps = {
  result: ParkingDecision | null;
  loading: boolean;
  error: string | null;
  matchedZoneName: string;
};

export function StatusCard({ result, loading, error, matchedZoneName }: StatusCardProps) {
  if (loading) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <p className="text-sm uppercase tracking-[0.24em] text-teal-200/70">Decision</p>
        <p className="mt-4 text-lg text-slate-100">Checking local parking rules...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-[28px] border border-rose-300/40 bg-rose-500/10 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
        <p className="text-sm uppercase tracking-[0.24em] text-rose-100/80">Decision</p>
        <p className="mt-4 text-lg text-rose-50">{error}</p>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="rounded-[28px] border border-dashed border-white/15 bg-slate-950/55 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <p className="text-sm uppercase tracking-[0.24em] text-teal-200/70">Decision</p>
        <p className="mt-4 text-lg text-slate-100">Drop a pin on the map to check the parking rule at that location.</p>
      </section>
    );
  }

  const styles = statusStyles[result.status];

  return (
    <section className={`rounded-[28px] border p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-6 ${styles.shell}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-current/80">Parking Result</p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">{result.headline}</h2>
          <p className="mt-3 text-sm leading-7 text-current/90">{result.explanation.summary}</p>
        </div>
        <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${styles.badge}`}>
          {result.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-current/15 bg-black/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Borough</p>
          <p className="mt-2 font-medium">{result.borough}</p>
        </div>
        <div className="rounded-2xl border border-current/15 bg-black/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Date And Time</p>
          <p className="mt-2 font-medium">{result.checkedAt}</p>
        </div>
        <div className="rounded-2xl border border-current/15 bg-black/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Vehicle Type</p>
          <p className="mt-2 font-medium">{formatVehicleType(result.vehicleType)}</p>
        </div>
        <div className="rounded-2xl border border-current/15 bg-black/10 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Blue Badge</p>
          <p className="mt-2 font-medium">{result.hasBlueBadge ? "Enabled" : "Not enabled"}</p>
        </div>
        <div className="rounded-2xl border border-current/15 bg-black/10 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Matched Rule</p>
          <p className="mt-2 font-medium">{result.bayType} in {result.ruleSource}</p>
        </div>
        <div className="rounded-2xl border border-current/15 bg-black/10 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Matched Zone Name</p>
          <p className="mt-2 font-medium">{matchedZoneName}</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-current/15 bg-black/10 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-current/70">Plain English Explanation</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-current/90">
          {result.explanation.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>

      {result.warningMessages.length > 0 || result.explanation.warning ? (
        <div className="mt-5 rounded-2xl border border-current/15 bg-black/15 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-current/70">Warnings And Uncertainty</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-current/90">
            {result.explanation.warning ? <li>{result.explanation.warning}</li> : null}
            {result.warningMessages.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
