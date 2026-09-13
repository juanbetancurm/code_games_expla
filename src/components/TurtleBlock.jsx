function status(block, state) {
  return state.activeBlock === block.id ? "is-active" : "";
}

function Value({ children }) {
  return <strong className="turtle-value">{children}</strong>;
}

function CommandBlock({ block, state, nested = false }) {
  let content;
  if (block.kind === "move") content = <>move <Value>forward⌄</Value> by <Value>{block.distance}</Value></>;
  if (block.kind === "turn") content = <>turn <Value>{block.direction} ↻</Value> by <Value>{block.angle}°</Value></>;
  if (block.kind === "pen") content = <>pen <Value>{block.down ? "down" : "up"}⌄</Value></>;
  if (block.kind === "color") content = <>set colour to <i className="turtle-colour-swatch" style={{ background: block.color }} /><Value>{block.name}</Value></>;
  if (block.kind === "width") content = <>set width to <Value>{block.width}</Value></>;
  return <div className={`turtle-command turtle-exec ${nested ? "is-nested" : ""} ${status(block, state)}`}>{content}</div>;
}

function RepeatBlock({ block, state }) {
  return (
    <div className={`turtle-repeat turtle-exec ${status(block, state)}`}>
      <div className="turtle-repeat__title">repeat <Value>{block.times}⌄</Value> times</div>
      <div className="turtle-repeat__body">
        <span>do</span>
        <div>{block.children.map((child) => <CommandBlock block={child} state={state} nested key={child.id} />)}</div>
      </div>
    </div>
  );
}

export function TurtleProgram({ program, state }) {
  return (
    <div className="turtle-program-stack">
      {program.map((block) => block.kind === "repeat"
        ? <RepeatBlock block={block} state={state} key={block.id} />
        : <CommandBlock block={block} state={state} key={block.id} />)}
    </div>
  );
}
