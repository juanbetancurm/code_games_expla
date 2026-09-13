import { blockIds } from "../simulation/blockCount";
import { GoalPin } from "./MazeIcons";

function statusClasses(blockId, state, notRun) {
  return [
    state.activeBlock === blockId ? "is-active" : "",
    state.completedBlocks.includes(blockId) ? "is-done" : "",
    state.skippedBlocks.includes(blockId) ? "is-skipped" : "",
    state.failedBlocks?.includes(blockId) ? "is-failed" : "",
    notRun?.has(blockId) ? "is-not-run" : "",
  ].filter(Boolean).join(" ");
}

// The notch shape is clipped on .command-block, so the status badge and the
// highlight glow live on unclipped wrappers around it.
function CommandBlock({ block, state, notRun, nested = false, number }) {
  return (
    <div className={`exec-block command-exec ${nested ? "command-exec--nested" : ""} ${statusClasses(block.id, state, notRun)}`}>
      <span className="exec-dot">{number}</span>
      <div className="command-shape">
        <div className="block command-block purple">
          <span className="block-icon">{block.icon}</span>
          {block.label}
          {block.option && <span className="dropdown-chip">{block.option} {block.icon}</span>}
        </div>
      </div>
    </div>
  );
}

export function BlocklyBlock({ block, state, notRun, number }) {
  if (block.kind === "command") return <CommandBlock block={block} state={state} notRun={notRun} number={number} />;
  const isIf = block.kind === "if";
  return (
    <div className={`control-block ${isIf ? "blue" : "green"} exec-block ${statusClasses(block.id, state, notRun)}`}>
      <span className="exec-dot">{number}</span>
      <div className="control-title">
        {isIf ? "if path" : "repeat until"}
        {isIf
          ? <span className="dropdown-chip">{block.condition} ↶</span>
          : <span className="goal-chip" title="the goal"><GoalPin /></span>}
      </div>
      <div className="control-mouth">
        <span className="control-do">do</span>
        <div className="control-slot">
          {block.children.map((child) => <CommandBlock key={child.id} block={child} state={state} notRun={notRun} nested />)}
        </div>
      </div>
      <div className="control-foot" />
    </div>
  );
}

// Blocks a stopped program never reached (for example after a bump).
function notRunBlocks(program, state) {
  const reached = new Set([...state.completedBlocks, ...state.skippedBlocks, ...(state.failedBlocks ?? [])]);
  return new Set(blockIds(program).filter((id) => !reached.has(id)));
}

export function BlockStack({ program, state, stopped = false }) {
  const notRun = stopped ? notRunBlocks(program, state) : undefined;
  return (
    <div className="block-stack control-stack">
      {program.map((block, index) => <BlocklyBlock key={block.id} block={block} state={state} notRun={notRun} number={index + 1} />)}
    </div>
  );
}
