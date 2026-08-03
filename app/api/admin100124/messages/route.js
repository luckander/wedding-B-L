import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import {
  hasSupabaseConfig,
  supabaseDelete,
  supabaseSelect,
  supabaseUpdate,
} from "../../../lib/supabaseServer";

const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

export async function GET() {
  try {
    if (hasSupabaseConfig()) {
      const messages = await supabaseSelect("messages", { orderBy: "created_at" });
      return NextResponse.json(messages);
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const messages = JSON.parse(data).sort((a, b) => {
      const aDate = new Date(a.created_at || a.date || 0);
      const bDate = new Date(b.created_at || b.date || 0);
      return bDate - aDate;
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error loading admin messages:", error);
    return NextResponse.json({ error: "Erro ao carregar os recados." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, approved } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID nao informado." }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      const message = await supabaseUpdate("messages", id, { approved: Boolean(approved) });
      return NextResponse.json({ success: true, message });
    }

    const data = await fs.readFile(messagesFilePath, "utf8");
    const messages = JSON.parse(data);
    const messageIndex = messages.findIndex((message) => message.id === id);

    if (messageIndex === -1) {
      return NextResponse.json({ error: "Recado nao encontrado." }, { status: 404 });
    }

    messages[messageIndex].approved = Boolean(approved);
    await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");

    return NextResponse.json({ success: true, message: messages[messageIndex] });
  } catch (error) {
    console.error("Error updating admin message:", error);
    return NextResponse.json({ error: "Erro ao atualizar o recado." }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID nao informado." }, { status: 400 });
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
    console.error("Error deleting admin message:", error);
    return NextResponse.json({ error: "Erro ao excluir o recado." }, { status: 500 });
  }
}
