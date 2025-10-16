"use client";
import React, { useEffect, useState, KeyboardEvent, ChangeEvent } from "react";
import { askRick, listConversations, getHistory } from "@/lib/rick";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [conv, setConv] = useState<string | null>(null);
  const [convs, setConvs] = useState<{ id: string; title: string }[]>([]);
  const [items, setItems] = useState<Msg[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await listConversations();
      setConvs(res.items || []);
      if (!conv && res.items?.[0]) {
        const first = res.items[0].id;
        setConv(first);
        const h = await getHistory(first);
        setItems(h.messages.map((m) => ({ role: m.role, content: m.content })));
      }
    })();
  }, []);

  async function openConversation(id: string) {
    setConv(id);
    const h = await getHistory(id);
    setItems(h.messages.map((m) => ({ role: m.role, content: m.content })));
  }

  async function send() {
    if (!msg.trim() || loading) return;
    const text = msg;
    setItems((prev) => [...prev, { role: "user", content: text }]);
    setMsg("");
    setLoading(true);
    try {
      const resp = await askRick(text, conv || undefined);
      if (!conv && resp.conversation_id) {
        setConv(resp.conversation_id);
        const list = await listConversations();
        setConvs(list.items || []);
      }
      setItems((prev) => [...prev, { role: "assistant", content: resp.content }]);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(ev: ChangeEvent<HTMLInputElement>) {
    setMsg(ev.target.value);
  }
  function handleKeyDown(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === "Enter") send();
  }

  return (
    <main className="min-h-screen bg-gray-50 flex">
      {/* Lewy panel */}
      <aside className="w-64 border-r bg-white p-3 hidden md:block">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Rozmowy</div>
          <button
            className="text-sm px-2 py-1 rounded-lg border"
            onClick={async () => {
              // nowa rozmowa = wyślij pusty msg po stronie użytkownika albo dopiero przy pierwszej wiadomości
              setConv(null);
              setItems([]);
            }}
          >
            + Nowa
          </button>
        </div>
        <div className="space-y-2">
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`w-full text-left px-3 py-2 rounded-xl border hover:bg-gray-50 ${
                conv === c.id ? "bg-gray-100 border-gray-300" : "border-gray-200"
              }`}
            >
              {c.title || "Rick chat"}
            </button>
          ))}
          {convs.length === 0 && <p className="text-gray-500 text-sm">Brak rozmów</p>}
        </div>
      </aside>

      {/* Prawy panel — czat */}
      <section className="flex-1 mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold mb-4">Rick — partner-mentor</h1>

        <div className="border rounded-2xl p-4 h-[60vh] overflow-y-auto mb-4 bg-white shadow-sm">
          {items.length === 0 && (
            <p className="text-gray-500">
              Napisz do Ricka, np.: <i>&quot;Pomóż mi zaplanować tydzień pracy&quot;</i>
            </p>
          )}
          {items.map((m, i) => (
            <div key={i} className={`my-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
              <div className={`inline-block rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-blue-100" : "bg-gray-200"}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && <p className="text-gray-400 mt-2">Rick się zastanawia…</p>}
        </div>

        <div className="flex gap-2">
          <input
            value={msg}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
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
      </section>
    </main>
  );
}
