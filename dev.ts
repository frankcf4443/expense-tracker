#!/usr/bin/env -S deno run -A --unstable-kv

import "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import { fresh } from "$fresh/server.ts";

await fresh(manifest, {
  onBeforeStart: () => {
    console.log("Fresh app built successfully");
  },
});
