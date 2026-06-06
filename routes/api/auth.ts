import { Handlers } from "fresh/server.ts";
import {
  authenticateUser,
  registerUser,
  createSession,
  getSessionUser,
} from "../../lib/auth.ts";

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    try {
      if (action === "login") {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "Email and password required" }),
            { status: 400 }
          );
        }

        const user = await authenticateUser(email, password);
        if (!user) {
          return new Response(
            JSON.stringify({ error: "Invalid credentials" }),
            { status: 401 }
          );
        }

        const sessionId = createSession(user.id);

        return new Response(
          JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": `session=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${
                7 * 24 * 60 * 60
              }`,
            },
          }
        );
      }

      if (action === "register") {
        const body = await req.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
          return new Response(
            JSON.stringify({ error: "All fields required" }),
            { status: 400 }
          );
        }

        if (password.length < 8) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 8 characters" }),
            { status: 400 }
          );
        }

        const user = await registerUser(email, password, name);
        const sessionId = createSession(user.id);

        return new Response(
          JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
              "Set-Cookie": `session=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${
                7 * 24 * 60 * 60
              }`,
            },
          }
        );
      }

      if (action === "me") {
        const user = await getSessionUser(req);
        if (!user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
          });
        }

        return new Response(
          JSON.stringify({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
            },
          }),
          { headers: { "Content-Type": "application/json" } }
        );
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Request failed",
        }),
        { status: 400 }
      );
    }
  },
};
