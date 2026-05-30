import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { weddingConfig } from "../../config";
import { hasSupabaseConfig, supabaseInsert, supabaseSelect } from "../../lib/supabaseServer";

const giftsFilePath = path.join(process.cwd(), "data", "gifts.json");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== weddingConfig.admin.password) {
      return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
    }

    if (hasSupabaseConfig()) {
      return NextResponse.json(await supabaseSelect("gift_contributions", { orderBy: "created_at" }));
    }

    const data = await fs.readFile(giftsFilePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading contributions:", error);
    return NextResponse.json({ error: "Erro ao ler as contribuicoes." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { giftId, giftTitle, donorName, message, amount, paymentMethod } = body;

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
    };

    contributions.push(newContribution);
    await fs.writeFile(giftsFilePath, JSON.stringify(contributions, null, 2), "utf8");

    return NextResponse.json({ success: true, contribution: newContribution });
  } catch (error) {
    console.error("Error saving contribution:", error);
    return NextResponse.json({ error: "Erro ao registrar o presente." }, { status: 500 });
  }
}
