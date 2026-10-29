import {
  TODAY,
  addDays,
  quoteTotal,
  scheduledDeliveries,
} from "../lib/domain.js";

export function createSeed() {
  const profile = {
    id: "OF-01",
    name: "Alma Verde",
    owner: "Mariana Solís",
    email: "hola@almaverde.cr",
    phone: "8888-2040",
    description:
      "Comida real, hecha con intención. Creamos planes de alimentación personalizados con ingredientes frescos y de temporada, para que comer bien sea parte de tu día.",
    specialties: ["Vegana", "Sin gluten", "Baja en calorías", "Deportiva"],
    coverage: [
      "San Carlos · Quesada",
      "San Carlos · Aguas Zarcas",
      "San Carlos · Florencia",
    ],
    capacity: 20,
    cancellationHours: 48,
    changeHours: 24,
    terms:
      "Los planes se preparan con ingredientes frescos. El pago se acuerda al confirmar el plan. Entregas de 11:00 a. m. a 2:00 p. m.; retiro en nuestro local de Quesada. Las alergias requieren revisión previa y confirmación del oferente.",
    state: "Activo",
  };
  const preparations = [
    {
      id: "P-01",
      title: "Bowl de quinoa y vegetales",
      description:
        "Quinoa esponjosa, vegetales asados, aguacate y aderezo de limón. Un almuerzo lleno de color y equilibrio.",
      category: "Vegana",
      calories: 420,
      protein: 16,
      carbs: 52,
      fat: 17,
      price: 450000,
      image: "/images/bowl.jpg",
      state: "Activo",
      ingredients: [
        {
          name: "Quinoa",
          exclude: false,
          substitute: true,
          alternative: "Arroz integral",
        },
        {
          name: "Vegetales de temporada",
          exclude: false,
          substitute: true,
          alternative: "Brócoli al vapor",
        },
        {
          name: "Aguacate",
          exclude: true,
          substitute: true,
          alternative: "Hummus",
        },
        {
          name: "Semillas de ajonjolí",
          exclude: true,
          substitute: true,
          alternative: "Semillas de girasol",
        },
      ],
    },
    {
      id: "P-02",
      title: "Pollo al limón con arroz integral",
      description:
        "Pechuga a la plancha con hierbas frescas, arroz integral y vegetales al vapor.",
      category: "Deportiva",
      calories: 510,
      protein: 42,
      carbs: 48,
      fat: 14,
      price: 520000,
      image: "/images/chicken.jpg",
      state: "Activo",
      ingredients: [
        {
          name: "Pechuga de pollo",
          exclude: false,
          substitute: true,
          alternative: "Tofu firme",
        },
        {
          name: "Arroz integral",
          exclude: false,
          substitute: true,
          alternative: "Quinoa",
        },
        {
          name: "Brócoli",
          exclude: true,
          substitute: true,
          alternative: "Zucchini",
        },
        { name: "Limón", exclude: true, substitute: false, alternative: "" },
      ],
    },
    {
      id: "P-03",
      title: "Ensalada mediterránea",
      description:
        "Hojas frescas, garbanzos, tomate cherry y pepino con una vinagreta ligera de hierbas.",
      category: "Baja en calorías",
      calories: 310,
      protein: 12,
      carbs: 34,
      fat: 11,
      price: 390000,
      image: "/images/salad.jpg",
      state: "Activo",
      ingredients: [
        {
          name: "Garbanzos",
          exclude: false,
          substitute: true,
          alternative: "Lentejas",
        },
        {
          name: "Tomate cherry",
          exclude: true,
          substitute: false,
          alternative: "",
        },
        {
          name: "Pepino",
          exclude: true,
          substitute: true,
          alternative: "Zucchini",
        },
        {
          name: "Aceite de oliva",
          exclude: false,
          substitute: false,
          alternative: "",
        },
      ],
    },
    {
      id: "P-04",
      title: "Salmón con vegetales asados",
      description:
        "Filete de salmón al horno acompañado de camote y vegetales de temporada.",
      category: "Sin gluten",
      calories: 490,
      protein: 36,
      carbs: 32,
      fat: 22,
      price: 680000,
      image: "/images/salmon.jpg",
      state: "Activo",
      ingredients: [
        {
          name: "Salmón",
          exclude: false,
          substitute: true,
          alternative: "Pechuga de pollo",
        },
        {
          name: "Camote",
          exclude: false,
          substitute: true,
          alternative: "Papa",
        },
        {
          name: "Vegetales asados",
          exclude: true,
          substitute: true,
          alternative: "Ensalada verde",
        },
      ],
    },
    {
      id: "P-05",
      title: "Pasta de arroz con pesto",
      description:
        "Pasta de arroz con albahaca fresca y un pesto de semillas de girasol, sin frutos secos.",
      category: "Sin gluten",
      calories: 450,
      protein: 14,
      carbs: 62,
      fat: 15,
      price: 470000,
      image: "/images/pasta.jpg",
      state: "Activo",
      ingredients: [
        {
          name: "Pasta de arroz",
          exclude: false,
          substitute: true,
          alternative: "Pasta de maíz",
        },
        {
          name: "Albahaca",
          exclude: false,
          substitute: false,
          alternative: "",
        },
        {
          name: "Semillas de girasol",
          exclude: true,
          substitute: false,
          alternative: "",
        },
      ],
    },
    {
      id: "P-06",
      title: "Bowl de avena y frutos rojos",
      description:
        "Avena cremosa con bebida vegetal, fresas y arándanos de temporada.",
      category: "Vegana",
      calories: 340,
      protein: 10,
      carbs: 48,
      fat: 9,
      price: 320000,
      image: "/images/oats.jpg",
      state: "Inactivo",
      ingredients: [
        {
          name: "Avena",
          exclude: false,
          substitute: true,
          alternative: "Avena certificada sin gluten",
        },
        {
          name: "Frutos rojos",
          exclude: true,
          substitute: true,
          alternative: "Banano",
        },
        {
          name: "Bebida de almendra",
          exclude: false,
          substitute: true,
          alternative: "Bebida de arroz",
        },
      ],
    },
  ];
  const clients = [
    {
      id: "C-01",
      name: "Valentina Rojas",
      email: "valentina.rojas@ejemplo.cr",
      phone: "8888-1101",
      preferences: ["Vegana", "Sin frutos secos"],
      zone: "San Carlos · Quesada",
      color: "rose",
    },
    {
      id: "C-02",
      name: "Andrés Jiménez",
      email: "andres.jimenez@ejemplo.cr",
      phone: "8888-1102",
      preferences: ["Deportiva", "Alta en proteína"],
      zone: "San Carlos · Florencia",
      color: "blue",
    },
    {
      id: "C-03",
      name: "Camila Vargas",
      email: "camila.vargas@ejemplo.cr",
      phone: "8888-1103",
      preferences: ["Sin gluten", "Sin lácteos"],
      zone: "San Carlos · Quesada",
      color: "amber",
    },
    {
      id: "C-04",
      name: "Daniela Mora",
      email: "daniela.mora@ejemplo.cr",
      phone: "8888-1104",
      preferences: ["Baja en calorías"],
      zone: "San Carlos · Aguas Zarcas",
      color: "green",
    },
    {
      id: "C-05",
      name: "Sebastián Castro",
      email: "sebastian.castro@ejemplo.cr",
      phone: "8888-1105",
      preferences: ["Deportiva", "Sin mariscos"],
      zone: "San Carlos · Quesada",
      color: "purple",
    },
  ];
  const requests = [
    {
      id: "SOL-024",
      offererId: profile.id,
      clientId: "C-01",
      sentDate: TODAY,
      duration: 5,
      startDate: "2026-11-02",
      restrictions: ["Vegana"],
      allergies: ["Frutos secos", "Ajonjolí"],
      excluded: ["Semillas de ajonjolí", "Bebida de almendra"],
      preparationIds: ["P-01", "P-03"],
      notes:
        "Me gustaría alternar bowls y ensaladas. Por favor, evitar la contaminación cruzada con frutos secos y ajonjolí.",
      mode: "Domicilio",
      time: "12:00",
      address: "Quesada, 200 m norte del parque central",
      zone: "San Carlos · Quesada",
      state: "Nueva",
    },
    {
      id: "SOL-023",
      offererId: profile.id,
      clientId: "C-02",
      sentDate: TODAY,
      duration: 7,
      startDate: "2026-11-02",
      restrictions: ["Alta en proteína"],
      allergies: [],
      excluded: ["Pepino"],
      preparationIds: ["P-02", "P-04"],
      notes:
        "Busco almuerzos para acompañar mis entrenamientos. Preferencia por pollo y arroz integral.",
      mode: "Retiro",
      time: "11:30",
      address: "Local Alma Verde, Quesada",
      zone: "San Carlos · Florencia",
      state: "Nueva",
    },
    {
      id: "SOL-022",
      offererId: profile.id,
      clientId: "C-03",
      sentDate: "2026-10-28",
      duration: 5,
      startDate: "2026-11-03",
      restrictions: ["Sin gluten", "Sin lácteos"],
      allergies: ["Gluten"],
      excluded: ["Trigo", "Leche"],
      preparationIds: ["P-04", "P-05"],
      notes:
        "Soy celíaca. Necesito utensilios separados para evitar contaminación cruzada.",
      mode: "Domicilio",
      time: "12:30",
      address: "Quesada, barrio El Carmen",
      zone: "San Carlos · Quesada",
      state: "En revisión",
    },
    {
      id: "SOL-021",
      offererId: profile.id,
      clientId: "C-04",
      sentDate: "2026-10-28",
      duration: 4,
      startDate: "2026-11-02",
      restrictions: ["Baja en calorías"],
      allergies: [],
      excluded: [],
      preparationIds: ["P-03", "P-02"],
      notes: "Almuerzos ligeros con variedad de vegetales.",
      mode: "Domicilio",
      time: "13:00",
      address: "Aguas Zarcas, centro",
      zone: "San Carlos · Aguas Zarcas",
      state: "Cotizada",
    },
  ];
  const linesFor = (prep, qty) => [
    {
      preparationId: prep.id,
      title: prep.title,
      qty,
      base: prep.price,
      adjustment: 0,
      special: 0,
      modifications: "Preparación base",
      ingredientSnapshot: structuredClone(prep.ingredients),
    },
  ];
  const quotes = [
    {
      id: "COT-021",
      requestId: "SOL-021",
      clientId: "C-04",
      offererId: profile.id,
      issuedDate: "2026-10-28",
      validUntil: "2026-11-01",
      startDate: "2026-11-02",
      duration: 4,
      lines: linesFor(preparations[2], 4),
      mode: "Domicilio",
      time: "13:00",
      address: "Aguas Zarcas, centro",
      zone: "San Carlos · Aguas Zarcas",
      state: "Enviada",
      policies: structuredClone(profile),
    },
  ];
  quotes[0].total = quoteTotal(quotes[0].lines);
  const agreements = [];
  const deliveries = [];
  const starts = [
    "2026-02-10",
    "2026-05-04",
    "2026-09-01",
    "2026-10-01",
    "2026-10-08",
    "2026-10-15",
    "2026-10-22",
    "2026-10-27",
    "2026-10-28",
  ];
  starts.forEach((startDate, index) => {
    clients.forEach((client, ci) => {
      if (index < 3 && ci > 2) return;
      const num = String(index * 5 + ci + 1).padStart(3, "0");
      const prep = preparations[[0, 1, 4, 2, 3][ci]];
      const duration = index >= 7 ? 5 : 4;
      const requestId = `SOL-H${num}`;
      const quoteId = `COT-H${num}`;
      const agreementId = `AC-${num}`;
      requests.push({
        id: requestId,
        offererId: profile.id,
        clientId: client.id,
        sentDate: addDays(startDate, -3),
        duration,
        startDate,
        restrictions: client.preferences,
        allergies: ci === 2 ? ["Gluten"] : [],
        excluded: [],
        preparationIds: [prep.id],
        notes: "Plan personalizado confirmado con el cliente.",
        mode: ci % 2 ? "Retiro" : "Domicilio",
        time: ["11:30", "12:00", "12:30", "13:00", "13:30"][ci],
        address:
          ci % 2
            ? "Local Alma Verde, Quesada"
            : `${client.zone}, dirección confirmada`,
        zone: client.zone,
        state: "Aceptada",
      });
      const request = requests.at(-1);
      const quote = {
        id: quoteId,
        requestId,
        clientId: client.id,
        offererId: profile.id,
        issuedDate: request.sentDate,
        validUntil: addDays(startDate, -1),
        startDate,
        duration,
        lines: linesFor(prep, duration),
        mode: request.mode,
        time: request.time,
        address: request.address,
        zone: client.zone,
        state: "Aceptada",
        policies: structuredClone(profile),
      };
      quote.total = quoteTotal(quote.lines);
      quotes.push(quote);
      const entries = scheduledDeliveries(quote, agreementId).map((d) => ({
        ...d,
        state:
          d.date < TODAY
            ? "Entregado"
            : d.date === TODAY
              ? ci === 0
                ? "Listo para entrega"
                : ci < 3
                  ? "En preparación"
                  : "Pendiente"
              : "Pendiente",
      }));
      deliveries.push(...entries);
      agreements.push({
        id: agreementId,
        quoteId,
        requestId,
        clientId: client.id,
        startDate,
        endDate: addDays(startDate, duration - 1),
        mode: quote.mode,
        total: quote.total,
      });
    });
  });
  return {
    profile,
    preparations,
    clients,
    requests,
    quotes,
    agreements,
    deliveries,
    readNotifications: false,
  };
}
