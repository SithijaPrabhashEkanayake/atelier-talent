import React, { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * ScrollProgress — Sticky gold gradient progress bar showing scroll depth.
 * Sticks to the very top of the viewport below the Navbar.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      setVisible(v > 0.01 && v < 0.99);
    });
    return unsub;
  }, [scrollYProgress]);

  if (!visible) return null;

  return (
    <motion.div
      className="fixed top-[80px] left-0 right-0 z-40 h-[3px] origin-left"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, #d4af37 0%, #f5e7ba 50%, #d4af37 100%)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );
}
