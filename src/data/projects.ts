export interface Project {
  /** Slug để dùng cho URL sau này */
  slug: string;
  /** Tên cuộn film */
  title: string;
  /** Loại series / category rộng hơn (architecture, interior, travel, ...) */
  category: string;
  /** Ảnh cover chính của cuộn */
  src: string;

  /** Ngày chụp – ISO string để dễ format */
  shotDate: string;
  /** Địa điểm chính: thành phố, quốc gia */
  location: string;

  /** Thông tin nhiếp ảnh */
  filmStock: string;
  camera: string;
  isColor: boolean;

  /** Mô tả ngắn cho Lightbox */
  shortDescription: string;

  /** Thông tin phụ (không bắt buộc) */
  framesCount?: number;
  tags?: string[];
}

export const PROJECTS: Project[] = [
  {
    slug: "maison-de-verre",
    title: "Maison de Verre",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2019-10-12",
    location: "Paris, France",
    filmStock: "Kodak Portra 400",
    camera: "Contax T2",
    isColor: true,
    shortDescription:
      "Soft afternoon light on glass and steel. A quiet study of reflections, depth and small domestic details.",
    framesCount: 24,
    tags: ["architecture", "interior", "daylight"],
  },
  {
    slug: "modern-loft",
    title: "Modern Loft",
    category: "Interior",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2020-02-18",
    location: "Berlin, Germany",
    filmStock: "Fujifilm Pro 400H",
    camera: "Leica M6",
    isColor: true,
    shortDescription:
      "Concrete, glass and warm wood filmed in late winter light. A roll about open space and quiet geometry.",
    framesCount: 36,
    tags: ["interior", "minimal", "concrete"],
  },
  {
    slug: "urban-retreat",
    title: "Urban Retreat",
    category: "Design",
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2021-05-03",
    location: "Tokyo, Japan",
    filmStock: "Kodak Ektar 100",
    camera: "Nikon F3",
    isColor: true,
    shortDescription:
      "A small apartment turned into a quiet retreat. Color blocks, plants and low afternoon sun on surfaces.",
    framesCount: 36,
    tags: ["apartment", "plants", "color"],
  },
  {
    slug: "coastal-villa",
    title: "Coastal Villa",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2021-08-22",
    location: "Lisbon, Portugal",
    filmStock: "Kodak Gold 200",
    camera: "Olympus Mju-II",
    isColor: true,
    shortDescription:
      "Sea breeze, sunburned concrete and pale blue shadows. A roll about summer architecture by the coast.",
    framesCount: 24,
    tags: ["coast", "summer", "architecture"],
  },
  {
    slug: "minimal-studio",
    title: "Minimal Studio",
    category: "Interior",
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2022-01-14",
    location: "Ho Chi Minh City, Vietnam",
    filmStock: "Ilford HP5 400",
    camera: "Leica M6",
    isColor: false,
    shortDescription:
      "Black and white study of a small studio: desks, cables and windows, shot in high contrast winter light.",
    framesCount: 36,
    tags: ["studio", "bw", "workspace"],
  },
  {
    slug: "skyline-penthouse",
    title: "Skyline Penthouse",
    category: "Interior",
    src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2022-06-09",
    location: "Hong Kong, China",
    filmStock: "Cinestill 800T",
    camera: "Contax G2",
    isColor: true,
    shortDescription:
      "Night views over the city, neon leaking into glass and metal. A roll about height, distance and glow.",
    framesCount: 24,
    tags: ["night", "city", "neon"],
  },
  {
    slug: "concrete-residence",
    title: "Concrete Residence",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2020-11-28",
    location: "Seoul, South Korea",
    filmStock: "Kodak Tri-X 400",
    camera: "Nikon F3",
    isColor: false,
    shortDescription:
      "Brut concrete, fog and trees. A quiet black and white walk around a suburban house in late autumn.",
    framesCount: 36,
    tags: ["concrete", "bw", "suburban"],
  },
  {
    slug: "brutalist-tower",
    title: "Brutalist Tower",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2019-03-02",
    location: "London, United Kingdom",
    filmStock: "Ilford FP4 125",
    camera: "Canon AE-1",
    isColor: false,
    shortDescription:
      "A vertical walk up a brutalist tower. Lines, shadows and fog shrinking the city into simple shapes.",
    framesCount: 24,
    tags: ["brutalism", "tower", "bw"],
  },
  {
    slug: "forest-cabin",
    title: "Forest Cabin",
    category: "Retreat",
    src: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2021-10-01",
    location: "Oregon, USA",
    filmStock: "Kodak Portra 160",
    camera: "Pentax 67",
    isColor: true,
    shortDescription:
      "Fog, wood and soft green light. A weekend roll around a cabin hidden between tall pine trees.",
    framesCount: 10,
    tags: ["forest", "cabin", "mist"],
  },
  {
    slug: "glass-pavilion",
    title: "Glass Pavilion",
    category: "Design",
    src: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2020-04-17",
    location: "Barcelona, Spain",
    filmStock: "Fujifilm Superia 400",
    camera: "Olympus OM-1",
    isColor: true,
    shortDescription:
      "Light passing through glass walls and polished stone. A color roll about reflections and repetition.",
    framesCount: 36,
    tags: ["glass", "pavilion", "reflection"],
  },
  {
    slug: "mountain-chalet",
    title: "Mountain Chalet",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2022-12-05",
    location: "Zermatt, Switzerland",
    filmStock: "Kodak Portra 800",
    camera: "Nikon F100",
    isColor: true,
    shortDescription:
      "Snow, wood and warm windows at night. A roll about shelter and contrast in the middle of winter.",
    framesCount: 24,
    tags: ["snow", "chalet", "night"],
  },
  {
    slug: "desert-house",
    title: "Desert House",
    category: "Architecture",
    src: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=2400&h=1600&auto=format&fit=crop",
    shotDate: "2023-05-19",
    location: "Palm Springs, USA",
    filmStock: "Kodak Gold 200",
    camera: "Contax T2",
    isColor: true,
    shortDescription:
      "Harsh noon sun, long shadows and pale pools. A desert house shot in hot, slightly faded color.",
    framesCount: 36,
    tags: ["desert", "mid-century", "pool"],
  },
];
