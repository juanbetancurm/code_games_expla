import { simulations } from "../data/simulations.jsx";
import { birdSimulations } from "../data/birdSimulations.jsx";
import { turtleSimulations } from "../data/turtleSimulations.jsx";

function MazeIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 31 H21 V13 H31" fill="none" stroke="#ffe600" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="31" r="4.6" fill="#fff" stroke="#6b3a78" strokeWidth="1.5" />
      <path d="M31 4 C27.8 4 25.6 6.5 25.6 9.4 C25.6 13.3 31 18 31 18 C31 18 36.4 13.3 36.4 9.4 C36.4 6.5 34.2 4 31 4 Z" fill="#ef4f43" stroke="#fff" strokeWidth="1.6" />
    </svg>
  );
}

function BirdIcon() {
  return (
    <svg viewBox="-60 -60 120 120" aria-hidden="true">
      <g transform="rotate(-40)" fill="#fff" stroke="#3f6186" strokeWidth="3">
        <path d="M-30 0 L-47 -11 L-41 0 L-47 11 Z" />
        <path d="M-12 -8 C-8 -34 8 -47 24 -45 C14 -31 10 -18 10 -8 Z" />
        <path d="M-12 8 C-8 34 8 47 24 45 C14 31 10 18 10 8 Z" />
        <ellipse cx="-4" cy="0" rx="27" ry="12" />
        <circle cx="23" cy="0" r="10" />
        <path d="M31 -4.5 L43 0 L31 4.5 Z" fill="#ffc21f" />
      </g>
    </svg>
  );
}

function TurtleIcon() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <path d="M12 30 L12 10 L29.3 20 Z" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <circle cx="12" cy="30" r="5.5" fill="#2f6b34" stroke="#fff" strokeWidth="2.5" />
      <path d="M9 22.5 L12 18 L15 22.5 Z" fill="#fff" />
    </svg>
  );
}

const lessons = [
  { id: "maze", number: "01", title: "Maze", description: "Sequences, turns, decisions, and loops", accent: "purple", Icon: MazeIcon, count: simulations.length },
  { id: "bird", number: "02", title: "Bird", description: "Headings, conditions, coordinates, and logic", accent: "blue", Icon: BirdIcon, count: birdSimulations.length },
  { id: "turtle", number: "03", title: "Turtle", description: "Drawing, repetition, and geometry", accent: "green", Icon: TurtleIcon, count: turtleSimulations.length },
];

export function LandingPage({ navigate }) {
  return (
    <main className="landing-page">
      <div className="landing-orb landing-orb--one" /><div className="landing-orb landing-orb--two" />
      <header className="landing-heading">
        <p>BLOCKLY GAMES · CLASSROOM EXPLAINER</p>
        <h1>Learn how<br />the blocks think.</h1>
        <span>Choose an explanation to begin.</span>
      </header>
      <section className="lesson-picker" aria-label="Choose an explanation">
        {lessons.map(({ Icon, ...lesson }) => (
          <button className={`lesson-choice lesson-choice--${lesson.accent}`} key={lesson.id} type="button" onClick={() => navigate(lesson.id)}>
            <span className="lesson-choice__number">{lesson.number}</span>
            <span className="lesson-choice__icon"><Icon /></span>
            <span className="lesson-choice__content"><strong>{lesson.title}</strong><small>{lesson.description}</small></span>
            <span className="lesson-choice__status">{lesson.count} simulations</span>
            <span className="lesson-choice__arrow" aria-hidden="true">→</span>
          </button>
        ))}
      </section>
      <footer className="landing-footer">CLEAR · ORDERED · EFFECTIVE</footer>
    </main>
  );
}
