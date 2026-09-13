function blockStatus(id, state) {
  return state.activeBlock === id ? "is-active" : "";
}

function ConditionChip({ condition }) {
  if (!condition) return null;
  if (condition.kind === "worm") return <span className="bird-condition bird-condition--worm">does not have worm</span>;
  if (condition.kind === "coordinate") {
    return <span className="bird-condition bird-condition--coordinate"><b>{condition.axis}</b><i>{condition.operator}</i><strong>{condition.value}</strong></span>;
  }
  return (
    <span className="bird-condition bird-condition--and">
      <ConditionChip condition={condition.parts[0]} />
      <em>and</em>
      <ConditionChip condition={condition.parts[1]} />
    </span>
  );
}

function HeadingBlock({ block, state, nested = false }) {
  return (
    <div className={`bird-heading-block bird-exec ${nested ? "is-nested" : ""} ${blockStatus(block.id, state)}`}>
      <span>heading</span><strong>{block.angle}°</strong>
    </div>
  );
}

function IfBlock({ block, state }) {
  return (
    <div className={`bird-if-block bird-exec ${blockStatus(block.id, state)}`}>
      {block.branches.map((item, index) => (
        <div className="bird-branch" key={`${item.label}-${index}`}>
          <div className="bird-branch__condition"><b>{item.label}</b><ConditionChip condition={item.condition} /></div>
          <div className="bird-branch__action"><span>{item.label === "else" ? "" : "do"}</span>{item.children.map((child) => <HeadingBlock block={child} state={state} nested key={child.id} />)}</div>
        </div>
      ))}
    </div>
  );
}

export function BirdProgram({ program, state }) {
  return (
    <div className="bird-program-stack">
      {program.map((block) => block.kind === "heading"
        ? <HeadingBlock block={block} state={state} key={block.id} />
        : <IfBlock block={block} state={state} key={block.id} />)}
    </div>
  );
}
