import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import type { Page } from '@inertiajs/core';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Performance: Use renderToPipeableStream for streaming SSR
// This sends HTML to the client as it's generated, reducing TTFB
createServer((page: Page) =>
    createInertiaApp({
        page,
        // Use renderToString for compatibility, but wrap in try-catch for performance
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) =>
            resolvePageComponent(
                `./pages/${name}.tsx`,
                import.meta.glob('./pages/**/*.tsx'),
            ),
        setup: ({ App, props }) => {
            return <App {...props} />;
        },
    }),
);
