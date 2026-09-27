export const initialStations = [
  // ROMA (Italy)
  {
    id: "st-roma-1",
    name: "Eni Station - Via Tiburtina",
    brand: "Eni",
    country: "IT",
    city: "Roma",
    address: "Via Tiburtina 540, 00159 Roma",
    lat: 41.909,
    lng: 12.535,
    isSponsored: true,
    sponsoredDiscount: "Sconto 10¢ con Coupon FUEL10",
    prices: {
      petrol: { self: 1.729, served: 1.889 },
      diesel: { self: 1.639, served: 1.799 },
      lpg: { self: 0.719, served: 0.719 },
      methane: { self: 1.299, served: 1.299 },
      ev: { self: 0.58, served: 0.58 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Marco_88",
    rating: 4.8,
    reviewsCount: 34,
    amenities: ["coffee", "wash", "wc", "open24", "air", "atm"],
    reviews: [
      { id: "r1", user: "Giuseppe M.", rating: 5, date: "2026-09-26", text: "Prezzi self bravissimi e bar con ottimi cornetti!" },
      { id: "r2", user: "Elena R.", rating: 4, date: "2026-09-24", text: "Stazione pulita e colonnina EV ultrarapida da 150kW." }
    ]
  },
  {
    id: "st-roma-2",
    name: "Q8 Self - Via Salaria",
    brand: "Q8",
    country: "IT",
    city: "Roma",
    address: "Via Salaria 710, 00138 Roma",
    lat: 41.942,
    lng: 12.508,
    isSponsored: false,
    prices: {
      petrol: { self: 1.709, served: 1.869 },
      diesel: { self: 1.619, served: 1.779 },
      lpg: { self: 0.699, served: 0.699 },
      methane: { self: 1.259, served: 1.259 },
      ev: { self: 0.54, served: 0.54 }
    },
    updatedHoursAgo: 2,
    updatedBy: "Sara_V",
    rating: 4.6,
    reviewsCount: 19,
    amenities: ["wash", "wc", "open24", "air"],
    reviews: [
      { id: "r3", user: "Andrea B.", rating: 5, date: "2026-09-25", text: "Prezzo del diesel più basso di tutta la zona!" }
    ]
  },
  {
    id: "st-roma-3",
    name: "Tamoil Express - Tangenziale Est",
    brand: "Tamoil",
    country: "IT",
    city: "Roma",
    address: "Circonvallazione Tiburtina 90, Roma",
    lat: 41.898,
    lng: 12.525,
    isSponsored: false,
    prices: {
      petrol: { self: 1.689, served: 1.839 },
      diesel: { self: 1.589, served: 1.739 },
      lpg: { self: 0.679, served: 0.679 },
      methane: { self: 1.239, served: 1.239 },
      ev: { self: 0.52, served: 0.52 }
    },
    updatedHoursAgo: 3,
    updatedBy: "FuelScout_Italy",
    rating: 4.9,
    reviewsCount: 52,
    amenities: ["coffee", "wash", "open24", "air", "atm"],
    reviews: [
      { id: "r5", user: "Chiara M.", rating: 5, date: "2026-09-26", text: "Prezzo eccezionale! Risparmiato quasi 5€ a pieno." }
    ]
  },
  {
    id: "st-roma-4",
    name: "IP Gruppo API - Corso Francia",
    brand: "IP",
    country: "IT",
    city: "Roma",
    address: "Corso Francia 182, 00191 Roma",
    lat: 41.938,
    lng: 12.469,
    isSponsored: false,
    prices: {
      petrol: { self: 1.799, served: 1.949 },
      diesel: { self: 1.719, served: 1.859 },
      lpg: { self: 0.749, served: 0.749 },
      methane: null,
      ev: null
    },
    updatedHoursAgo: 6,
    updatedBy: "Luca_P",
    rating: 3.9,
    reviewsCount: 12,
    amenities: ["coffee", "atm"],
    reviews: [
      { id: "r4", user: "Fabio K.", rating: 3, date: "2026-09-21", text: "Un po' caro sul servito ma il barista è molto gentile." }
    ]
  },

  // MILANO (Italy)
  {
    id: "st-milano-1",
    name: "Eni Live Station - Corso Buenos Aires",
    brand: "Eni",
    country: "IT",
    city: "Milano",
    address: "Corso Buenos Aires 88, 20124 Milano",
    lat: 45.482,
    lng: 9.213,
    isSponsored: true,
    sponsoredDiscount: "Sconto 8¢ con Eni Live App",
    prices: {
      petrol: { self: 1.739, served: 1.899 },
      diesel: { self: 1.649, served: 1.809 },
      lpg: { self: 0.729, served: 0.729 },
      methane: { self: 1.319, served: 1.319 },
      ev: { self: 0.59, served: 0.59 }
    },
    updatedHoursAgo: 1,
    updatedBy: "Matteo_MI",
    rating: 4.7,
    reviewsCount: 45,
    amenities: ["coffee", "wash", "wc", "open24", "atm"],
    reviews: [
      { id: "rm1", user: "Stefano T.", rating: 5, date: "2026-09-25", text: "Ottimo servizio self 24 ore su 24." }
    ]
  },
  {
    id: "st-milano-2",
    name: "Q8 Easy - Viale Monza",
    brand: "Q8",
    country: "IT",
    city: "Milano",
    address: "Viale Monza 145, 20127 Milano",
    lat: 45.498,
    lng: 9.222,
    isSponsored: false,
    prices: {
      petrol: { self: 1.699, served: 1.849 },
      diesel: { self: 1.609, served: 1.759 },
      lpg: { self: 0.699, served: 0.699 },
      methane: null,
      ev: null
    },
    updatedHoursAgo: 2,
    updatedBy: "Giulia_Design",
    rating: 4.8,
    reviewsCount: 29,
    amenities: ["wash", "air", "atm"],
    reviews: [
      { id: "rm2", user: "Paolo R.", rating: 5, date: "2026-09-26", text: "Prezzi imbattibili su Viale Monza." }
    ]
  },

  // NAPOLI (Italy)
  {
    id: "st-napoli-1",
    name: "IP Carburanti - Via Marina",
    brand: "IP",
    country: "IT",
    city: "Napoli",
    address: "Via Nuova Marina 12, 80133 Napoli",
    lat: 40.844,
    lng: 14.263,
    isSponsored: false,
    prices: {
      petrol: { self: 1.679, served: 1.829 },
      diesel: { self: 1.579, served: 1.729 },
      lpg: { self: 0.679, served: 0.679 },
      methane: { self: 1.219, served: 1.219 },
      ev: { self: 0.51, served: 0.51 }
    },
    updatedHoursAgo: 3,
    updatedBy: "Ciro_Napoli",
    rating: 4.9,
    reviewsCount: 68,
    amenities: ["coffee", "open24", "air"],
    reviews: [
      { id: "rn1", user: "Gennaro V.", rating: 5, date: "2026-09-26", text: "Il miglior prezzo di Napoli centro!" }
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
    updatedBy: "Carlos_M",
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
    updatedBy: "Hans_K",
    rating: 4.7,
    reviewsCount: 28,
    amenities: ["coffee", "wash", "wc", "open24", "air"],
    reviews: [
      { id: "r6", user: "Stefan M.", rating: 5, date: "2026-09-25", text: "Super Bistro mit frischem Kaffee und schnellem Laden." }
    ]
  },

  // PARIS (France)
  {
    id: "st-paris-1",
    name: "Shell Station - Champs-Élysées",
    brand: "Shell",
    country: "FR",
    city: "Paris",
    address: "Avenue des Champs-Élysées 112, 75008 Paris",
    lat: 48.871,
    lng: 2.304,
    isSponsored: false,
    prices: {
      petrol: { self: 1.829, served: 1.959 },
      diesel: { self: 1.719, served: 1.849 },
      lpg: { self: 0.949, served: 0.949 },
      methane: null,
      ev: { self: 0.55, served: 0.55 }
    },
    updatedHoursAgo: 4,
    updatedBy: "Jean_P",
    rating: 4.2,
    reviewsCount: 41,
    amenities: ["coffee", "wc", "open24", "atm"],
    reviews: [
      { id: "r7", user: "Claire D.", rating: 4, date: "2026-09-24", text: "Très pratique en plein centre de Paris." }
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
