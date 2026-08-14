import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { weddingConfig } from "../../config";
import {
  hasSupabaseConfig,
  supabaseDelete,
  supabaseInsert,
  supabaseSelect,
  supabaseUpdate,
} from "../../lib/supabaseServer";

const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

function shuffleMessages(messages) {
  return [...messages].sort(() => Math.random() - 0.5);
}

async function resolveMessageName(name, inviteSlug) {
  const trimmedName = name?.trim();
  if (trimmedName) return trimmedName;

  const slug = inviteSlug?.trim().toLowerCase();
  if (slug && hasSupabaseConfig()) {
    try {
      const families = await supabaseSelect("families", { filters: { slug: `eq.${slug}` } });
      if (families?.[0]?.name) return families[0].name;
    } catch (err) {
      console.warn("Could not resolve family name for message:", err.message);
    }
  }

  return "Familia";
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const password = searchParams.get("password");

    if (hasSupabaseConfig()) {
      try {
        const allMessages = await supabaseSelect("messages", { orderBy: "created_at" });

        if (isAdmin && password === weddingConfig.admin.password) {
          return NextResponse.json(allMessages);
        }

        return NextResponse.json(shuffleMessages(allMessages.filter((message) => message.approved)));
      } catch (err) {
        console.warn("Supabase fetch failed, falling back to local JSON:", err.message);
      }
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const allMessages = JSON.parse(data);

    if (isAdmin && password === weddingConfig.admin.password) {
      return NextResponse.json(allMessages);
    }

    const approvedMessages = shuffleMessages(allMessages.filter((message) => message.approved));

    return NextResponse.json(approvedMessages);
  } catch (error) {
    console.error("Error loading messages:", error);
    return NextResponse.json({ error: "Erro ao carregar os recados." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, message, inviteSlug } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Mensagem obrigatoria." }, { status: 400 });
    }

    const messageName = await resolveMessageName(name, inviteSlug);

    if (hasSupabaseConfig()) {
      try {
        const newMessage = await supabaseInsert("messages", {
          name: messageName,
          message: message.trim(),
          approved: false,
        });

        return NextResponse.json({ success: true, message: newMessage });
      } catch (err) {
        console.warn("Supabase insert failed, falling back to local JSON:", err.message);
      }
    }

    let messages = [];
    try {
      const data = await fs.readFile(messagesFilePath, "utf8");
      messages = JSON.parse(data);
    } catch {}

    const newMessage = {
      id: `msg-${Date.now()}`,
      name: messageName,
      message: message.trim(),
      date: new Date().toISOString(),
      approved: false,
    };

    messages.push(newMessage);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json({ error: "Erro ao salvar o recado." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, approved, password } = body;

    if (password !== weddingConfig.admin.password) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (hasSupabaseConfig()) {
      try {
        const message = await supabaseUpdate("messages", id, { approved: Boolean(approved) });
        return NextResponse.json({ success: true, message });
      } catch (err) {
        console.warn("Supabase update failed, falling back to local JSON:", err.message);
      }
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const messages = JSON.parse(data);
    const messageIndex = messages.findIndex((message) => message.id === id);

    if (messageIndex === -1) {
      return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });
    }

    messages[messageIndex].approved = Boolean(approved);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");

    return NextResponse.json({ success: true, message: messages[messageIndex] });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ error: "Erro ao atualizar o recado." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const password = searchParams.get("password");

    if (password !== weddingConfig.admin.password) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (hasSupabaseConfig()) {
      try {
        await supabaseDelete("messages", id);
        return NextResponse.json({ success: true });
      } catch (err) {
        console.warn("Supabase delete failed, falling back to local JSON:", err.message);
      }
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const messages = JSON.parse(data).filter((message) => message.id !== id);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Erro ao deletar o recado." }, { status: 500 });
  }
}
