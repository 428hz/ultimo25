export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root, #__next { height: 100%; }
              body { margin: 0; background: #000; color-scheme: dark; overflow-y: auto; }
              * { overscroll-behavior: contain; }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}