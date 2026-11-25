export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  'Technical Workshop': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
  'Technical & Engineering': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  Sports: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  'Sports & Athletics': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
  'Sports & Recreation': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  Cultural: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
  'Cultural & Arts': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  Academic: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  'Community Service': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  Workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  'Workshop & Clinic': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
};

export interface EventImagePair {
  cover: string;
  flyer: string;
}

export const KNOWN_EVENT_IMAGES: Record<string, EventImagePair> = {
  // Event 1: Indoor Games Day
  'evt-1': {
    cover: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-041': {
    cover: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  },

  // Event 2: HackUCSC AI Hackathon
  'evt-2': {
    cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-088': {
    cover: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
  },

  // Event 3: Rotaract Leadership Summit & Gala
  'evt-3': {
    cover: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-015': {
    cover: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80',
  },

  // Event 4: Drama Society Theatre Night
  'evt-4': {
    cover: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-092': {
    cover: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
  },

  // Event 5: Research Methodology & LaTeX Workshop
  'evt-5': {
    cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-104': {
    cover: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
  },

  // Event 6: Inter-Faculty Debate Series
  'evt-6': {
    cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-033': {
    cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
  },

  // Event 7: Inter-Faculty Futsal Cup
  'evt-7': {
    cover: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-049': {
    cover: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80',
  },

  // Event 8: Freshers Sports Orientation
  'evt-8': {
    cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },
  'EVT-2026-018': {
    cover: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
  },

  // Proposals
  'PROP-1084': {
    cover: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=800&q=80',
  },
  'PROP-1094': {
    cover: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
  },
  'PROP-1099': {
    cover: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
  },
  'PROP-1096': {
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
  },
  'PROP-1091': {
    cover: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?auto=format&fit=crop&w=800&q=80',
  },
  'PROP-1062': {
    cover: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  },
  'PROP-1098': {
    cover: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
    flyer: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
  },
};

export const EVENT_COVER_PRESETS = [
  {
    label: 'Campus Sports & Games',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'AI & Hackathon',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Leadership Gala & Summit',
    category: 'Community Service',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Theatre & Music Festival',
    category: 'Cultural',
    url: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Research & Academic Seminar',
    category: 'Academic',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Futsal & Outdoor Field',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Robotics & Prototyping',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Table Tennis Open',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80',
  },
];

export function getEventCoverImage(item?: { id?: string; code?: string; image_url?: string; category?: string; title?: string } | null): string {
  if (item?.image_url && item.image_url.trim().length > 0) {
    return item.image_url;
  }
  if (item?.id && KNOWN_EVENT_IMAGES[item.id]) {
    return KNOWN_EVENT_IMAGES[item.id].cover;
  }
  if (item?.code && KNOWN_EVENT_IMAGES[item.code]) {
    return KNOWN_EVENT_IMAGES[item.code].cover;
  }

  // Match by title keywords
  const title = (item?.title || '').toLowerCase();
  if (title.includes('indoor games')) return KNOWN_EVENT_IMAGES['evt-1'].cover;
  if (title.includes('hackucsc') || title.includes('hackathon')) return KNOWN_EVENT_IMAGES['evt-2'].cover;
  if (title.includes('leadership') || title.includes('gala') || title.includes('rotaract')) return KNOWN_EVENT_IMAGES['evt-3'].cover;
  if (title.includes('theatre') || title.includes('drama')) return KNOWN_EVENT_IMAGES['evt-4'].cover;
  if (title.includes('research') || title.includes('latex')) return KNOWN_EVENT_IMAGES['evt-5'].cover;
  if (title.includes('debate')) return KNOWN_EVENT_IMAGES['evt-6'].cover;
  if (title.includes('futsal')) return KNOWN_EVENT_IMAGES['evt-7'].cover;
  if (title.includes('sports orientation') || title.includes('freshers')) return KNOWN_EVENT_IMAGES['evt-8'].cover;
  if (title.includes('athletics')) return KNOWN_EVENT_IMAGES['PROP-1084'].cover;
  if (title.includes('robotics')) return KNOWN_EVENT_IMAGES['PROP-1094'].cover;
  if (title.includes('table tennis')) return KNOWN_EVENT_IMAGES['PROP-1098'].cover;
  if (title.includes('badminton')) return KNOWN_EVENT_IMAGES['PROP-1091'].cover;

  if (item?.category && DEFAULT_CATEGORY_IMAGES[item.category]) {
    return DEFAULT_CATEGORY_IMAGES[item.category];
  }
  return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80';
}

export function getEventFlyerImage(item?: { id?: string; code?: string; image_url?: string; category?: string; title?: string } | null): string {
  if (item?.id && KNOWN_EVENT_IMAGES[item.id]) {
    return KNOWN_EVENT_IMAGES[item.id].flyer;
  }
  if (item?.code && KNOWN_EVENT_IMAGES[item.code]) {
    return KNOWN_EVENT_IMAGES[item.code].flyer;
  }

  const title = (item?.title || '').toLowerCase();
  if (title.includes('indoor games')) return KNOWN_EVENT_IMAGES['evt-1'].flyer;
  if (title.includes('hackucsc') || title.includes('hackathon')) return KNOWN_EVENT_IMAGES['evt-2'].flyer;
  if (title.includes('leadership') || title.includes('gala') || title.includes('rotaract')) return KNOWN_EVENT_IMAGES['evt-3'].flyer;
  if (title.includes('theatre') || title.includes('drama')) return KNOWN_EVENT_IMAGES['evt-4'].flyer;
  if (title.includes('research') || title.includes('latex')) return KNOWN_EVENT_IMAGES['evt-5'].flyer;
  if (title.includes('debate')) return KNOWN_EVENT_IMAGES['evt-6'].flyer;
  if (title.includes('futsal')) return KNOWN_EVENT_IMAGES['evt-7'].flyer;
  if (title.includes('sports orientation')) return KNOWN_EVENT_IMAGES['evt-8'].flyer;

  if (item?.image_url && item.image_url.trim().length > 0) {
    return item.image_url;
  }

  return getEventCoverImage(item);
}
