import { useParams, Link } from "react-router-dom";
import { Calendar, MapPin, Users, Clock, ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/lib/mockData";
import { useState } from "react";
import { toast } from "sonner";

export default function EventDetail() {
  const { id } = useParams();
  const event = mockEvents.find((e) => e.id === id);
  const [rsvpd, setRsvpd] = useState(false);

  if (!event) {
    return (
      <div className="container py-16 text-center">
        <p className="text-lg text-muted-foreground">Event not found.</p>
        <Link to="/events"><Button variant="ghost" className="mt-4">Back to events</Button></Link>
      </div>
    );
  }

  const dateFormatted = new Date(event.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const spotsLeft = event.capacity - event.attendees;

  const handleRsvp = () => {
    setRsvpd(true);
    toast.success("You're in! See you there 🎉");
  };

  return (
    <div className="flex flex-col">
      {/* Cover */}
      <div className="aspect-[21/9] md:aspect-[3/1] relative overflow-hidden" style={{ background: "var(--hero-gradient)" }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-bold text-primary-foreground/10">{event.industry}</span>
        </div>
      </div>

      <div className="container py-8 lg:py-12">
        <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to events
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold">{event.name}</h1>
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
                    <p className="font-medium">{event.attendees} attending</p>
                    <p className="text-sm text-muted-foreground">{spotsLeft} spots remaining</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-2xl font-bold mb-4">
                  {event.isFree ? "Free" : `$${event.price}`}
                </p>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleRsvp}
                  disabled={rsvpd || spotsLeft <= 0}
                >
                  {rsvpd ? "You're going!" : spotsLeft <= 0 ? "Sold out" : "RSVP Now"}
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
