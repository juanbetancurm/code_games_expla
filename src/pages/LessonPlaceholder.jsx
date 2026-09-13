const details = {
  bird: { title: "Bird", label: "CONDITIONS · DIRECTIONS · COORDINATES", color: "blue", symbol: "⌁", url: "https://blockly.games/bird?lang=en" },
  turtle: { title: "Turtle", label: "DRAWING · LOOPS · GEOMETRY", color: "green", symbol: "○", url: "https://blockly.games/turtle?lang=en" },
};

export function LessonPlaceholder({ lesson, navigate }) {
  const item = details[lesson];
  return (
    <main className={`placeholder-page placeholder-page--${item.color}`}>
      <button className="back-home" type="button" onClick={() => navigate("")}>← All explanations</button>
      <section className="placeholder-card">
        <span className="placeholder-symbol">{item.symbol}</span>
        <p>{item.label}</p>
        <h1>{item.title}</h1>
        <strong>Lesson framework ready.</strong>
        <span>The simulation sequence will be added when its teaching requirements are defined.</span>
        <a href={item.url} target="_blank" rel="noreferrer">Open the original Blockly game ↗</a>
      </section>
    </main>
  );
}
