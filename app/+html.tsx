import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Web-only document shell. `viewport-fit=cover` lets the app draw under the
 * phone's status bar and browser toolbar instead of leaving bare strips; the
 * background here is only a first-paint fallback, the root layout then keeps
 * it in sync with the active theme.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#f6f5f2" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: background }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const background = `
html, body { background-color: #f6f5f2; }
@media (prefers-color-scheme: dark) {
  html, body { background-color: #121316; }
}`;
