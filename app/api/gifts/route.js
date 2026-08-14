import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { weddingConfig } from "../../config";
import { hasSupabaseConfig, supabaseInsert, supabaseSelect, supabaseUpdate } from "../../lib/supabaseServer";

const giftsFilePath = path.join(process.cwd(), "data", "gifts.json");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const isAdmin = password === weddingConfig.admin.password;

    let contributions = [];

    if (hasSupabaseConfig()) {
      contributions = await supabaseSelect("gift_contributions", { orderBy: "created_at" });
      return NextResponse.json(isAdmin ? contributions : toPublicGiftStatus(contributions));
    }

    const data = await fs.readFile(giftsFilePath, "utf8");
    contributions = JSON.parse(data);
    return NextResponse.json(isAdmin ? contributions : toPublicGiftStatus(contributions));
  } catch (error) {
    console.error("Error reading contributions:", error);
    return NextResponse.json({ error: "Erro ao ler as contribuicoes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { giftId, giftTitle, donorName, message, amount, paymentMethod, inviteSlug } = body;

    if (!giftId || !donorName) {
      return NextResponse.json({ error: "Dados obrigatorios nao informados." }, { status: 400 });
    }

    if (hasSupabaseConfig()) {
      const contribution = await supabaseInsert("gift_contributions", {
        gift_id: giftId,
        gift_title: giftTitle,
        donor_name: donorName.trim(),
        message: message ? message.trim() : "",
        amount: Number(amount) || 0,
        payment_method: paymentMethod || "Pix",
        payment_status: "pending",
        invite_slug: inviteSlug ? inviteSlug.trim() : null,
      });

      return NextResponse.json({ success: true, contribution });
    }

    let contributions = [];
    try {
      const data = await fs.readFile(giftsFilePath, "utf8");
      contributions = JSON.parse(data);
    } catch {}

    const newContribution = {
      id: `contrib-${Date.now()}`,
      giftId,
      giftTitle,
      donorName: donorName.trim(),
      message: message ? message.trim() : "",
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || "Pix",
      paymentStatus: "pending",
      date: new Date().toISOString(),
      inviteSlug: inviteSlug ? inviteSlug.trim() : null,
    };

    contributions.push(newContribution);
    await fs.writeFile(giftsFilePath, JSON.stringify(contributions, null, 2), "utf8");

    return NextResponse.json({ success: true, contribution: newContribution });
  } catch (error) {
    console.error("Error saving contribution:", error);
    return NextResponse.json({ error: "Erro ao registrar o presente." }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, paymentStatus } = body;

    if (!id) {
      return NextResponse.json({ error: "ID nao informado." }, { status: 400 });
    }

    const nextStatus = paymentStatus === "confirmed" ? "confirmed" : "pending";

    if (hasSupabaseConfig()) {
      const contribution = await supabaseUpdate("gift_contributions", id, {
        payment_status: nextStatus,
      });

      return NextResponse.json({ success: true, contribution });
    }

    const data = await fs.readFile(giftsFilePath, "utf8");
    const contributions = JSON.parse(data);
    const contributionIndex = contributions.findIndex((contribution) => contribution.id === id);

    if (contributionIndex === -1) {
      return NextResponse.json({ error: "Presente nao encontrado." }, { status: 404 });
    }

    contributions[contributionIndex].paymentStatus = nextStatus;
    await fs.writeFile(giftsFilePath, JSON.stringify(contributions, null, 2), "utf8");

    return NextResponse.json({ success: true, contribution: contributions[contributionIndex] });
  } catch (error) {
    console.error("Error updating contribution:", error);
    return NextResponse.json({ error: "Erro ao atualizar o presente." }, { status: 500 });
  }
}

function toPublicGiftStatus(contributions) {
  const giftIds = contributions
    .map((contribution) => contribution.gift_id || contribution.giftId)
    .filter(Boolean);

  return {
    giftIds,
    byGiftId: giftIds.reduce((acc, giftId) => {
      acc[giftId] = true;
      return acc;
    }, {}),
  };
}
