import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { weddingConfig } from "../../config";
import { hasSupabaseConfig, supabaseSelect, supabaseUpdate, supabaseUpsert } from "../../lib/supabaseServer";

const rsvpsFilePath = path.join(process.cwd(), "data", "rsvps.json");
const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

function stableUuidFromText(text) {
  const hash = crypto.createHash("sha256").update(text).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16)}${hash.slice(18, 20)}-${hash.slice(20, 32)}`;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

async function saveSupabaseRsvpMessage(name, message, familyId) {
  const messageName = name.trim();
  const messageText = message.trim();
  const messageId = stableUuidFromText(`rsvp:${familyId || messageName.toLowerCase()}`);

  return supabaseUpsert("messages", {
    id: messageId,
    name: messageName,
    message: messageText,
    approved: false,
  });
}

function upsertLocalRsvpMessage(messages, name, message) {
  const messageName = name.trim();
  const messageText = message.trim();
  const messageId = `rsvp-msg-${slugify(messageName)}`;

  const existingIndex = messages.findIndex((item) => item.id === messageId);
  const nextMessage = {
    id: messageId,
    name: messageName,
    message: messageText,
    date: new Date().toISOString(),
    approved: false,
  };

  if (existingIndex !== -1) {
    messages[existingIndex] = nextMessage;
    return messages;
  }

  messages.push(nextMessage);
  return messages;
}

export async function GET() {
  try {
    if (hasSupabaseConfig()) {
      // Busca todos os convidados e junta com suas famílias
      const guests = await supabaseSelect("guests", {
        select: "*,families(*)",
        orderBy: "confirmed_at",
        ascending: false
      });
      
      // Filtra apenas aqueles que já responderam
      const respondedGuests = guests.filter((g) => g.attending !== null);
      
      return NextResponse.json(
        respondedGuests.map((g) => ({
          id: g.id,
          guest_name: g.name,
          group_name: g.families?.name || "",
          attending: g.attending,
          guests_count: g.attending ? 1 : 0,
          companions: [],
          allergies: g.allergies || "",
          message: g.message || "",
          created_at: g.confirmed_at || g.created_at,
          updated_at: g.confirmed_at || g.created_at,
        }))
      );
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
    const { id, familyId, name, groupName, attending, guestsCount, companions, allergies, message } = body;

    if (!name) {
      return NextResponse.json({ error: "O nome e obrigatorio." }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      let updatedGuest = null;
      
      // 1. Tenta atualizar pelo ID do convidado se fornecido
      if (id && id.length > 30) {
        updatedGuest = await supabaseUpdate("guests", id, {
          attending: Boolean(attending),
          allergies: attending ? allergies || "" : "",
          message: message || "",
          confirmed_at: new Date().toISOString(),
        });
      } else {
        // 2. Fallback de busca pelo nome
        const found = await supabaseSelect("guests", { filters: { name: `eq.${name.trim()}` } });
        if (found && found.length > 0) {
          updatedGuest = await supabaseUpdate("guests", found[0].id, {
            attending: Boolean(attending),
            allergies: attending ? allergies || "" : "",
            message: message || "",
            confirmed_at: new Date().toISOString(),
          });
        }
      }

      if (message?.trim()) {
        await saveSupabaseRsvpMessage(groupName?.trim() || name.trim(), message, familyId);
      }

      return NextResponse.json({ success: true, rsvp: updatedGuest });
    }

    // MODO FALLBACK (Sem Supabase)
    let rsvps = [];
    try {
      const data = await fs.readFile(rsvpsFilePath, "utf8");
      rsvps = JSON.parse(data);
    } catch {}

    const existingIndex = rsvps.findIndex((rsvp) => rsvp.name.toLowerCase() === name.toLowerCase());
    const newRsvp = {
      id: existingIndex !== -1 ? rsvps[existingIndex].id : `rsvp-${Date.now()}`,
      name: name.trim(),
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

      messages = upsertLocalRsvpMessage(messages, groupName?.trim() || name.trim(), message);

      await fs.writeFile(messagesFilePath, JSON.stringify(messages, null, 2), "utf8");
    }

    return NextResponse.json({ success: true, rsvp: newRsvp });
  } catch (error) {
    console.error("Error saving RSVP:", error);
    return NextResponse.json({ error: "Erro ao salvar a confirmacao." }, { status: 500 });
  }
}
