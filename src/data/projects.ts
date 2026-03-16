import type { ImageVariantSet } from "@/lib/image-variants";

export interface Project {
  /** Slug để dùng cho URL sau này */
  slug: string;

  /** Tiêu đề hiển thị cho project */
  title: string;

  /** Legacy cover URL (medium). Prefer using `cover` variants. */
  src?: string;

  /** Ảnh cover chính của cuộn (đủ small/medium/full). */
  cover: ImageVariantSet;

  /** Ngày bắt đầu chụp cuộn film – ISO string */
  startDate: string;

  /** Ngày kết thúc chụp cuộn film – ISO string */
  endDate: string;

  /** Tên cuộn film (tên roll, film stock, v.v.) */
  filmName: string;

  /** Máy chụp chính được dùng cho cuộn này */
  camera: string;

  /** Địa điểm chính: thành phố, quốc gia */
  location: string;

  /** Người chụp cuộn film */
  photographer: string;

  /** Lab rửa / scan film */
  lab: string;

  /** Số lượng frame trên cuộn (nếu có) */
  framesCount?: number;

  /** Mô tả chi tiết cho cuộn film / series */
  description: string;

  /** Danh sách ảnh trong album (optional, đủ small/medium/full) */
  images?: ImageVariantSet[];
}

export const PROJECTS: Project[] = [
  {
    slug: "maison-de-verre",
    title: "Maison de Verre",
    src: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2019-10-12",
    endDate: "2019-10-12",
    filmName: "Kodak Portra 400",
    camera: "Contax T2",
    location: "Paris, France",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 24,
    description:
      "Soft afternoon light on glass and steel. A quiet study of reflections, depth and small domestic details.",
    images: [
      {
        small: {
          url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=2400&auto=format&fit=crop",
        },
      },
      {
        small: {
          url: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=800&auto=format&fit=crop",
        },
        medium: {
          url: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&auto=format&fit=crop",
        },
        full: {
          url: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=2400&auto=format&fit=crop",
        },
      },
    ],
  },
  {
    slug: "modern-loft",
    title: "Modern Loft",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2020-02-18",
    endDate: "2020-02-18",
    filmName: "Fujifilm Pro 400H",
    camera: "Leica M6",
    location: "Berlin, Germany",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 36,
    description:
      "Concrete, glass and warm wood filmed in late winter light. A roll about open space and quiet geometry.",
  },
  {
    slug: "urban-retreat",
    title: "Urban Retreat",
    src: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2021-05-03",
    endDate: "2021-05-03",
    filmName: "Kodak Ektar 100",
    camera: "Nikon F3",
    location: "Tokyo, Japan",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 36,
    description:
      "A small apartment turned into a quiet retreat. Color blocks, plants and low afternoon sun on surfaces.",
  },
  {
    slug: "coastal-villa",
    title: "Coastal Villa",
    src: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2021-08-22",
    endDate: "2021-08-22",
    filmName: "Kodak Gold 200",
    camera: "Olympus Mju-II",
    location: "Lisbon, Portugal",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 24,
    description:
      "Sea breeze, sunburned concrete and pale blue shadows. A roll about summer architecture by the coast.",
  },
  {
    slug: "minimal-studio",
    title: "Minimal Studio",
    src: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2022-01-14",
    endDate: "2022-01-14",
    filmName: "Ilford HP5 400",
    camera: "Leica M6",
    location: "Ho Chi Minh City, Vietnam",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 36,
    description:
      "Black and white study of a small studio: desks, cables and windows, shot in high contrast winter light.",
  },
  {
    slug: "skyline-penthouse",
    title: "Skyline Penthouse",
    src: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2022-06-09",
    endDate: "2022-06-09",
    filmName: "Cinestill 800T",
    camera: "Contax G2",
    location: "Hong Kong, China",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 24,
    description:
      "Night views over the city, neon leaking into glass and metal. A roll about height, distance and glow.",
  },
  {
    slug: "concrete-residence",
    title: "Concrete Residence",
    src: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2020-11-28",
    endDate: "2020-11-28",
    filmName: "Kodak Tri-X 400",
    camera: "Nikon F3",
    location: "Seoul, South Korea",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 36,
    description:
      "Brut concrete, fog and trees. A quiet black and white walk around a suburban house in late autumn.",
  },
  {
    slug: "brutalist-tower",
    title: "Brutalist Tower",
    src: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1549187774-b4e9b0445b41?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2019-03-02",
    endDate: "2019-03-02",
    filmName: "Ilford FP4 125",
    camera: "Canon AE-1",
    location: "London, United Kingdom",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 24,
    description:
      "A vertical walk up a brutalist tower. Lines, shadows and fog shrinking the city into simple shapes.",
  },
  {
    slug: "forest-cabin",
    title: "Forest Cabin",
    src: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2021-10-01",
    endDate: "2021-10-01",
    filmName: "Kodak Portra 160",
    camera: "Pentax 67",
    location: "Oregon, USA",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 10,
    description:
      "Fog, wood and soft green light. A weekend roll around a cabin hidden between tall pine trees.",
  },
  {
    slug: "glass-pavilion",
    title: "Glass Pavilion",
    src: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2020-04-17",
    endDate: "2020-04-17",
    filmName: "Fujifilm Superia 400",
    camera: "Olympus OM-1",
    location: "Barcelona, Spain",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 36,
    description:
      "Light passing through glass walls and polished stone. A color roll about reflections and repetition.",
  },
  {
    slug: "mountain-chalet",
    title: "Mountain Chalet",
    src: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2022-12-05",
    endDate: "2022-12-05",
    filmName: "Kodak Portra 800",
    camera: "Nikon F100",
    location: "Zermatt, Switzerland",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 24,
    description:
      "Snow, wood and warm windows at night. A roll about shelter and contrast in the middle of winter.",
  },
  {
    slug: "desert-house",
    title: "Desert House",
    src: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=2400&h=1600&auto=format&fit=crop",
    cover: {
      small: {
        url: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=800&h=533&auto=format&fit=crop",
      },
      medium: {
        url: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=1600&h=1067&auto=format&fit=crop",
      },
      full: {
        url: "https://images.unsplash.com/photo-1520256862855-398228c41684?q=80&w=2400&h=1600&auto=format&fit=crop",
      },
    },
    startDate: "2023-05-19",
    endDate: "2023-05-19",
    filmName: "Kodak Gold 200",
    camera: "Contax T2",
    location: "Palm Springs, USA",
    photographer: "Nguyen Phuoc Minh Hieu",
    lab: "Local Lab",
    framesCount: 36,
    description:
      "Harsh noon sun, long shadows and pale pools. A desert house shot in hot, slightly faded color.",
  },
];
