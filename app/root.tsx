"use client";

import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import { useEffect, useState } from "react";

import "./tailwind.css";
import { getUserToken } from "./utils/auth.server";
import Layout from "./components/Layout";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const loader: LoaderFunction = async ({ request }) => {
  return json({
    user: await getUserToken(request),
  });
};

// function Chat() {
//   useEffect(() => {
//     const script = document.createElement("script");
//     script.src =
//       "https://downloads-global.3cx.com/downloads/livechatandtalk/v1/callus.js";
//     script.defer = true;
//     script.id = "tcx-callus-js";
//     script.charset = "utf-8";

//     // Override the default fetch behavior to use our proxy
//     script.onload = () => {
//       (window as any).tcx_callus_fetch = (
//         url: string,
//         options: RequestInit
//       ) => {
//         const proxyUrl = `/api/3cx-proxy?url=${encodeURIComponent(url)}`;
//         return fetch(proxyUrl, {
//           ...options,
//           headers: {
//             ...options.headers,
//             "X-Requested-With": "XMLHttpRequest",
//           },
//         });
//       };
//     };

//     document.body.appendChild(script);

//     return () => {
//       if (document.body.contains(script)) {
//         document.body.removeChild(script);
//       }
//     };
//   }, []);

//   return (
//     <div
//       dangerouslySetInnerHTML={{
//         __html: `
//           <call-us-selector phonesystem-url="https://1314.3cx.cloud" party="techdevcyber"></call-us-selector>
//         `,
//       }}
//     />
//   );
// }

export default function App() {
  const { user } = useLoaderData<typeof loader>();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <html lang="en">
      <head>
        <Meta />
        <title>Admin | Nedcgroup</title>
        <Links />
      </head>
      <body>
        <Outlet />
        {/* {isMounted && (user ? <Layout /> : )} */}
        {/* <Chat /> */}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
