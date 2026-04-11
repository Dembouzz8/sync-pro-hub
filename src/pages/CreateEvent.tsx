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

    if (!industry) {
      toast.error("Please select an industry / category.");
      return;
    }

    setSaving(true);

    const form = e.currentTarget;
    const capacity = parseInt((form.elements.namedItem("capacity") as HTMLInputElement).value, 10);

    // Get organizer email from current Supabase auth session
    const { data: { session } } = await supabase.auth.getSession();
    const organizerEmail = session?.user?.email ?? user?.email ?? "";

    const eventData = {
      title: (form.elements.namedItem("name") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
      image_url: (form.elements.namedItem("cover") as HTMLInputElement).value || null,
      date: (form.elements.namedItem("date") as HTMLInputElement).value,
      time: (form.elements.namedItem("time") as HTMLInputElement).value,
      city: (form.elements.namedItem("city") as HTMLInputElement).value,
      location: (form.elements.namedItem("location") as HTMLInputElement).value,
      industry,
      capacity,
      spots_remaining: capacity,
      price: isFree ? 0 : parseFloat((form.elements.namedItem("price") as HTMLInputElement).value),
      organizer_email: organizerEmail,
    };

    console.log("Inserting event:", eventData);

    try {
      const { error } = await supabase.from("events").insert(eventData);

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error(error.message || "Failed to create event.");
        setSaving(false);
        return;
      }

      toast.success("Event created successfully!");
      navigate("/events");
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error(err?.message || "An unexpected error occurred.");
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
          <Label htmlFor="cover">Cover image URL</Label>
          <Input id="cover" type="url" placeholder="https://example.com/image.jpg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Time</Label>
            <Input id="time" type="time" required />
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
