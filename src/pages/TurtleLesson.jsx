import { TurtleSimulationSection } from "../components/TurtleSimulationSection";
import { DirectionCompass } from "../components/DirectionCompass";
import { ProgressRail } from "../components/ProgressRail";
import { turtleSimulations } from "../data/turtleSimulations";
import "../turtle.css";

const railItems = turtleSimulations.map((simulation) => ({ id: `turtle-sim-${simulation.id}`, label: simulation.id, title: `${simulation.id}. ${simulation.title}` }));

export function TurtleLesson({ navigate }) {
  return (
    <main className="turtle-lesson">
      <button className="site-mark site-mark--button" type="button" onClick={() => navigate("")}>
        <span className="site-mark__blocks turtle-site-blocks" aria-hidden="true"><i /><i /><i /></span>
        <span>Turtle explanation</span><b>← Home</b>
      </button>
      <DirectionCompass />
      <ProgressRail items={railItems} label="Jump to a Turtle simulation" className="turtle-progress" />
      {turtleSimulations.map((simulation) => <TurtleSimulationSection simulation={simulation} key={simulation.id} />)}
    </main>
  );
}
