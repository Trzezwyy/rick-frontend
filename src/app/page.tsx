"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [conv, setConv] = useState<string | null>(null);
  const [items, setItems] = useState<Msg[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (!msg.trim() || loading) return;
    setError(null);
    const userMsg: Msg = { role: "user", content: msg };
    setItems((prev) => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_RICK_CLIENT_SECRET}`,
          },
          body: JSON.stringify({
            message: userMsg.content,
            conversation_id: conv || null,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend ${res.status}: ${text}`);
      }

      const data: {
        type: "questions" | "answer";
        content: string;
        conversation_id?: string | null;
      } = await res.json();

      if (!conv && data.conversation_id) setConv(data.conversation_id || null);

      const botMsg: Msg = {
        role: "assistant",
        content: data.content || "(brak odpowiedzi)",
      };
      setItems((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Błąd połączenia z backendem";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4">Rick — partner-mentor</h1>

      <div className="border rounded-2xl p-4 h-[60vh] overflow-y-auto mb-4 bg-white shadow-sm">
        {items.length === 0 && (
          <p className="text-gray-500">
            Napisz do Ricka, np.: <i>&quot;Pomóż mi zaplanować tydzień pracy&quot;</i>
          </p>
        )}
        {items.map((m, i) => (
          <div
            key={i}
            className={`my-2 ${m.role === "user" ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block rounded-2xl px-4 py-2 ${
                m.role === "user" ? "bg-blue-100" : "bg-gray-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && <p className="text-gray-400 mt-2">Rick się zastanawia…</p>}
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div className="flex gap-2">
        <input
          value={msg}
          onChange={(ev) => setMsg(ev.target.value)}
          onKeyDown={(ev) => {
            if (ev.key === "Enter") send();
          }}
          placeholder="Napisz wiadomość…"
          className="flex-1 border rounded-xl px-3 py-2 shadow-sm"
        />
        <button
          onClick={send}
          className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
          disabled={loading}
        >
          Wyślij
        </button>
      </div>
    </main>
  );
}
