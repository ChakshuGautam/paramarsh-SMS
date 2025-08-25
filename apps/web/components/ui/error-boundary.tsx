"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  level?: 'page' | 'section' | 'component';
  showDetails?: boolean;
  resource?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCount: number;
  showDetails: boolean;
}

/**
 * ErrorBoundary - Comprehensive error handling wrapper
 * 
 * Features:
 * - Catches JavaScript errors in child components
 * - Provides fallback UI
 * - Error reporting
 * - Recovery actions
 * - Development vs production modes
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Report to monitoring service (e.g., Sentry, LogRocket)
    // this.reportErrorToService(error, errorInfo);
    
    this.setState({
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;
    
    if (hasError) {
      if (resetOnPropsChange && prevProps.children !== this.props.children) {
        this.resetErrorBoundary();
      }
      
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, idx) => key !== prevProps.resetKeys?.[idx]
        );
        if (hasResetKeyChanged) {
          this.resetErrorBoundary();
        }
      }
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false,
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, errorCount, showDetails } = this.state;
    const { children, fallback, level = 'component', resource } = this.props;
    
    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return <>{fallback}</>;
      }
      
      // Default error UI based on level
      return (
        <ErrorFallback
          error={error}
          errorInfo={errorInfo}
          level={level}
          resource={resource}
          errorCount={errorCount}
          showDetails={showDetails}
          onReset={this.resetErrorBoundary}
          onToggleDetails={this.toggleDetails}
        />
      );
    }
    
    return children;
  }
}

/**
 * ErrorFallback - Default error UI component
 */
const ErrorFallback: React.FC<{
  error: Error;
  errorInfo?: ErrorInfo;
  level: 'page' | 'section' | 'component';
  resource?: string;
  errorCount: number;
  showDetails: boolean;
  onReset: () => void;
  onToggleDetails: () => void;
}> = ({ error, errorInfo, level, resource, errorCount, showDetails, onReset, onToggleDetails }) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Different UI based on error level
  if (level === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Page Error</CardTitle>
            </div>
            <CardDescription>
              Something went wrong while loading this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Error Details</AlertTitle>
              <AlertDescription className="mt-2">
                {error.message || 'An unexpected error occurred'}
              </AlertDescription>
            </Alert>
            
            {isDevelopment && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleDetails}
                  className="w-full"
                >
                  {showDetails ? <ChevronUp /> : <ChevronDown />}
                  {showDetails ? 'Hide' : 'Show'} Technical Details
                </Button>
                
                {showDetails && errorInfo && (
                  <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto max-h-64">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button onClick={onReset} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </div>
            
            {errorCount > 2 && (
              <Alert>
                <AlertDescription>
                  This error has occurred {errorCount} times. 
                  Please contact support if the issue persists.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (level === 'section') {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Section Error</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>{error.message || 'Failed to load this section'}</p>
          <Button size="sm" variant="outline" onClick={onReset}>
            <RefreshCw className="mr-2 h-3 w-3" />
            Reload Section
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  // Component level error (inline)
  return (
    <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium">
            {resource ? `Error loading ${resource}` : 'Component Error'}
          </p>
          <p className="text-xs text-muted-foreground">
            {error.message}
          </p>
          <Button size="sm" variant="ghost" onClick={onReset}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * withErrorBoundary - HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * ResourceErrorBoundary - Specialized error boundary for resources
 */
export const ResourceErrorBoundary: React.FC<{
  resource: string;
  children: ReactNode;
}> = ({ resource, children }) => {
  return (
    <ErrorBoundary
      level="section"
      resource={resource}
      onError={(error) => {
        console.error(`Error in ${resource} resource:`, error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * ListErrorBoundary - Error boundary for list views
 */
export const ListErrorBoundary: React.FC<{
  resource: string;
  children: ReactNode;
}> = ({ resource, children }) => {
  return (
    <ErrorBoundary
      level="section"
      resource={`${resource} list`}
      fallback={
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Unable to load {resource}</AlertTitle>
          <AlertDescription>
            There was a problem loading the {resource} list. 
            Please try refreshing the page or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      }
    >
      {children}
    </ErrorBoundary>
  );
};

/**
 * FormErrorBoundary - Error boundary for forms
 */
export const FormErrorBoundary: React.FC<{
  resource: string;
  children: ReactNode;
}> = ({ resource, children }) => {
  return (
    <ErrorBoundary
      level="component"
      resource={`${resource} form`}
      resetOnPropsChange
    >
      {children}
    </ErrorBoundary>
  );
};

// Export default error boundary and utilities
export default ErrorBoundary;