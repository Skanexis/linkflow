import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.warn("Application error", error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0b100f] px-6" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
        <div className="max-w-md text-center">
          <h1 className="text-white mb-3" style={{ fontSize: "24px", fontWeight: 700 }}>
            Something went wrong
          </h1>
          <p className="text-white/50 mb-6" style={{ fontSize: "14px", lineHeight: 1.6 }}>
            Refresh the page and try again. If this keeps happening, check the production error logs.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl px-5 py-3 text-white"
            style={{ background: "linear-gradient(135deg, #25d0b2, #f5b84b)", color: "#07100e", fontSize: "14px", fontWeight: 800 }}
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}
