import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const giftsFilePath = path.join(process.cwd(), "data", "gifts.json");

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (password !== "casamento2026") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const data = await fs.readFile(giftsFilePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Erro ao ler as contribuições." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { giftId, giftTitle, donorName, message, amount, paymentMethod } = body;

    if (!giftId || !donorName) {
      return NextResponse.json({ error: "Dados obrigatórios não informados." }, { status: 400 });
    }

    let contributions = [];
    try {
      const data = await fs.readFile(giftsFilePath, "utf8");
      contributions = JSON.parse(data);
    } catch (e) {}

    const newContribution = {
      id: `contrib-${Date.now()}`,
      giftId,
      giftTitle,
      donorName: donorName.trim(),
      message: message ? message.trim() : "",
      amount: Number(amount) || 0,
      paymentMethod: paymentMethod || "Pix",
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
