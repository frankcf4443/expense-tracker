import { Head } from "fresh/src/runtime/head.ts";

export default function App(props: { url: string; }) {
  return (
    <html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Track your daily expenses easily" />
        <title>Expense Tracker</title>
        <link rel="stylesheet" href="/styles/main.css" />
      </Head>
      <body>
        <div id="app">
          <props.Component />
        </div>
      </body>
    </html>
  );
}
