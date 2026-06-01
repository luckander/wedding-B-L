import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { weddingConfig } from "../../config";
import { hasSupabaseConfig, supabaseSelect, supabaseUpdate, supabaseUpsert } from "../../lib/supabaseServer";

const rsvpsFilePath = path.join(process.cwd(), "data", "rsvps.json");
const messagesFilePath = path.join(process.cwd(), "data", "messages.json");

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
    const { id, name, groupName, attending, guestsCount, companions, allergies, message } = body;

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
        await supabaseUpsert("messages", {
          name: name.trim(),
          message: message.trim(),
          approved: false,
        });
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

      messages.push({
        id: `msg-${Date.now()}`,
        name: name.trim(),
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
