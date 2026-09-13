import { BirdSimulationSection } from "../components/BirdSimulationSection";
import { DirectionCompass } from "../components/DirectionCompass";
import { ProgressRail } from "../components/ProgressRail";
import { birdSimulations } from "../data/birdSimulations.jsx";
import "../bird.css";

const railItems = birdSimulations.map((simulation) => ({ id: `bird-sim-${simulation.id}`, label: simulation.id, title: `${simulation.id}. ${simulation.title}` }));

export function BirdLesson({ navigate }) {
  return (
    <main className="bird-lesson">
      <button className="site-mark site-mark--button" type="button" onClick={() => navigate("")}>
        <span className="site-mark__blocks bird-site-blocks" aria-hidden="true"><i /><i /><i /></span>
        <span>Bird explanation</span><b>← Home</b>
      </button>
      <DirectionCompass />
      <ProgressRail items={railItems} label="Jump to a Bird simulation" className="bird-progress" />
      {birdSimulations.map((simulation) => <BirdSimulationSection simulation={simulation} key={simulation.id} />)}
    </main>
  );
}
