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
import { Loader2, ImageOff } from "lucide-react";

function formatTime12(time24: string): string {
  if (!time24) return "";
  const [h, m] = time24.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${period}`;
}

function isValidUrl(str: string): boolean {
  if (!str) return true; // empty is fine (optional field)
  try {
    const url = new URL(str.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [organizerName, setOrganizerName] = useState("");
  const [cover, setCover] = useState("");
  const [coverError, setCoverError] = useState(false);
  const [coverLoaded, setCoverLoaded] = useState(false);
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [industry, setIndustry] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");

  if (!user || user.role !== "organizer") {
    return <Navigate to="/login" replace />;
  }

  const handleCoverChange = (val: string) => {
    setCover(val);
    // Reset preview state whenever the URL changes
    setCoverError(false);
    setCoverLoaded(false);
  };

  const handleCreate = async () => {
    if (!title) { toast.error("Please enter an event name."); return; }
    if (!description) { toast.error("Please enter a description."); return; }
    if (!organizerName) { toast.error("Please enter an organizer name."); return; }
    if (!date) { toast.error("Please select a date."); return; }
    if (!startTime) { toast.error("Please enter a start time."); return; }
    if (!endTime) { toast.error("Please enter an end time."); return; }
    if (!city) { toast.error("Please enter a city."); return; }
    if (!location) { toast.error("Please enter a venue."); return; }
    if (!industry) { toast.error("Please select an industry."); return; }
    if (!capacity || Number(capacity) < 1) { toast.error("Please enter a valid capacity."); return; }
    if (!isFree && (!price || Number(price) < 0)) { toast.error("Please enter a valid price."); return; }

    const trimmedCover = cover.trim();
    if (trimmedCover && !isValidUrl(trimmedCover)) {
      toast.error("Please enter a valid image URL (must start with http:// or https://).");
      return;
    }

    setSaving(true);

    try {
      const { data: authData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const organizerEmail = authData.user?.email;
      if (!organizerEmail) throw new Error("Could not get organizer email. Please log in again.");

      const eventData = {
        title,
        description,
        organizer_name: organizerName,
        date,
        time: `${formatTime12(startTime)} - ${formatTime12(endTime)}`,
        location,
        city,
        industry,
        capacity: Number(capacity),
        spots_remaining: Number(capacity),
        price: isFree ? 0 : Number(price),
        image_url: trimmedCover || null,
        organizer_email: organizerEmail,
      };

      const { data: insertData, error } = await supabase.from("events").insert(eventData).select();
      console.log("Result:", insertData, error);

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

  // Determine whether to show the image preview
  const showPreview = cover.trim() && isValidUrl(cover.trim());

  return (
    <div className="container max-w-2xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Create Event</h1>
        <p className="text-muted-foreground mt-1">Fill in the details for your meetup</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Event name</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Tech Founders Mixer" />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="What's this event about?" />
        </div>

        <div className="space-y-2">
          <Label>Organizer name</Label>
          <Input value={organizerName} onChange={e => setOrganizerName(e.target.value)} placeholder="e.g. Lagos Tech Network" />
        </div>

        {/* Cover image URL with preview */}
        <div className="space-y-2">
          <Label>Cover image URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
          <Input
            value={cover}
            onChange={e => handleCoverChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="truncate"
          />

          {/* Validation warning */}
          {cover.trim() && !isValidUrl(cover.trim()) && (
            <p className="text-sm text-destructive">
              URL must start with http:// or https://
            </p>
          )}

          {/* Image preview — constrained so it can never distort the layout */}
          {showPreview && (
            <div className="relative w-full h-48 rounded-md border overflow-hidden bg-muted flex items-center justify-center">
              {!coverError ? (
                <img
                  key={cover} // re-mount on URL change to reset load state
                  src={cover.trim()}
                  alt="Cover preview"
                  onLoad={() => { setCoverLoaded(true); setCoverError(false); }}
                  onError={() => { setCoverError(true); setCoverLoaded(false); }}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${coverLoaded ? "opacity-100" : "opacity-0"}`}
                />
              ) : null}

              {/* Loading shimmer */}
              {!coverLoaded && !coverError && (
                <div className="absolute inset-0 bg-muted animate-pulse" />
              )}

              {/* Broken image fallback */}
              {coverError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                  <p className="text-sm">Could not load image</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Start time</Label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>End time</Label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>City</Label>
            <Input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Lagos" />
          </div>
          <div className="space-y-2">
            <Label>Venue</Label>
            <Input value={location} onChange={e => setLocation(e.target.value)} placeholder="123 Main St" />
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
            <Label>Capacity</Label>
            <Input type="number" min={1} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="50" />
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
            <Label>Ticket price (₦)</Label>
            <Input type="number" min={0} step={0.01} value={price} onChange={e => setPrice(e.target.value)} placeholder="5000" />
          </div>
        )}

        <Button size="lg" className="w-full" disabled={saving} onClick={handleCreate}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : "Create Event"}
        </Button>
      </div>
    </div>
  );
}
