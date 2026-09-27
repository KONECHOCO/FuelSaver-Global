export const initialStations = [
  // MONTICELLI D'ONGINA & PIACENZA AREA (Real MIMIT Stations)
  {
    id: "mimit-monticelli-1",
    name: "Eni Station - SS10 Padana Inferiore",
    brand: "Eni",
    country: "IT",
    city: "Monticelli d'Ongina",
    address: "Strada Statale 10 Padana Inferiore km 184, 29010 Monticelli d'Ongina (PC)",
    lat: 45.087,
    lng: 9.936,
    isSponsored: true,
    sponsoredDiscount: "Sconto 8¢ con Eni Live App",
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.749, served: 1.899 },
      diesel: { self: 1.639, served: 1.789 },
      lpg: { self: 0.719, served: 0.719 },
      methane: { self: 1.299, served: 1.299 },
      ev: { self: 0.58, served: 0.58 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.8,
    reviewsCount: 38,
    amenities: ["coffee", "wash", "wc", "open24", "air", "atm"],
    reviews: [
      { id: "rm1", user: "Giuseppe M.", rating: 5, date: "2026-09-27", text: "Stazione Eni ben fornita sulla SS10, ottimo bar!" }
    ]
  },
  {
    id: "mimit-monticelli-2",
    name: "IP Gruppo API - Via Piacenza",
    brand: "IP",
    country: "IT",
    city: "Monticelli d'Ongina",
    address: "Via Piacenza 14, 29010 Monticelli d'Ongina (PC)",
    lat: 45.083,
    lng: 9.928,
    isSponsored: false,
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.719, served: 1.869 },
      diesel: { self: 1.619, served: 1.769 },
      lpg: { self: 0.699, served: 0.699 },
      methane: null,
      ev: null
    },
    updatedHoursAgo: 2,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.6,
    reviewsCount: 22,
    amenities: ["coffee", "air", "atm"],
    reviews: [
      { id: "rm2", user: "Andrea B.", rating: 5, date: "2026-09-26", text: "Distributore IP vicino al centro paese." }
    ]
  },
  {
    id: "mimit-caorso-1",
    name: "Q8 Easy - Via Cremona (Caorso)",
    brand: "Q8",
    country: "IT",
    city: "Caorso",
    address: "Via Cremona 84, 29017 Caorso (PC)",
    lat: 45.048,
    lng: 9.871,
    isSponsored: false,
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.689, served: 1.839 },
      diesel: { self: 1.589, served: 1.739 },
      lpg: { self: 0.679, served: 0.679 },
      methane: { self: 1.239, served: 1.239 },
      ev: { self: 0.52, served: 0.52 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.9,
    reviewsCount: 54,
    amenities: ["wash", "wc", "open24", "air"],
    reviews: [
      { id: "rm3", user: "Chiara P.", rating: 5, date: "2026-09-27", text: "Prezzo Q8 Easy il più basso della zona tra Caorso e Monticelli!" }
    ]
  },
  {
    id: "mimit-sannazzaro-1",
    name: "Tamoil - Strada Provinciale 462",
    brand: "Tamoil",
    country: "IT",
    city: "Monticelli d'Ongina",
    address: "Strada Provinciale 462, 29010 San Nazzaro, Monticelli d'Ongina (PC)",
    lat: 45.092,
    lng: 9.892,
    isSponsored: false,
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.699, served: 1.849 },
      diesel: { self: 1.599, served: 1.749 },
      lpg: { self: 0.689, served: 0.689 },
      methane: null,
      ev: null
    },
    updatedHoursAgo: 3,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.7,
    reviewsCount: 31,
    amenities: ["coffee", "open24", "air", "atm"],
    reviews: [
      { id: "rm4", user: "Stefano V.", rating: 4, date: "2026-09-25", text: "Distributore Tamoil comodo vicino al Po." }
    ]
  },

  // ROMA (Italy)
  {
    id: "st-roma-1",
    name: "Eni Station - Via Tiburtina",
    brand: "Eni",
    country: "IT",
    city: "Roma",
    address: "Via Tiburtina 540, 00159 Roma (RM)",
    lat: 41.909,
    lng: 12.535,
    isSponsored: true,
    sponsoredDiscount: "Sconto 10¢ con Coupon FUEL10",
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.729, served: 1.889 },
      diesel: { self: 1.639, served: 1.799 },
      lpg: { self: 0.719, served: 0.719 },
      methane: { self: 1.299, served: 1.299 },
      ev: { self: 0.58, served: 0.58 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.8,
    reviewsCount: 34,
    amenities: ["coffee", "wash", "wc", "open24", "air", "atm"],
    reviews: [
      { id: "r1", user: "Giuseppe M.", rating: 5, date: "2026-09-26", text: "Prezzi self bravissimi e bar con ottimi cornetti!" }
    ]
  },
  {
    id: "st-roma-2",
    name: "Q8 Self - Via Salaria",
    brand: "Q8",
    country: "IT",
    city: "Roma",
    address: "Via Salaria 710, 00138 Roma (RM)",
    lat: 41.942,
    lng: 12.508,
    isSponsored: false,
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.709, served: 1.869 },
      diesel: { self: 1.619, served: 1.779 },
      lpg: { self: 0.699, served: 0.699 },
      methane: { self: 1.259, served: 1.259 },
      ev: { self: 0.54, served: 0.54 }
    },
    updatedHoursAgo: 2,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.6,
    reviewsCount: 19,
    amenities: ["wash", "wc", "open24", "air"],
    reviews: [
      { id: "r3", user: "Andrea B.", rating: 5, date: "2026-09-25", text: "Prezzo del diesel più basso di tutta la zona!" }
    ]
  },

  // MILANO (Italy)
  {
    id: "st-milano-1",
    name: "Eni Live Station - Corso Buenos Aires",
    brand: "Eni",
    country: "IT",
    city: "Milano",
    address: "Corso Buenos Aires 88, 20124 Milano (MI)",
    lat: 45.482,
    lng: 9.213,
    isSponsored: true,
    sponsoredDiscount: "Sconto 8¢ con Eni Live App",
    isOfficialMimit: true,
    prices: {
      petrol: { self: 1.739, served: 1.899 },
      diesel: { self: 1.649, served: 1.809 },
      lpg: { self: 0.729, served: 0.729 },
      methane: { self: 1.319, served: 1.319 },
      ev: { self: 0.59, served: 0.59 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Ministero MIMIT (Ufficiale)",
    rating: 4.7,
    reviewsCount: 45,
    amenities: ["coffee", "wash", "wc", "open24", "atm"],
    reviews: [
      { id: "rm1", user: "Stefano T.", rating: 5, date: "2026-09-25", text: "Ottimo servizio self 24 ore su 24." }
    ]
  },

  // MADRID (Spain)
  {
    id: "st-madrid-1",
    name: "Repsol Gasolinera - Paseo de la Castellana",
    brand: "Repsol",
    country: "ES",
    city: "Madrid",
    address: "Paseo de la Castellana 140, 28046 Madrid",
    lat: 40.453,
    lng: -3.688,
    isSponsored: true,
    sponsoredDiscount: "Descuento Waylet 10ct/L",
    prices: {
      petrol: { self: 1.589, served: 1.689 },
      diesel: { self: 1.469, served: 1.569 },
      lpg: { self: 0.899, served: 0.899 },
      methane: { self: 1.199, served: 1.199 },
      ev: { self: 0.45, served: 0.45 }
    },
    updatedHoursAgo: 2,
    updatedBy: "MITECO (Gobierno de España)",
    rating: 4.8,
    reviewsCount: 64,
    amenities: ["coffee", "wash", "wc", "open24", "air", "atm"],
    reviews: [
      { id: "r8", user: "Lucia G.", rating: 5, date: "2026-09-26", text: "¡El descuento de Waylet la convierte en la más barata!" }
    ]
  },

  // BERLIN (Germany)
  {
    id: "st-berlin-1",
    name: "Aral Tankstelle - Friedrichstraße",
    brand: "Aral",
    country: "DE",
    city: "Berlin",
    address: "Friedrichstraße 210, 10969 Berlin",
    lat: 52.504,
    lng: 13.391,
    isSponsored: true,
    sponsoredDiscount: "Aral Pay 5ct/L Rabatt",
    prices: {
      petrol: { self: 1.749, served: 1.749 },
      diesel: { self: 1.629, served: 1.629 },
      lpg: { self: 0.989, served: 0.989 },
      methane: { self: 1.399, served: 1.399 },
      ev: { self: 0.49, served: 0.49 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Tankerkoenig API (Offiziell)",
    rating: 4.7,
    reviewsCount: 28,
    amenities: ["coffee", "wash", "wc", "open24", "air"],
    reviews: [
      { id: "r6", user: "Stefan M.", rating: 5, date: "2026-09-25", text: "Super Bistro mit frischem Kaffee und schnellem Laden." }
    ]
  }
];

export const priceTrendData = [
  { day: "1 Sep", petrol: 1.78, diesel: 1.69 },
  { day: "5 Sep", petrol: 1.77, diesel: 1.68 },
  { day: "10 Sep", petrol: 1.75, diesel: 1.66 },
  { day: "15 Sep", petrol: 1.73, diesel: 1.64 },
  { day: "20 Sep", petrol: 1.71, diesel: 1.62 },
  { day: "25 Sep", petrol: 1.70, diesel: 1.60 },
  { day: "27 Sep", petrol: 1.72, diesel: 1.63 }
];
