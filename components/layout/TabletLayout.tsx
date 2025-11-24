'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { getPageVariants, getCardVariants, staggerContainerVariants } from '@/lib/animations';
import { useReducedMotion } from 'framer-motion';

/**
 * Tablet-optimized page wrapper with animations
 */
interface TabletPageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function TabletPageWrapper({ children, className = '' }: TabletPageWrapperProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion 
    ? { initial: {}, animate: {}, exit: {} }
    : getPageVariants('forward');

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`tablet-container ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Tablet-optimized section with stagger animations
 */
interface TabletSectionProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export function TabletSection({ children, className = '', stagger = false }: TabletSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerVariants = prefersReducedMotion || !stagger
    ? { hidden: {}, visible: {} }
    : staggerContainerVariants;

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`tablet-section ${className}`}
    >
      {children}
    </motion.section>
  );
}

/**
 * Animated card wrapper for tablet
 */
interface TabletCardProps {
  children: ReactNode;
  index?: number;
  className?: string;
}

export function TabletCard({ children, index = 0, className = '' }: TabletCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const variants = prefersReducedMotion
    ? { hidden: {}, visible: {} }
    : getCardVariants(index);

  return (
    <motion.div
      variants={variants}
      initial="hidden"
      animate="visible"
      className={`tablet-card ${className}`}
    >
      {children}
    </motion.div>
  );
}

