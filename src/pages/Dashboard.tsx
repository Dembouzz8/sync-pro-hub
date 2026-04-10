import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, TrendingUp } from "lucide-react";
import { mockEvents } from "@/lib/mockData";

export default function Dashboard() {
  const { user } = useAuth();

  if (!user || user.role !== "organizer") {
    return <Navigate to="/login" replace />;
  }

  const myEvents = mockEvents.slice(0, 3); // mock
  const totalAttendees = myEvents.reduce((sum, e) => sum + e.attendees, 0);

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: myEvents.length, icon: Calendar },
          { label: "Total Attendees", value: totalAttendees, icon: Users },
          { label: "Avg. Attendance", value: `${Math.round(totalAttendees / myEvents.length)}`, icon: TrendingUp },
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
        <div className="space-y-3">
          {myEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="flex items-center justify-between rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow"
            >
              <div className="space-y-1">
                <p className="font-medium">{event.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {event.city}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{event.attendees}/{event.capacity}</p>
                <p className="text-xs text-muted-foreground">attendees</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
