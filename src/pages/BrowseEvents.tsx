import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/EventCard";
import { INDUSTRIES } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import type { DbEvent } from "@/lib/types";
import { Search, MapPin, Loader2 } from "lucide-react";

export default function BrowseEvents() {
  const [searchParams] = useSearchParams();
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [industry, setIndustry] = useState(searchParams.get("industry") || "");
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      let query = supabase.from("events").select("*").order("date", { ascending: true });

      if (industry) query = query.eq("industry", industry);
      if (city) query = query.ilike("city", `%${city}%`);
      if (search) query = query.ilike("title", `%${search}%`);

      const { data } = await query;
      setEvents((data as DbEvent[]) || []);
      setLoading(false);
    };
    fetchEvents();
  }, [city, industry, search]);

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Browse Events</h1>
        <p className="text-muted-foreground mt-1">Discover professional meetups near you</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="relative w-full sm:w-48">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Filter by city..." value={city} onChange={(e) => setCity(e.target.value)} className="pl-9" />
        </div>
        <Select value={industry} onValueChange={(v) => setIndustry(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {INDUSTRIES.map((i) => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
