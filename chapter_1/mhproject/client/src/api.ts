// client/src/api.ts
export type Item = { id: number; name: string; description: string };

// 프록시 사용 → BASE 비움(상대 경로)
const BASE = ""; 
console.log("[api] USING VITE PROXY");

function pickArray(json: any): Item[] {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.items)) return json.items;
  return [];
}

export async function getItems(): Promise<Item[]> {
  const r = await fetch(`${BASE}/api/items/get_list`);
  if (!r.ok) throw new Error(`GET failed: ${r.status}`);
  return pickArray(await r.json());
}

export async function createItem(payload: { name: string; description: string }) {
  const r = await fetch(`${BASE}/api/items/create_item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`POST failed: ${r.status}`);
  return r.json();
}
