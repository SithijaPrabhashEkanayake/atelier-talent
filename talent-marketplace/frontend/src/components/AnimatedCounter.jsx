import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * AnimatedCounter — Scroll-triggered animated number counter.
 * Uses requestAnimationFrame for buttery-smooth 60fps count-up.
 *
 * Props:
 *   end       — target number to count to (default: 100)
 *   duration  — animation duration in ms (default: 2000)
 *   prefix    — string before the number (default: '')
 *   suffix    — string after the number (default: '')
 *   decimals  — decimal places (default: 0)
 *   className — extra CSS classes
 */
export default function AnimatedCounter({
  end = 100,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!isInView) return;

    let startTs = null;
    let raf;

    const step = (ts) => {
      if (!startTs) startTs = ts;
      const elapsed = ts - startTs;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a decelerating feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;

      setDisplay(current.toFixed(decimals));

      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplay(end.toFixed(decimals));
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration, decimals]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}
