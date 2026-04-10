import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowLeft, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import type { DbEvent } from "@/lib/types";

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<DbEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpd, setRsvpd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setEvent(data as DbEvent | null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg text-muted-foreground">Event not found.</p>
        <Link to="/events"><Button variant="ghost" className="mt-4">Back to events</Button></Link>
      </div>
    );
  }

  const isFree = !event.price || event.price === 0;
  const dateFormatted = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const handleRsvp = async () => {
    if (!user) {
      toast.error("Please sign in to RSVP");
      return;
    }
    setSubmitting(true);
    try {
      const { error: rsvpError } = await supabase.from("rsvps").insert({
        event_id: id,
        user_id: user.id,
        status: "confirmed",
      });
      if (rsvpError) throw rsvpError;

      const { error: updateError } = await supabase.rpc("decrement_spots", {
        p_event_id: id,
      });
      if (updateError) throw updateError;

      setEvent({ ...event, spots_remaining: event.spots_remaining - 1 });
      setRsvpd(true);
      toast.success("You're in! See you there 🎉");

      // Notify external webhook
      try {
        await fetch("https://sha111.app.n8n.cloud/webhook/syncup-pro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_name: user.name,
            user_email: user.email,
            event_title: event.title,
            event_date: event.date,
            event_time: event.time,
            event_location: event.location,
            event_city: event.city,
            event_price: event.price ?? 0,
          }),
        });
      } catch {
        // Webhook failure is non-blocking
      }
    } catch (err: any) {
      toast.error(err.message ?? "Could not RSVP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Cover */}
      <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden">
        {event.image_url ? (
          <img src={event.image_url} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--hero-gradient)" }}>
            <span className="text-6xl font-bold text-primary-foreground/10">{event.industry}</span>
          </div>
        )}
      </div>

      <div className="container py-8 lg:py-12">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary">{event.industry}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold">{event.title}</h1>
              <p className="text-muted-foreground">Hosted by <span className="font-medium text-foreground">{event.organizer}</span></p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">About this event</h2>
              <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {event.description}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 space-y-5 sticky top-24">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{dateFormatted}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-sm text-muted-foreground">{event.city}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">{event.capacity - event.spots_remaining} attending</p>
                    <p className="text-sm text-muted-foreground">{event.spots_remaining} spots remaining</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-2xl font-bold mb-4">
                  {isFree ? "Free" : `$${event.price}`}
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRsvp}
                  disabled={rsvpd || event.spots_remaining <= 0 || submitting}
                >
                  {rsvpd ? "You're going!" : submitting ? "Saving…" : event.spots_remaining <= 0 ? "Sold out" : "RSVP Now"}
                </Button>
              </div>
            </div>

            {/* Organizer block */}
            <div className="rounded-lg border bg-card p-6 space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Organizer</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{event.organizer}</p>
                  <p className="text-xs text-muted-foreground">Event organizer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
