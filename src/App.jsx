import { useEffect, useState } from "react";
import { LandingPage } from "./pages/LandingPage";
import { MazeLesson } from "./pages/MazeLesson";
import { BirdLesson } from "./pages/BirdLesson";
import { TurtleLesson } from "./pages/TurtleLesson";
import { MovieLesson } from "./pages/MovieLesson";

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, "").split("/")[0];
  return ["maze", "bird", "turtle", "movie"].includes(route) ? route : "";
}

export default function App() {
  const [route, setRoute] = useState(readRoute);
  useEffect(() => {
    const update = () => setRoute(readRoute());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  const navigate = (nextRoute) => {
    window.location.hash = nextRoute ? `/${nextRoute}` : "/";
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  if (route === "maze") return <MazeLesson navigate={navigate} />;
  if (route === "bird") return <BirdLesson navigate={navigate} />;
  if (route === "turtle") return <TurtleLesson navigate={navigate} />;
  if (route === "movie") return <MovieLesson navigate={navigate} />;
  return <LandingPage navigate={navigate} />;
}
