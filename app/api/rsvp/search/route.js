import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { weddingConfig } from "../../../config";
import { hasSupabaseConfig, supabaseSelect } from "../../../lib/supabaseServer";

const rsvpsFilePath = path.join(process.cwd(), "data", "rsvps.json");

function slugify(text) {
  if (!text) return "";
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const slug = searchParams.get("slug");

    if (!query && !slug) {
      return NextResponse.json({ error: "Parâmetro de busca obrigatório (query ou slug)." }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      let family = null;
      let guests = [];

      if (slug) {
        // Busca por slug no banco de dados
        const families = await supabaseSelect("families", { filters: { slug: `eq.${slug.toLowerCase().trim()}` } });
        if (families && families.length > 0) {
          family = families[0];
        }
      } else if (query) {
        const cleanQuery = query.trim();
        // 1. Tenta buscar convidado pelo nome
        const matchingGuests = await supabaseSelect("guests", { filters: { name: `ilike.*${cleanQuery}*` } });
        if (matchingGuests && matchingGuests.length > 0) {
          const familyId = matchingGuests[0].family_id;
          const families = await supabaseSelect("families", { filters: { id: `eq.${familyId}` } });
          if (families && families.length > 0) {
            family = families[0];
          }
        }

        // 2. Se não achou por convidado, tenta por nome da família
        if (!family) {
          const families = await supabaseSelect("families", { filters: { name: `ilike.*${cleanQuery}*` } });
          if (families && families.length > 0) {
            family = families[0];
          }
        }
      }

      // Se encontramos uma família, buscamos todos os membros dela
      if (family) {
        guests = await supabaseSelect("guests", {
          filters: { family_id: `eq.${family.id}` },
          orderBy: "name",
          ascending: true
        });

        return NextResponse.json({
          success: true,
          found: true,
          family: {
            id: family.id,
            name: family.name,
            slug: family.slug,
          },
          members: guests.map((g) => ({
            id: g.id,
            name: g.name,
            attending: g.attending,
            allergies: g.allergies || "",
            message: g.message || "",
          })),
        });
      }

      return NextResponse.json({ success: true, found: false });
    }

    // MODO FALLBACK (Sem Supabase)
    let matchedGroup = null;
    let membersList = [];

    const searchStr = query ? query.toLowerCase().trim() : "";
    const slugStr = slug ? slug.toLowerCase().trim() : "";

    // Procura no array local config.js
    const matchedConfigGuest = weddingConfig.guests.find((guest) => {
      if (slugStr) {
        return slugify(guest.group) === slugStr || slugify(guest.name) === slugStr;
      }
      return (
        guest.group.toLowerCase().includes(searchStr) ||
        guest.name.toLowerCase().includes(searchStr) ||
        guest.companions.some((c) => c.toLowerCase().includes(searchStr))
      );
    });

    if (matchedConfigGuest) {
      matchedGroup = {
        id: `group-${matchedConfigGuest.id}`,
        name: matchedConfigGuest.group,
        slug: slugify(matchedConfigGuest.group),
      };
      membersList = [matchedConfigGuest.name, ...matchedConfigGuest.companions];

      // Busca dados de RSVPs salvos localmente em rsvps.json
      let localRsvps = [];
      try {
        const data = await fs.readFile(rsvpsFilePath, "utf8");
        localRsvps = JSON.parse(data);
      } catch {}

      const membersData = membersList.map((member) => {
        const existingRsvp = localRsvps.find((r) => r.name.toLowerCase() === member.toLowerCase());
        return {
          id: existingRsvp?.id || `guest-${slugify(member)}`,
          name: member,
          attending: existingRsvp ? existingRsvp.attending : null,
          allergies: existingRsvp?.allergies || "",
          message: existingRsvp?.message || "",
        };
      });

      return NextResponse.json({
        success: true,
        found: true,
        family: matchedGroup,
        members: membersData,
      });
    }

    return NextResponse.json({ success: true, found: false });
  } catch (error) {
    console.error("Erro na busca de presença:", error);
    return NextResponse.json({ error: "Erro interno ao realizar busca." }, { status: 500 });
  }
}
