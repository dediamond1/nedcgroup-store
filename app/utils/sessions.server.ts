import { createCookieSessionStorage } from "@remix-run/node";

const sessionSecret = "hascnaskckjasncknajscnaaslkams"; // Store this securely!

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "nedcsession", // Customize the session cookie name
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent over HTTPS
    secrets: [sessionSecret],
    sameSite: "lax",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
