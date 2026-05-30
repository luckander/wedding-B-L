import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    const fallbackLink = process.env.NEXT_PUBLIC_MERCADO_PAGO_FALLBACK_LINK || "https://www.mercadopago.com.br/";
    const { title, amount, donorName } = await request.json();

    if (!token) {
      return NextResponse.json({
        checkoutUrl: fallbackLink,
        mode: "fallback",
      });
    }

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [
          {
            title,
            quantity: 1,
            currency_id: "BRL",
            unit_price: Number(amount),
          },
        ],
        payer: {
          name: donorName,
        },
        metadata: {
          donor_name: donorName,
          gift_title: title,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const preference = await response.json();
    return NextResponse.json({
      checkoutUrl: preference.init_point,
      preferenceId: preference.id,
      mode: "mercado-pago",
    });
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json({ error: "Erro ao criar checkout." }, { status: 500 });
  }
}
