import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });
        console.error(
            'React Error Boundary caught an error:',
            error,
            errorInfo,
        );
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                                <svg
                                    className="h-6 w-6 text-red-600 dark:text-red-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Something went wrong
                            </h1>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h2 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Error Message
                                </h2>
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/30">
                                    <code className="text-sm break-all text-red-800 dark:text-red-300">
                                        {this.state.error?.message ||
                                            'Unknown error'}
                                    </code>
                                </div>
                            </div>

                            {this.state.error?.stack && (
                                <div>
                                    <h2 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Stack Trace
                                    </h2>
                                    <div className="max-h-64 overflow-auto rounded-md border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-900">
                                        <pre className="text-xs break-all whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                            {this.state.error.stack}
                                        </pre>
                                    </div>
                                </div>
                            )}

                            {this.state.errorInfo?.componentStack && (
                                <div>
                                    <h2 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Component Stack
                                    </h2>
                                    <div className="max-h-48 overflow-auto rounded-md border border-gray-200 bg-gray-100 p-3 dark:border-gray-700 dark:bg-gray-900">
                                        <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                            {
                                                this.state.errorInfo
                                                    .componentStack
                                            }
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => window.history.back()}
                                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
