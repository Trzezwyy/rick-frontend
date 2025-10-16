export async function askRick(message: string, conversationId?: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reply`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_RICK_CLIENT_SECRET}`,
      },
      body: JSON.stringify({ message, conversation_id: conversationId || null }),
    }
  );
  if (!res.ok) throw new Error(`Backend ${res.status}`);
  return res.json() as Promise<{
    type: "questions" | "answer";
    content: string;
    conversation_id: string;
  }>;
}

export async function listConversations() {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/conversations`,
    { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RICK_CLIENT_SECRET}` } }
  );
  if (!r.ok) throw new Error(`Backend ${r.status}`);
  return r.json() as Promise<{ items: { id: string; title: string; created_at: string }[] }>;
}

export async function getHistory(conversationId: string) {
  const r = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/history/${conversationId}`,
    { headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_RICK_CLIENT_SECRET}` } }
  );
  if (!r.ok) throw new Error(`Backend ${r.status}`);
  return r.json() as Promise<{ messages: { role: "user" | "assistant"; content: string; created_at: string }[] }>;
}
