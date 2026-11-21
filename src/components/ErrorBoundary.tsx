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
        <div className="min-h-screen bg-[#F7F9F8] dark:bg-[#0D1110] text-[#18201C] dark:text-[#ECF2EF] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] rounded-2xl p-8 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-[#18201C] dark:text-[#ECF2EF]">
              Campus Resale &amp; Exchange
            </h2>
            <p className="text-xs text-[#5C6B63] dark:text-[#8FA199]">
              The application encountered a temporary display issue.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white font-semibold text-xs cursor-pointer"
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
