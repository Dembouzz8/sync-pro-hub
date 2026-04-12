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
    const getFieldValue = (fieldName: string) => {
      const field = form.elements.namedItem(fieldName);
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        return field.value.trim();
      }
      return "";
    };

    if (!industry) {
      toast.error("Please select an industry / category.");
      return;
    }

    setSaving(true);

    try {
      const capacity = Number(getFieldValue("capacity"));
      if (!Number.isFinite(capacity) || capacity < 1) {
        throw new Error("Please enter a valid capacity.");
      }

      const price = isFree ? 0 : Number(getFieldValue("price"));
      if (!isFree && (!Number.isFinite(price) || price < 0)) {
        throw new Error("Please enter a valid ticket price.");
      }

      const startTime = getFieldValue("startTime");
      const endTime = getFieldValue("endTime");
      if (!startTime || !endTime) {
        throw new Error("Please enter both start and end times.");
      }
      const time = `${formatTime12(startTime)} - ${formatTime12(endTime)}`;

      const { data, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const organizerEmail = data.user?.email;
      if (!organizerEmail) {
        throw new Error("Could not get the organizer email. Please log in again.");
      }

      const eventData = {
        title: getFieldValue("name"),
        description: getFieldValue("description"),
        date: getFieldValue("date"),
        time,
        location: getFieldValue("location"),
        city: getFieldValue("city"),
        industry,
        capacity,
        spots_remaining: capacity,
        price,
        image_url: getFieldValue("cover") || null,
        organizer_name: getFieldValue("organizerName"),
        organizer_email: organizerEmail,
      };

      const { error } = await supabase.from("events").insert(eventData);
      if (error) throw error;

      toast.success("Event created successfully!");
      navigate("/events");
    } catch (error) {
      console.error("Create event failed:", error);
      const message = error instanceof Error ? error.message : "Failed to create event.";
      toast.error(message);
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
          <Input id="name" placeholder="e.g. Tech Founders Mixer" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={5} placeholder="What's this event about?" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizerName">Organizer Name</Label>
          <Input id="organizerName" placeholder="e.g. Jane Smith" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input id="cover" type="url" placeholder="https://example.com/image.jpg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" type="time" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" type="time" required />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="e.g. San Francisco" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Venue</Label>
            <Input id="location" placeholder="123 Main St" required />
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
            <Input id="capacity" type="number" min={1} placeholder="50" required />
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
            <Label htmlFor="price">Ticket price ($)</Label>
            <Input id="price" type="number" min={1} step={0.01} placeholder="25.00" required />
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Create Event"}
        </Button>
      </form>
    </div>
  );
}
