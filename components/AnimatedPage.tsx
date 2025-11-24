'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getPageVariants, getReducedMotionVariants } from '@/lib/animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  direction?: 'forward' | 'back';
}

export function AnimatedPage({ children, direction = 'forward' }: AnimatedPageProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setDisplayChildren(children);
  }, [children]);

  const variants = prefersReducedMotion
    ? getReducedMotionVariants(getPageVariants(direction), true)
    : getPageVariants(direction);

  return (
    <motion.div
      key={pathname}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', minHeight: '100%' }}
    >
      {displayChildren}
    </motion.div>
  );
}

