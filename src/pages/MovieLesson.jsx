import { MovieSimulationSection } from "../components/MovieSimulationSection";
import { ProgressRail } from "../components/ProgressRail";
import { movieSimulations } from "../data/movieSimulations.jsx";
import "../movie.css";

const railItems = movieSimulations.map((simulation) => ({ id: `movie-sim-${simulation.id}`, label: simulation.id, title: `${simulation.id}. ${simulation.title}` }));

export function MovieLesson({ navigate }) {
  return (
    <main className="movie-lesson">
      <button className="site-mark site-mark--button" type="button" onClick={() => navigate("")}>
        <span className="site-mark__blocks movie-site-blocks" aria-hidden="true"><i /><i /><i /></span>
        <span>Movie explanation</span><b>← Home</b>
      </button>
      <ProgressRail items={railItems} label="Jump to a Movie simulation" className="movie-progress" />
      {movieSimulations.map((simulation) => <MovieSimulationSection simulation={simulation} key={simulation.id} />)}
    </main>
  );
}
