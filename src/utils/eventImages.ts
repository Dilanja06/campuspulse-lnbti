export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  Technical: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  Sports: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  'Sports & Recreation': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  Cultural: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80',
  'Cultural & Arts': 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80',
  Academic: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  'Community Service': 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  Workshop: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
};

export const EVENT_COVER_PRESETS = [
  {
    label: 'Campus Sports & Games',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'AI & Hackathon',
    category: 'Technical',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Leadership Gala & Summit',
    category: 'Community Service',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Theatre & Music Festival',
    category: 'Cultural',
    url: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Research & Academic Seminar',
    category: 'Academic',
    url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Futsal & Outdoor Field',
    category: 'Sports',
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
  },
];

export function getEventCoverImage(item?: { image_url?: string; category?: string; title?: string } | null): string {
  if (item?.image_url && item.image_url.trim().length > 0) {
    return item.image_url;
  }
  if (item?.category && DEFAULT_CATEGORY_IMAGES[item.category]) {
    return DEFAULT_CATEGORY_IMAGES[item.category];
  }
  return 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80';
}
