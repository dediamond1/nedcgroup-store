import type { LoaderFunction } from "@remix-run/node"
import { json } from "@remix-run/node"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get("url")

  if (!targetUrl) {
    return json({ error: "No target URL provided" }, { status: 400 })
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Origin: "https://1314.3cx.cloud",
        Referer: "https://1314.3cx.cloud/",
      },
    })

    const data = await response.text()

    return new Response(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept",
        "Content-Type": response.headers.get("Content-Type") || "application/json",
      },
    })
  } catch (error) {
    console.error("Proxy error:", error)
    return json({ error: "Failed to fetch data from 3CX server" }, { status: 500 })
  }
}

export const action = loader // Handle POST requests the same way as GET

