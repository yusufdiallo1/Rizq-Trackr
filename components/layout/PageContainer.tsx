import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
}

export function PageContainer({ children, maxWidth = 'xl', className = '' }: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${maxWidthClasses[maxWidth]} mx-auto px-4 tablet:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Section component for consistent spacing
 */
interface SectionProps {
  children: ReactNode;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

export function Section({ children, className = '', spacing = 'normal' }: SectionProps) {
  const spacingClasses = {
    tight: 'py-4 tablet:py-6',
    normal: 'py-6 tablet:py-8',
    loose: 'py-8 tablet:py-12',
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {children}
    </section>
  );
}

/**
 * Grid component for responsive layouts
 */
interface GridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Grid({ children, cols = 2, gap = 'md', className = '' }: GridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 tablet:grid-cols-2',
    3: 'grid-cols-1 tablet:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 tablet:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-3 tablet:gap-4',
    md: 'gap-4 tablet:gap-6',
    lg: 'gap-6 tablet:gap-8',
  };

  return (
    <div className={`grid ${gridCols[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
}
