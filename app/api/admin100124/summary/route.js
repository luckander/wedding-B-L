import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { hasSupabaseConfig, supabaseSelect } from "../../../lib/supabaseServer";

const rsvpsFilePath = path.join(process.cwd(), "data", "rsvps.json");
const giftsFilePath = path.join(process.cwd(), "data", "gifts.json");

export async function GET() {
  try {
    if (hasSupabaseConfig()) {
      const [guests, giftContributions] = await Promise.all([
        supabaseSelect("guests", {
          select: "*,families(*)",
          orderBy: "confirmed_at",
          ascending: false,
        }),
        supabaseSelect("gift_contributions", { orderBy: "created_at" }),
      ]);

      const rsvps = guests
        .map((guest) => ({
          id: guest.id,
          name: guest.name,
          familyId: guest.family_id || guest.families?.id || "",
          groupName: guest.families?.name || "",
          attending: guest.attending,
          allergies: guest.allergies || "",
          message: guest.message || "",
          date: guest.confirmed_at || guest.created_at,
        }));

      return NextResponse.json({ rsvps, giftContributions });
    }

    const [rsvps, giftContributions] = await Promise.all([
      readJsonFile(rsvpsFilePath),
      readJsonFile(giftsFilePath),
    ]);

    return NextResponse.json({ rsvps, giftContributions });
  } catch (error) {
    console.error("Error loading admin summary:", error);
    return NextResponse.json({ error: "Erro ao carregar o resumo." }, { status: 500 });
  }
}

async function readJsonFile(filePath) {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}
