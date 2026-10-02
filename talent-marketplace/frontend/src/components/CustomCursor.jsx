import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Touch/tablet devices have no real mouse to follow — on those, mobile
// Safari/Chrome still fire a single synthetic mousemove per tap, which was
// leaving this cursor's dot and ring frozen at the last tapped coordinate
// instead of tracking anything. (hover: none) / (pointer: coarse) is the
// standard way to detect "no real pointer device", regardless of viewport
// width — a touch laptop with a wide screen should skip this too.
const hasNoRealPointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(hover: none), (pointer: coarse)').matches;

const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [enabled, setEnabled] = useState(() => !hasNoRealPointer());

  useEffect(() => {
    const mql = window.matchMedia?.('(hover: none), (pointer: coarse)');
    if (!mql) return;
    const handleChange = () => setEnabled(!hasNoRealPointer());
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (
        e.target.tagName.toLowerCase() === 'button' ||
        e.target.tagName.toLowerCase() === 'a' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.classList.contains('cursor-pointer')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  const variants = {
    default: {
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      height: 20,
      width: 20,
      backgroundColor: 'rgba(212, 175, 55, 0.5)', // Gold with opacity
      border: '1px solid rgba(212, 175, 55, 1)',
      transition: { type: 'spring', mass: 0.1, stiffness: 400, damping: 20 },
    },
    hover: {
      x: mousePosition.x - 30,
      y: mousePosition.y - 30,
      height: 60,
      width: 60,
      backgroundColor: 'rgba(212, 175, 55, 0.1)',
      border: '1px solid rgba(212, 175, 55, 0.5)',
      transition: { type: 'spring', mass: 0.2, stiffness: 300, damping: 20 },
    },
  };

  return (
    <>
      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 bg-yellow-500 rounded-full pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 4,
          y: mousePosition.y - 4,
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0 }}
      />
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[9998]"
        variants={variants}
        animate={isHovering ? 'hover' : 'default'}
      />
    </>
  );
};

export default CustomCursor;
