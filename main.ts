import "preact";
import { start } from "fresh/server.ts";
import manifest from "./fresh.gen.ts";

await start(manifest, {
  onListen: ({ port, hostname }) => {
    console.log(`\n🦕 Expense Tracker running on http://${hostname}:${port}\n`);
  },
});
