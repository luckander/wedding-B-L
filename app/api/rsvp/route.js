import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { hasSupabaseConfig, supabaseSelect, supabaseUpsert } from "../../lib/supabaseServer";

const rsvpsFilePath = path.join(process.cwd(), "data", "rsvps.json");
const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

export async function GET() {
  try {
    if (hasSupabaseConfig()) {
      return NextResponse.json(await supabaseSelect("rsvps", { orderBy: "created_at" }));
    }

    const data = await fs.readFile(rsvpsFilePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading RSVPs:", error);
    return NextResponse.json({ error: "Erro ao ler as confirmacoes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, groupName, attending, guestsCount, companions, allergies, message } = body;

    if (!name) {
      return NextResponse.json({ error: "O nome e obrigatorio." }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      const rsvp = await supabaseUpsert(
        "rsvps",
        {
          guest_name: name.trim(),
          group_name: groupName || "",
          attending: Boolean(attending),
          guests_count: attending ? Number(guestsCount) || 1 : 0,
          companions: attending ? companions || [] : [],
          allergies: allergies || "",
          message: message || "",
        },
        "guest_name"
      );

      if (message?.trim()) {
        await supabaseUpsert("messages", {
          name: name.trim(),
          message: message.trim(),
          approved: false,
        });
      }

      return NextResponse.json({ success: true, rsvp });
    }

    let rsvps = [];
    try {
      const data = await fs.readFile(rsvpsFilePath, "utf8");
      rsvps = JSON.parse(data);
    } catch {}

    const existingIndex = rsvps.findIndex((rsvp) => rsvp.name.toLowerCase() === name.toLowerCase());
    const newRsvp = {
      id: existingIndex !== -1 ? rsvps[existingIndex].id : `rsvp-${Date.now()}`,
      name,
      groupName: groupName || "",
      attending: Boolean(attending),
      guestsCount: attending ? Number(guestsCount) || 1 : 0,
      companions: attending ? companions || [] : [],
      allergies: allergies || "",
      message: message || "",
      date: new Date().toISOString(),
    };

    if (existingIndex !== -1) rsvps[existingIndex] = newRsvp;
    else rsvps.push(newRsvp);

    await fs.writeFile(rsvpsFilePath, JSON.stringify(rsvps, null, 2), "utf8");

    if (message?.trim()) {
      let messages = [];
      try {
        const data = await fs.readFile(messagesFilePath, "utf8");
        messages = JSON.parse(data);
      } catch {}

      messages.push({
        id: `msg-${Date.now()}`,
        name,
        message: message.trim(),
        date: new Date().toISOString(),
        approved: false,
      });

      await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");
    }

    return NextResponse.json({ success: true, rsvp: newRsvp });
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return NextResponse.json({ error: "Erro ao salvar a confirmacao." }, { status: 500 });
  }
}
