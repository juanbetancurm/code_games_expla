import { ProgressRail } from "../components/ProgressRail";
import { SimulationSection } from "../components/SimulationSection";
import { simulations } from "../data/simulations.jsx";
import "../maze.css";

const railItems = simulations.map((simulation) => ({ id: `sim-${simulation.id}`, label: simulation.id, title: `${simulation.id}. ${simulation.title}` }));

export function MazeLesson({ navigate }) {
  return (
    <main className="maze-lesson">
      <button className="site-mark site-mark--button" type="button" onClick={() => navigate("")}>
        <span className="site-mark__blocks" aria-hidden="true"><i /><i /><i /></span>
        <span>Maze explanation</span><b>← Home</b>
      </button>
      <ProgressRail items={railItems} label="Jump to a simulation" />
      {simulations.map((simulation) => <SimulationSection simulation={simulation} key={simulation.id} />)}
    </main>
  );
}
