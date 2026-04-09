import { Link } from "react-router-dom";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DbEvent } from "@/lib/types";

export default function EventCard({ event }: { event: DbEvent }) {
  const dateFormatted = new Date(event.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const isFree = !event.price || event.price === 0;

  return (
    <Link to={`/events/${event.id}`} className="group block">
      <div className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:-translate-y-1">
        {/* Cover */}
        <div className="aspect-[16/9] relative overflow-hidden">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "var(--hero-gradient)" }}>
              <span className="text-2xl font-bold text-primary-foreground/20">{event.industry}</span>
            </div>
          )}
          {isFree ? (
            <Badge variant="secondary" className="absolute top-3 right-3">Free</Badge>
          ) : (
            <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">${event.price}</Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-card-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          <p className="text-xs font-medium text-muted-foreground">{event.organizer}</p>

          <div className="space-y-1.5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 shrink-0" />
              <span>{event.spots_remaining > 0 ? `${event.spots_remaining} spots left` : "Sold out"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
