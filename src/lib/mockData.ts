export interface Event {
  id: string;
  name: string;
  description: string;
  organizer: string;
  organizerAvatar: string;
  date: string;
  time: string;
  location: string;
  city: string;
  industry: string;
  capacity: number;
  attendees: number;
  coverImage: string;
  isFree: boolean;
  price?: number;
  tags: string[];
}

export const CITIES = ["San Francisco", "New York", "Austin", "Chicago", "Los Angeles", "Seattle", "Miami", "Denver"];
export const INDUSTRIES = ["Tech", "Design", "Marketing", "Finance", "Healthcare", "Education", "Startups", "AI & ML"];

export const mockEvents: Event[] = [
  {
    id: "1",
    name: "SF Tech Mixer: AI & The Future of Work",
    description: "Join 150+ tech professionals for an evening of networking, lightning talks, and great conversations about how AI is reshaping the workplace. We'll have speakers from leading AI companies sharing their insights, followed by an open networking session with food and drinks.\n\nWhether you're a founder, engineer, designer, or product manager — this is your chance to connect with like-minded professionals and explore what's next.",
    organizer: "Bay Area Tech Network",
    organizerAvatar: "",
    date: "2026-04-25",
    time: "6:00 PM - 9:00 PM",
    location: "The Innovation Hub, 234 Market St",
    city: "San Francisco",
    industry: "Tech",
    capacity: 150,
    attendees: 112,
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=340&fit=crop",
    price: 15,
    tags: ["AI", "Networking", "Tech"],
  },
  {
    id: "2",
    name: "Design Systems Meetup",
    description: "A deep dive into design systems, component libraries, and scaling design across organizations. Featuring case studies from designers at top companies and hands-on workshops.\n\nPerfect for product designers, UX engineers, and design leaders looking to level up their design systems game.",
    organizer: "NYC Design Collective",
    organizerAvatar: "",
    date: "2026-05-02",
    time: "7:00 PM - 9:30 PM",
    location: "WeWork SoHo, 154 Grand St",
    city: "New York",
    industry: "Design",
    capacity: 80,
    attendees: 64,
    coverImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=600&h=340&fit=crop",
    isFree: true,
    tags: ["Design", "UX", "Product"],
  },
  {
    id: "3",
    name: "Startup Founders Breakfast",
    description: "An intimate breakfast gathering for early-stage founders to share challenges, learnings, and connections. Each session features a founder spotlight where one attendee shares their journey.\n\nLimited to 30 attendees to keep conversations meaningful.",
    organizer: "Austin Founders Club",
    organizerAvatar: "",
    date: "2026-04-18",
    time: "8:00 AM - 10:00 AM",
    location: "Capital Factory, 701 Brazos St",
    city: "Austin",
    industry: "Startups",
    capacity: 30,
    attendees: 28,
    coverImage: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=340&fit=crop",
    isFree: true,
    tags: ["Startups", "Founders", "Networking"],
  },
  {
    id: "4",
    name: "Growth Marketing Summit",
    description: "Learn cutting-edge growth strategies from marketing leaders at top SaaS companies. Topics include PLG, content-led growth, community building, and data-driven marketing.\n\nIncludes lunch and a post-event networking hour.",
    organizer: "Chicago Marketing Alliance",
    organizerAvatar: "",
    date: "2026-05-10",
    time: "10:00 AM - 4:00 PM",
    location: "1871 Tech Hub, 222 W Merchandise Mart",
    city: "Chicago",
    industry: "Marketing",
    capacity: 200,
    attendees: 143,
    coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=340&fit=crop",
    isFree: false,
    price: 45,
    tags: ["Marketing", "Growth", "SaaS"],
  },
  {
    id: "5",
    name: "HealthTech Innovation Night",
    description: "Explore the intersection of healthcare and technology. Meet founders building the future of digital health, telemedicine, and biotech.\n\nFeaturing demos from 5 early-stage healthtech startups.",
    organizer: "LA HealthTech",
    organizerAvatar: "",
    date: "2026-05-15",
    time: "6:30 PM - 9:00 PM",
    location: "Cross Campus, 820 Broadway",
    city: "Los Angeles",
    industry: "Healthcare",
    capacity: 100,
    attendees: 67,
    coverImage: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=340&fit=crop",
    isFree: true,
    tags: ["HealthTech", "Startups", "Innovation"],
  },
  {
    id: "6",
    name: "Machine Learning Paper Reading Group",
    description: "A monthly gathering where we discuss recent ML papers, implementations, and practical applications. This month: Transformer architectures and attention mechanisms.\n\nAll levels welcome — from curious beginners to seasoned researchers.",
    organizer: "Seattle AI Society",
    organizerAvatar: "",
    date: "2026-04-22",
    time: "6:00 PM - 8:00 PM",
    location: "Allen Institute, 615 Westlake Ave",
    city: "Seattle",
    industry: "AI & ML",
    capacity: 50,
    attendees: 38,
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=340&fit=crop",
    isFree: true,
    tags: ["AI", "ML", "Research"],
  },
];
