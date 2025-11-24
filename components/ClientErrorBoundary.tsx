'use client';

import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
}

export function ClientErrorBoundary({ children }: ClientErrorBoundaryProps) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

