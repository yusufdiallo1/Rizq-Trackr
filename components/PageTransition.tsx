'use client';

import { ReactNode, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPageVariants, getReducedMotionVariants } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back';
}

export function PageTransition({ children, direction = 'forward' }: PageTransitionProps) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Mark first load as complete after a brief delay
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Prevent hydration mismatch by rendering static content on first render
  if (!mounted) {
    return <>{children}</>;
  }

  // On first load, show content immediately without animation
  if (isFirstLoad) {
    return <div style={{ minHeight: '100vh', width: '100%', opacity: 1 }}>{children}</div>;
  }

  const variants = prefersReducedMotion
    ? getReducedMotionVariants(getPageVariants(direction), true)
    : getPageVariants(direction);

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ minHeight: '100vh', width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}


