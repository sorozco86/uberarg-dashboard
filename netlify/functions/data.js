import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("dashboard");
  const data = await store.get("latest");

  return new Response(
    data || JSON.stringify({ updatedAt: null, rows: [] }),
    {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
};