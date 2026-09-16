import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Suppress cross-origin development-mode noise
    if (
      error &&
      typeof error.message === "string" &&
      (error.message.includes("$$typeof") ||
        error.message.includes("cross-origin frame") ||
        error.message.includes("Should not already be working"))
    ) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (
      error &&
      typeof error.message === "string" &&
      (error.message.includes("$$typeof") ||
        error.message.includes("cross-origin frame") ||
        error.message.includes("Should not already be working"))
    ) {
      return;
    }
    console.warn("Caught in ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-8 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">Campus Resale & Exchange</h2>
            <p className="text-xs text-slate-300">
              The application encountered a temporary display issue.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
