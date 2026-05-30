export const weddingConfig = {
  names: {
    bride: "Bheatriz",
    groom: "Lucas",
    brideShort: "Bhea",
    groomShort: "Lucas",
  },
  event: {
    date: "2026-09-13T14:30:00-03:00",
    arrivalTime: "14:20",
    venueName: "Haras Por do Sol",
    venueAddress: "Cabedelo - PB",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Haras%20Por%20do%20Sol%20Cabedelo%20PB",
    wazeLink: "https://waze.com/ul?q=Haras%20Por%20do%20Sol%20Cabedelo%20PB&navigate=yes",
    dressCode: {
      type: "Esporte fino",
      description:
        "O casamento sera a tarde, em clima de campo. Tecidos leves, tons suaves e roupas confortaveis combinam muito bem com a celebracao.",
      prohibitedColors: ["Branco", "Off-white", "Perola", "Marfim"],
    },
    verse:
      "Mas, alem de todas essas coisas, revistam-se de amor, pois e o perfeito vinculo de uniao. (Colossenses 3:14)",
  },
  payment: {
    pixKey: "substitua-pela-chave-pix",
    pixHolder: "Bheatriz e Lucas",
    bank: "Pix",
    mercadoPagoLink: "https://www.mercadopago.com.br/",
  },
  admin: {
    password: process.env.ADMIN_PASSWORD || "casamento2026",
  },
  gifts: [
    {
      id: "jantar-romantico",
      title: "Jantar romantico em Sao Miguel do Gostoso",
      description: "Uma noite especial para os noivos brindarem o comeco da vida a dois.",
      price: 250,
      image: "/images/gift_watercolor_1.png",
      category: "Lua de Mel",
    },
    {
      id: "passeio-casal",
      title: "Passeio de lua de mel",
      description: "Uma experiencia tranquila, bonita e cheia de memoria boa.",
      price: 180,
      image: "/images/gift_watercolor_2.png",
      category: "Lua de Mel",
    },
    {
      id: "cafe-manha",
      title: "Cafe da manha dos recem-casados",
      description: "Para comecar um dos dias da viagem com carinho e calma.",
      price: 120,
      image: "/images/gift_watercolor_3.png",
      category: "Lua de Mel",
    },
    {
      id: "casa-nova",
      title: "Cota para a casa nova",
      description: "Um carinho simbolico para ajudar nos primeiros detalhes do lar.",
      price: 200,
      image: "/images/gift_watercolor_4.png",
      category: "Casa Nova",
    },
  ],
  guests: [
    {
      id: 1,
      name: "Mariana Ferreira",
      group: "Familia Ferreira",
      allowedCount: 3,
      companions: ["Joao Ferreira", "Ana Ferreira"],
    },
    {
      id: 2,
      name: "Carlos Almeida",
      group: "Familia Almeida",
      allowedCount: 4,
      companions: ["Patricia Almeida", "Lucas Almeida", "Clara Almeida"],
    },
    {
      id: 3,
      name: "Beatriz Lima",
      group: "Amigos da Bhea",
      allowedCount: 2,
      companions: ["Rafaela Lima"],
    },
    {
      id: 4,
      name: "Gabriel Nascimento",
      group: "Amigos do Lucas",
      allowedCount: 1,
      companions: [],
    },
    {
      id: 5,
      name: "Helena e Marcos Ribeiro",
      group: "Familia Ribeiro",
      allowedCount: 2,
      companions: ["Marcos Ribeiro"],
    },
  ],
};
