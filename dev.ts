#!/usr/bin/env -S deno run -A --unstable-kv

import { gen } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

await gen(manifest);
