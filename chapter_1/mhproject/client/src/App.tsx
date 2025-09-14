// client/src/App.tsx
// [KR] UI 정리 + 폼 UX 개선(빈 값 방지/길이 제한/접근성)
// [EN] Polished UI + form UX (prevent empty, length limits, a11y)

import { useEffect, useRef, useState } from "react";
import { Application, Graphics } from "pixi.js";
import { getItems, createItem, type Item } from "./api";

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<Application | null>(null);

  // server data state
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Pixi init once
  useEffect(() => {
    if (!canvasRef.current || appRef.current) return;

    const app = new Application();
    appRef.current = app;

    (async () => {
      await app.init({
        canvas: canvasRef.current,
        width: 640,
        height: 360,
        background: "#f0f2f5",
      });
      const g = new Graphics();
      g.rect(100, 100, 200, 120).fill(0x666666);
      app.stage.addChild(g);
    })();

    return () => {
      app.destroy(true);
      appRef.current = null;
    };
  }, []);

  // fetch list
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const data = await getItems();
        setItems(data);
      } catch (e: any) {
        setErr(e?.message ?? "Load failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // create item
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim() || !desc.trim()) return;
    try {
      setLoading(true);
      setErr(null);
      await createItem({ name: name.trim(), description: desc.trim() });
      const data = await getItems();
      setItems(data);
      setName("");
      setDesc("");
    } catch (e: any) {
      setErr(e?.message ?? "Create failed");
    } finally {
      setLoading(false);
    }
  }

  // ✅ visibleItems: 최소 2자 미만 항목 숨김(하나만 선언!)
  const visibleItems = items.filter(
    (it) => it && it.name?.trim().length >= 2 && it.description?.trim().length >= 2
  );

  // -------------------- UI --------------------
  return (
    <main className="page">
      <section className="stage card">
        <canvas ref={canvasRef} />
      </section>

      <aside className="panel card">
        <h2>Items</h2>

        <form className="form" onSubmit={onSubmit} autoComplete="off">
          <input
            className="input"
            placeholder="name"
            value={name}
            maxLength={40}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="description"
            value={desc}
            maxLength={120}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button
            className="btn"
            type="submit"
            disabled={loading || !name.trim() || !desc.trim()}
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </form>

        {err && (
          <p className="error" aria-live="assertive">
            Error: {err}
          </p>
        )}

        {visibleItems.length === 0 ? (
          <p className="muted">empty</p>
        ) : (
          <ul className="list">
            {visibleItems.map((it) => (
              <li key={it.id}>
                <b>{it.name}</b> — {it.description}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </main>
  );
}
