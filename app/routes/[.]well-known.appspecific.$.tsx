import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

// Silently handle .well-known/appspecific requests (Chrome DevTools)
// Square brackets [.] escape the dot character in Remix route filenames
export const loader: LoaderFunction = async () => {
  return json({}, { status: 404 });
};

