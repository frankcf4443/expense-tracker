import { defineRoute } from "$fresh/server.ts";
import { deleteSession } from "../lib/auth.ts";

export const handler = {
  async GET(req) {
    const cookieHeader = req.headers.get("Cookie");
    if (cookieHeader) {
      const cookies = cookieHeader.split(";").map(c => c.trim());
      const sessionCookie = cookies.find(c => c.startsWith("session="));

      if (sessionCookie) {
        const sessionId = sessionCookie.split("=")[1];
        deleteSession(sessionId);
      }
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: "/login",
        "Set-Cookie": "session=; Max-Age=0",
      },
    });
  },
};
