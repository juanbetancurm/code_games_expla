export function ExecutionControls({
  cursor,
  total,
  busy,
  playing,
  stopped = false,
  onReset,
  onPrevious,
  onNext,
  onPlay,
  unitLabel = "STEP",
  nextLabel = "NEXT STEP",
  completeLabel = "PROGRAM COMPLETE",
  stoppedLabel = "PROGRAM STOPPED",
}) {
  const complete = cursor >= total;
  const unit = unitLabel.toLowerCase();
  let readout;
  if (stopped) readout = <strong className="is-stopped">✕ {stoppedLabel}</strong>;
  else if (complete) readout = <strong className="is-complete">✓ {completeLabel}</strong>;
  else if (busy) readout = <span>Running {unit} <strong>{cursor + 1}</strong> of {total}</span>;
  else readout = <span>Next: {unit} <strong>{cursor + 1}</strong> of {total}</span>;

  return (
    <div className="program-actions step-controls">
      <div className="step-readout" aria-live="polite">
        {readout}
        {total <= 12 && (
          <span className="step-pips" aria-hidden="true">
            {Array.from({ length: total }, (_, index) => (
              <i key={index} className={index < cursor ? "is-done" : index === cursor && busy ? "is-running" : ""} />
            ))}
          </span>
        )}
      </div>
      <div className="step-control-buttons">
        <button className="icon-step-button" type="button" onClick={onReset} aria-label="Reset" title="Reset (R)" aria-keyshortcuts="R">↻</button>
        <button className="icon-step-button" type="button" onClick={onPrevious} disabled={busy || cursor === 0} aria-label={`Previous ${unit}`} title={`Previous ${unit} (←)`} aria-keyshortcuts="ArrowLeft">←</button>
        <button className="next-step-button" type="button" onClick={onNext} disabled={busy || complete} title={`${nextLabel} (→)`} aria-keyshortcuts="ArrowRight">{nextLabel} <span>›</span></button>
        <button className={`play-step-button ${playing ? "is-playing" : ""}`} type="button" onClick={onPlay} disabled={complete || (busy && !playing)} title="Play all / pause (P)" aria-keyshortcuts="P">{playing ? "Ⅱ PAUSE" : "▶ PLAY ALL"}</button>
      </div>
    </div>
  );
}
