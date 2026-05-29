import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get("admin") === "true";
    const password = searchParams.get("password");

    const data = await fs.readFile(messagesFilePath, "utf8");
    const allMessages = JSON.parse(data);

    if (isAdmin && password === "casamento2026") {
      return NextResponse.json(allMessages);
    }

    // Standard public fetch: return only approved messages, sorted by newest
    const approvedMessages = allMessages
      .filter((m) => m.approved)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(approvedMessages);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao carregar os recados." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, message } = body;

    if (!name || !message) {
      return NextResponse.json({ error: "Nome e mensagem são obrigatórios." }, { status: 400 });
    }

    let messages = [];
    try {
      const data = await fs.readFile(messagesFilePath, "utf8");
      messages = JSON.parse(data);
    } catch (e) {}

    const newMsg = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      message: message.trim(),
      date: new Date().toISOString(),
      approved: false, // Default is pending moderation
    };

    messages.push(newMsg);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");

    return NextResponse.json({ success: true, message: newMsg });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar o recado." }, { status: 500 });
  }
}

// For approval / moderation from the admin panel
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, approved, password } = body;

    if (password !== "casamento2026") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    let messages = JSON.parse(data);

    const msgIndex = messages.findIndex((m) => m.id === id);
    if (msgIndex === -1) {
      return NextResponse.json({ error: "Mensagem não encontrada." }, { status: 404 });
    }

    messages[msgIndex].approved = !!approved;
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");

    return NextResponse.json({ success: true, message: messages[msgIndex] });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao atualizar o recado." }, { status: 500 });
  }
}

// For deletion from the admin panel
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const password = searchParams.get("password");

    if (password !== "casamento2026") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    let messages = JSON.parse(data);

    const filteredMessages = messages.filter((m) => m.id !== id);
    await fs.writeFile(messagesFilePath, JSON.stringify(filteredMessages, null, 2), "utf8");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar o recado." }, { status: 500 });
  }
}
