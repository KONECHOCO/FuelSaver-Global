export const initialStations = [
  // MONTICELLI D'ONGINA & PIACENZA AREA (Real Prices from OpenCarburanti)
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
      petrol: { self: 2.146, served: 2.296 },
      diesel: { self: 2.326, served: 2.476 },
      lpg: { self: 0.750, served: 0.750 },
      methane: { self: 1.741, served: 1.741 },
      ev: { self: 0.58, served: 0.58 }
    },
    updatedHoursAgo: 1,
    updatedBy: "OpenCarburanti / MIMIT (Ufficiale)",
    rating: 4.8,
    reviewsCount: 38,
    amenities: ["coffee", "wash", "wc", "open24", "air", "atm"],
    reviews: [
      { id: "rm1", user: "Giuseppe M.", rating: 5, date: "2026-09-27", text: "Stazione Eni ben fornita sulla SS10, ottimo bar!" }
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
      petrol: { self: 2.089, served: 2.239 },
      diesel: { self: 2.269, served: 2.419 },
      lpg: { self: 0.730, served: 0.730 },
      methane: { self: 1.699, served: 1.699 },
      ev: { self: 0.52, served: 0.52 }
    },
    updatedHoursAgo: 1,
    updatedBy: "OpenCarburanti / MIMIT (Ufficiale)",
    rating: 4.9,
    reviewsCount: 54,
    amenities: ["wash", "wc", "open24", "air"],
    reviews: [
      { id: "rm3", user: "Chiara P.", rating: 5, date: "2026-09-27", text: "Prezzo Q8 Easy il più basso della zona tra Caorso e Monticelli!" }
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
      petrol: { self: 2.129, served: 2.279 },
      diesel: { self: 2.309, served: 2.459 },
      lpg: { self: 0.745, served: 0.745 },
      methane: null,
      ev: null
    },
    updatedHoursAgo: 2,
    updatedBy: "OpenCarburanti / MIMIT (Ufficiale)",
    rating: 4.6,
    reviewsCount: 22,
    amenities: ["coffee", "air", "atm"],
    reviews: [
      { id: "rm2", user: "Andrea B.", rating: 5, date: "2026-09-26", text: "Distributore IP vicino al centro paese." }
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
      petrol: { self: 2.109, served: 2.259 },
      diesel: { self: 2.289, served: 2.439 },
      lpg: { self: 0.739, served: 0.739 },
      methane: null,
      ev: null
    },
    updatedHoursAgo: 3,
    updatedBy: "OpenCarburanti / MIMIT (Ufficiale)",
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
      petrol: { self: 2.146, served: 2.296 },
      diesel: { self: 2.326, served: 2.476 },
      lpg: { self: 0.750, served: 0.750 },
      methane: { self: 1.741, served: 1.741 },
      ev: { self: 0.58, served: 0.58 }
    },
    updatedHoursAgo: 1,
    updatedBy: "OpenCarburanti / MIMIT (Ufficiale)",
    rating: 4.8,
    reviewsCount: 34,
    amenities: ["coffee", "wash", "wc", "open24", "air", "atm"],
    reviews: [
      { id: "r1", user: "Giuseppe M.", rating: 5, date: "2026-09-26", text: "Prezzi self bravissimi e bar con ottimi cornetti!" }
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
      petrol: { self: 2.159, served: 2.309 },
      diesel: { self: 2.339, served: 2.489 },
      lpg: { self: 0.760, served: 0.760 },
      methane: { self: 1.750, served: 1.750 },
      ev: { self: 0.59, served: 0.59 }
    },
    updatedHoursAgo: 1,
    updatedBy: "OpenCarburanti / MIMIT (Ufficiale)",
    rating: 4.7,
    reviewsCount: 45,
    amenities: ["coffee", "wash", "wc", "open24", "atm"],
    reviews: [
      { id: "rm1", user: "Stefano T.", rating: 5, date: "2026-09-25", text: "Ottimo servizio self 24 ore su 24." }
    ]
  }
];

export const priceTrendData = [
  { day: "1 Sep", petrol: 1.98, diesel: 2.10 },
  { day: "5 Sep", petrol: 2.02, diesel: 2.15 },
  { day: "10 Sep", petrol: 2.06, diesel: 2.21 },
  { day: "15 Sep", petrol: 2.10, diesel: 2.27 },
  { day: "20 Sep", petrol: 2.12, diesel: 2.30 },
  { day: "25 Sep", petrol: 2.14, diesel: 2.31 },
  { day: "27 Sep", petrol: 2.146, diesel: 2.326 }
];
