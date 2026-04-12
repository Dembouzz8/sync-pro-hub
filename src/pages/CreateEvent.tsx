import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/authContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { INDUSTRIES } from "@/lib/mockData";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function formatTime12(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFree, setIsFree] = useState(true);
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user || user.role !== "organizer") {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    // Use FormData — works with name attributes reliably
    const fd = new FormData(form);
    const get = (key: string) => (fd.get(key) as string | null)?.trim() ?? "";

    if (!industry) {
      toast.error("Please select an industry / category.");
      return;
    }

    const startTime = get("startTime");
    const endTime = get("endTime");
    if (!startTime || !endTime) {
      toast.error("Please enter both start and end times.");
      return;
    }

    const capacity = Number(get("capacity"));
    if (!Number.isFinite(capacity) || capacity < 1) {
      toast.error("Please enter a valid capacity.");
      return;
    }

    const price = isFree ? 0 : Number(get("price"));
    if (!isFree && (!Number.isFinite(price) || price < 0)) {
      toast.error("Please enter a valid ticket price.");
      return;
    }

    setSaving(true);

    try {
      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const organizerEmail = authData.user?.email;
      if (!organizerEmail) {
        throw new Error("Could not get organizer email. Please log in again.");
      }

      const eventData = {
        title: get("name"),
        description: get("description"),
        organizer_name: get("organizerName"),
        date: get("date"),
        time: `${formatTime12(startTime)} - ${formatTime12(endTime)}`,
        location: get("location"),
        city: get("city"),
        industry,
        capacity,
        spots_remaining: capacity,
        price,
        image_url: get("cover") || null,
        organizer_email: organizerEmail,
      };

      const { error } = await supabase.from("events").insert(eventData);
      if (error) throw error;

      toast.success("Event created successfully!");
      navigate("/events");
    } catch (err) {
      console.error("Create event failed:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-muted-foreground mt-1">Fill in the details for your meetup</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Event name</Label>
          <Input id="name" name="name" placeholder="e.g. Tech Founders Mixer" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={5} placeholder="What's this event about?" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizerName">Organizer name</Label>
          <Input id="organizerName" name="organizerName" placeholder="e.g. Lagos Tech Network" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input id="cover" name="cover" type="url" placeholder="https://example.com/image.jpg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start time</Label>
            <Input id="startTime" name="startTime" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End time</Label>
            <Input id="endTime" name="endTime" type="time" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" placeholder="e.g. Lagos" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Venue</Label>
            <Input id="location" name="location" placeholder="123 Main St" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Industry / Category</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input id="capacity" name="capacity" type="number" min={1} placeholder="50" required />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="font-medium">Free event</p>
            <p className="text-sm text-muted-foreground">Toggle off to set a ticket price</p>
          </div>
          <Switch checked={isFree} onCheckedChange={setIsFree} />
        </div>

        {!isFree && (
          <div className="space-y-2">
            <Label htmlFor="price">Ticket price (₦)</Label>
            <Input id="price" name="price" type="number" min={1} step={0.01} placeholder="5000" required />
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Create Event"}
        </Button>
      </form>
    </div>
  );
}
