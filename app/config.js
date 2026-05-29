// Configuration file for Bheatriz & Lucas Wedding Website

export const weddingConfig = {
  names: {
    bride: "Bheatriz",
    groom: "Lucas",
    brideShort: "Bhea",
    groomShort: "Lucas",
  },
  event: {
    date: "2026-09-13T16:00:00-03:00", // September 13, 2026 at 4:00 PM (GMT-3)
    venueName: "Haras Pôr do Sol",
    venueAddress: "Av. Pres. Tancredo Neves, Cabedelo - PB, 58102-120",
    mapsLink: "https://maps.app.goo.gl/k1Ua9rXq9rXq9rXq9", // Placeholder maps link
    dressCode: {
      type: "Esporte Fino",
      description: "Para os homens: calça de sarja ou social, camisa de botão, blazer (opcional) e sapato social ou sapatênis. Dispensável o uso de gravata. Para as mulheres: vestidos curtos, midi ou longos fluidos, macacões elegantes ou conjuntos de alfaiataria. Dica: o evento será à tarde, próximo ao pôr do sol, então tecidos leves e fluidos são muito bem-vindos!",
      prohibitedColors: ["Branco", "Off-White", "Pérola", "Marfim"],
    },
    verse: "O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Tudo sofre, tudo crê, tudo espera, tudo suporta. (1 Coríntios 13:4-7)",
  },
  payment: {
    pixKey: "bhea.lucas.casamento@gmail.com", // Placeholder key
    pixHolder: "Bheatriz S. e Lucas O.",
    bank: "Mercado Pago / Banco Central",
    mercadoPagoLink: "https://link.mercadopago.com.br/bhea-e-lucas-casamento", // Placeholder MP link
  },
  admin: {
    password: "casamento2026", // Secret admin panel password
  },
  gifts: [
    {
      id: "honeymoon-flight",
      title: "Cota de Passagens Aéreas",
      description: "Ajude os noivos a decolar rumo à lua de mel dos sonhos.",
      price: 500,
      image: "/images/gift_watercolor_1.png",
      category: "Lua de Mel",
    },
    {
      id: "romantic-dinner",
      title: "Jantar Romântico no Pôr do Sol",
      description: "Um jantar inesquecível à beira-mar com direito a brinde de espumante.",
      price: 250,
      image: "/images/gift_watercolor_2.png",
      category: "Lua de Mel",
    },
    {
      id: "jacare-boat-tour",
      title: "Passeio de Barco no Pôr do Sol do Jacaré",
      description: "Passeio romântico de catamarã ao som do Bolero de Ravel.",
      price: 150,
      image: "/images/gift_watercolor_3.png",
      category: "Lua de Mel",
    },
    {
      id: "espresso-maker",
      title: "Cafeteira de Espresso Italiana",
      description: "Para aquecer as manhãs do novo casal com café fresquinho.",
      price: 350,
      image: "/images/gift_watercolor_4.png",
      category: "Casa Nova",
    },
    {
      id: "kitchen-pot-set",
      title: "Jogo de Panelas Antiaderentes",
      description: "Para os noivos prepararem almoços deliciosos de domingo.",
      price: 450,
      image: "/images/gift_watercolor_5.png",
      category: "Casa Nova",
    },
    {
      id: "crystal-glasses",
      title: "Jogo de Taças de Cristal",
      description: "Para celebrar todas as conquistas e aniversários de casamento.",
      price: 200,
      image: "/images/gift_watercolor_6.png",
      category: "Casa Nova",
    },
    {
      id: "spa-day",
      title: "Dia de SPA para o Casal",
      description: "Uma massagem relaxante pós-casamento para recarregar as energias.",
      price: 300,
      image: "/images/gift_watercolor_7.png",
      category: "Lua de Mel",
    },
    {
      id: "grocery-cota",
      title: "Primeira Compra do Mês",
      description: "Ajude a encher a despensa da nossa casinha nova.",
      price: 180,
      image: "/images/gift_watercolor_8.png",
      category: "Casa Nova",
    },
  ],
  // Mock guest list for the closed RSVP search
  guests: [
    { id: 1, name: "Maria Ferreira", group: "Família Ferreira", allowedCount: 3, companions: ["João Ferreira", "Ana Ferreira"] },
    { id: 2, name: "José Ferreira", group: "Família Ferreira", allowedCount: 3, companions: ["João Ferreira", "Ana Ferreira"] }, // Linked to same family
    { id: 3, name: "Carlos Silva", group: "Família Silva", allowedCount: 2, companions: ["Lucia Silva"] },
    { id: 4, name: "Amanda Souza", group: "Família Souza", allowedCount: 4, companions: ["Ricardo Souza", "Pedro Souza", "Alice Souza"] },
    { id: 5, name: "Clara Santos", group: "Amigos da Bhea", allowedCount: 1, companions: [] },
    { id: 6, name: "Felipe Lima", group: "Amigos do Lucas", allowedCount: 2, companions: ["Beatriz Lima"] },
    { id: 7, name: "Mariana Costa", group: "Amigos da Bhea", allowedCount: 1, companions: [] },
    { id: 8, name: "Rodrigo Almeida", group: "Amigos do Lucas", allowedCount: 2, companions: ["Patrícia Almeida"] },
    { id: 9, name: "Antônio Oliveira", group: "Família Oliveira", allowedCount: 2, companions: ["Francisca Oliveira"] },
    { id: 10, name: "Helena Ribeiro", group: "Amigos do Casal", allowedCount: 2, companions: ["Marcos Ribeiro"] },
    { id: 11, name: "Gabriel Nascimento", group: "Amigos do Casal", allowedCount: 1, companions: [] },
    { id: 12, name: "Juliana Mendes", group: "Amigos da Bhea", allowedCount: 2, companions: ["Thiago Mendes"] },
    { id: 13, name: "Roberto Teixeira", group: "Amigos do Lucas", allowedCount: 1, companions: [] },
  ],
};
