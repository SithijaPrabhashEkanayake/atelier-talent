import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticButton — Cursor-attract micro-interaction wrapper.
 * The element subtly follows the mouse pointer when hovering,
 * creating a "magnetic pull" feel inspired by haute couture boutique sites.
 *
 * Props:
 *   children  — button/link content
 *   strength  — magnetic pull intensity 0-1 (default: 0.35)
 *   className — wrapper classes
 */
export default function MagneticButton({
  children,
  strength = 0.35,
  className = '',
  as: Component = 'button',
  ...rest
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    setPos({ x: dx, y: dy });
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 250, damping: 18, mass: 0.5 }}
      className={`inline-block ${className}`}
    >
      <Component {...rest}>{children}</Component>
    </motion.div>
  );
}
