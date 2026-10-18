import { Component, type ErrorInfo, type ReactNode } from "react";
import { StateMessage } from "./StateMessage";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Catches errors thrown while rendering a page, so one broken component shows
// a message instead of a white screen. Error boundaries must be class
// components; there is no hook for this in React.
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Visible in the browser console while developing. A real system would
    // send this to an error tracking service.
    console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <StateMessage
          title="Something went wrong"
          text="An unexpected error occurred on this page. Reload the page, or choose another page in the menu."
          onRetry={() => window.location.reload()}
        />
      );
    }
    return this.props.children;
  }
}
