/**
 * @file ErrorBoundary.tsx
 * @description Clinical-Grade Fault-Tolerant React Error Boundary for SmartCare.
 * 
 * Prevents unhandled exceptions, corrupted sensor telemetry renders, or null-pointer
 * exceptions in sub-components from cascading and crashing the entire patient monitoring
 * application.
 * 
 * Features:
 * - Multi-tier isolation ('root', 'section', 'widget')
 * - Graceful fallback UI with contextual recovery actions
 * - Detailed error diagnostic stack viewer for developers and clinical reviewers
 * - State reset and retry handler
 * 
 * @license Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, ChevronDown, ChevronUp, Terminal, ShieldAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  level?: 'root' | 'section' | 'widget';
  componentName?: string;
  onReset?: () => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorTimestamp: string | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorTimestamp: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
      errorTimestamp: new Date().toLocaleTimeString(),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Clinical logging: Record error diagnostics
    console.error(
      `[SmartCare ErrorBoundary] Caught exception in ${this.props.componentName || 'Component'}:`,
      error,
      errorInfo
    );
    this.setState({ errorInfo });
  }

  public handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorTimestamp: null,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render(): ReactNode {
    const { hasError, error, errorInfo, errorTimestamp, showDetails } = this.state;
    const { children, level = 'section', componentName = 'Component', fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return fallback;
    }

    // Widget-Level Fallback (Compact card inside dashboard grid)
    if (level === 'widget') {
      return (
        <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full min-h-[180px]">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-600 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-900">
                {componentName} Interrupted
              </h4>
              <p className="text-xs text-rose-700 mt-1 line-clamp-2">
                {error?.message || 'A data parsing error occurred in this monitoring widget.'}
              </p>
              <span className="text-[10px] font-mono text-rose-500 mt-1 block">
                Isolated at {errorTimestamp}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-rose-200/60 flex items-center justify-between">
            <button
              onClick={this.toggleDetails}
              className="text-[11px] font-medium text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer"
            >
              {showDetails ? 'Hide Stack' : 'View Stack'}
            </button>
            <button
              onClick={this.handleReset}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reload Widget
            </button>
          </div>

          {showDetails && (
            <div className="mt-3 p-2 bg-slate-900 text-slate-100 rounded-lg text-[10px] font-mono overflow-x-auto max-h-32">
              <p className="text-rose-400 font-semibold">{error?.name}: {error?.message}</p>
              <pre className="text-slate-400 mt-1 whitespace-pre-wrap">{errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>
      );
    }

    // Section-Level Fallback (Replaces one section while preserving header/navigation/alerts)
    return (
      <div className="max-w-4xl mx-auto my-8 p-6 sm:p-8 bg-white border border-rose-200 rounded-3xl shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-rose-100">
          <div className="p-3 bg-rose-100 rounded-2xl text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                Fault Tolerance Intercept
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {errorTimestamp}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              Error Boundary Contained: {componentName}
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              An unhandled rendering exception occurred inside this view. The SmartCare Error Boundary isolated the failure to prevent total dashboard disruption.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold mb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <span>Diagnostics: {error?.name || 'Error'}</span>
            </div>
            <button
              onClick={this.toggleDetails}
              className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
            >
              {showDetails ? (
                <>Hide Trace <ChevronUp className="w-3.5 h-3.5" /></>
              ) : (
                <>Show Trace <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          <p className="text-xs font-mono text-rose-600 bg-white p-2.5 rounded-lg border border-rose-100 break-all">
            {error?.message || 'Unknown runtime exception caught.'}
          </p>

          {showDetails && (
            <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto max-h-48">
              <p className="text-rose-400 font-semibold">{error?.stack}</p>
              <pre className="text-slate-400 mt-2 whitespace-pre-wrap">{errorInfo?.componentStack}</pre>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            Hard Reload Application
          </button>
          <button
            onClick={this.handleReset}
            className="px-5 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reset & Recover Section
          </button>
        </div>
      </div>
    );
  }
}
