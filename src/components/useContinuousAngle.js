import { useEffect, useState } from "react";

// Returns an unwrapped angle that always moves the short way round, so a CSS
// rotation from 270° to 0° turns 90° instead of spinning 270° backwards.
export function useContinuousAngle(target) {
  const [angle, setAngle] = useState(target);
  useEffect(() => {
    setAngle((current) => current + ((((target - current) % 360) + 540) % 360) - 180);
  }, [target]);
  return angle;
}
