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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const password = searchParams.get("password");

    if (hasSupabaseConfig()) {
      const allMessages = await supabaseSelect("messages", { orderBy: "created_at" });

      if (isAdmin && password === weddingConfig.admin.password) {
        return NextResponse.json(allMessages);
      }

      return NextResponse.json(allMessages.filter((message) => message.approved));
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const allMessages = JSON.parse(data);

    if (isAdmin && password === weddingConfig.admin.password) {
      return NextResponse.json(allMessages);
    }

    const approvedMessages = allMessages
      .filter((message) => message.approved)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(approvedMessages);
  } catch (error) {
    console.error("Error loading messages:", error);
    return NextResponse.json({ error: "Erro ao carregar os recados." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "Nome e mensagem sao obrigatorios." }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      const newMessage = await supabaseInsert("messages", {
        name: name.trim(),
        message: message.trim(),
        approved: false,
      });

      return NextResponse.json({ success: true, message: newMessage });
    }

    let messages = [];
    try {
      const data = await fs.readFile(messagesFilePath, "utf8");
      messages = JSON.parse(data);
    } catch {}

    const newMessage = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
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
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
    }

    if (hasSupabaseConfig()) {
      const message = await supabaseUpdate("messages", id, { approved: Boolean(approved) });
      return NextResponse.json({ success: true, message });
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const messages = JSON.parse(data);
    const messageIndex = messages.findIndex((message) => message.id === id);

    if (messageIndex === -1) {
      return NextResponse.json({ error: "Mensagem nao encontrada." }, { status: 404 });
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
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
    }

    if (hasSupabaseConfig()) {
      await supabaseDelete("messages", id);
      return NextResponse.json({ success: true });
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
