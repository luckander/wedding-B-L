import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const rsvpsFilePath = path.join(process.cwd(), "data", "rsvps.json");
const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

export async function GET() {
  try {
    const data = await fs.readFile(rsvpsFilePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Erro ao ler as confirmações." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, attending, guestsCount, companions, allergies, message } = body;

    if (!name) {
      return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }

    // Read existing RSVPs
    let rsvps = [];
    try {
      const data = await fs.readFile(rsvpsFilePath, "utf8");
      rsvps = JSON.parse(data);
    } catch (e) {
      // File might not exist or be empty, use empty array
    }

    // Check if RSVP for this name already exists and update, or push new
    const existingIndex = rsvps.findIndex((r) => r.name.toLowerCase() === name.toLowerCase());

    const newRsvp = {
      id: existingIndex !== -1 ? rsvps[existingIndex].id : `rsvp-${Date.now()}`,
      name,
      attending: !!attending,
      guestsCount: attending ? Number(guestsCount) || 1 : 0,
      companions: attending ? companions || [] : [],
      allergies: allergies || "",
      message: message || "",
      date: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      rsvps[existingIndex] = newRsvp;
    } else {
      rsvps.push(newRsvp);
    }

    await fs.writeFile(rsvpsFilePath, JSON.stringify(rsvps, null, 2), "utf8");

    // If a message was provided, automatically add it to the guestbook as pending
    if (message && message.trim().length > 0) {
      let messages = [];
      try {
        const data = await fs.readFile(messagesFilePath, "utf8");
        messages = JSON.parse(data);
      } catch (e) {}

      messages.push({
        id: `msg-${Date.now()}`,
        name,
        message: message.trim(),
        date: new Date().toISOString(),
        approved: false, // Moderation required
      });

      await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");
    }

    return NextResponse.json({ success: true, rsvp: newRsvp });
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return NextResponse.json({ error: "Erro ao salvar a confirmação." }, { status: 500 });
  }
}
