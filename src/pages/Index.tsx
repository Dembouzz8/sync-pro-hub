import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EventCard from "@/components/EventCard";
import { INDUSTRIES } from "@/lib/mockData";
import { supabase } from "@/lib/supabase";
import type { DbEvent } from "@/lib/types";

export default function Index() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [featured, setFeatured] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        setFeatured((data as DbEvent[]) || []);
        setLoading(false);
      });
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (industry) params.set("industry", industry);
    navigate(`/events?${params.toString()}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
        <div className="container py-24 md:py-32 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-foreground">
              Find professional meetups in your city
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-lg mx-auto">
              Connect with like-minded professionals at curated events. Network, learn, and grow your career.
            </p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-background/10 backdrop-blur-sm rounded-lg p-3 mt-8">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter city..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-9 bg-background border-0"
                />
              </div>

              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="bg-background border-0 flex-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-navy-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      </section>

      {/* Featured events */}
      <section className="container py-16 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Featured Events</h2>
            <p className="text-muted-foreground mt-1">Don't miss these upcoming meetups</p>
          </div>
          <Link to="/events">
            <Button variant="ghost" className="gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">No events yet. Check back soon!</p>
        )}
      </section>

      {/* Host CTA */}
      <section className="border-t bg-secondary/50">
        <div className="container py-16">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" /> For organizers
            </div>
            <h2 className="text-3xl font-bold">Host your own event</h2>
            <p className="text-muted-foreground">
              Create and manage professional meetups effortlessly. Reach thousands of professionals in your city.
            </p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="gap-2 mt-2">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 Syncup. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
