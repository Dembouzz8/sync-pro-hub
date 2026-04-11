import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, TrendingUp, Loader2 } from "lucide-react";
import type { DbEvent } from "@/lib/types";

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("events")
      .select("*")
      .eq("organizer", user.id)
      .order("date", { ascending: false })
      .then(({ data }) => {
        setEvents(data ?? []);
        setLoading(false);
      });
  }, [user]);

  if (!user || user.role !== "organizer") {
    return <Navigate to="/login" replace />;
  }

  const totalAttendees = events.reduce((sum, e) => sum + (e.capacity - e.spots_remaining), 0);

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.name}</p>
        </div>
        <Link to="/create-event">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Events", value: events.length, icon: Calendar },
              { label: "Total Attendees", value: totalAttendees, icon: Users },
              { label: "Avg. Attendance", value: events.length ? Math.round(totalAttendees / events.length) : 0, icon: TrendingUp },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Events list */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Events</h2>
            {events.length === 0 ? (
              <p className="text-muted-foreground">No events yet. Create your first one!</p>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {event.city}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{event.capacity - event.spots_remaining}/{event.capacity}</p>
                      <p className="text-xs text-muted-foreground">attendees</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
