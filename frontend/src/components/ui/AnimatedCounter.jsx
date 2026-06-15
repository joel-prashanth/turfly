import { useEffect, useRef, useState } from "react";

function AnimatedCounter({
  end = 0,
  duration = 1200,
  prefix = "",
  suffix = "",
}) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    const target = Number(end);

    if (!Number.isFinite(target)) {
      setCount(0);
      return;
    }

    let startTime = null;

    const animate = (timestamp) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min((timestamp - startTime) / duration, 1);

      setCount(Math.floor(progress * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [end, duration]);



  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default AnimatedCounter;
