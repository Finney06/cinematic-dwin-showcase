import { useState, useEffect, useRef } from "react";
import { useUndoRedo } from "@/hooks/useEditHistory";
import { ADMIN_QUERY } from "@/lib/adminQueries";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchHeroContent } from "@/lib/api";
import { updateHeroContent } from "@/lib/adminApi";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";

const AdminHero = () => {
  const queryClient = useQueryClient();
  const initialFormRef = useRef("");
  const [form, setForm] = useState({
    brand_text: "CRA8",
    tagline: "Spiritual Drama",
    video_url: "",
    hero_image: "",
    hero_link: "",
  });
  const { reset: resetHistory } = useUndoRedo(form, setForm);

  const { data } = useQuery({
    queryKey: ["heroContent"],
    queryFn: fetchHeroContent,
    ...ADMIN_QUERY,
  });

  useEffect(() => {
    if (data) {
      const next = {
        brand_text: data.brand_text || "CRA8",
        tagline: data.tagline || "Spiritual Drama",
        video_url: data.video_url || "",
        hero_image: data.hero_image || "",
        hero_link: data.hero_link || "",
      };
      setForm(next);
      resetHistory(next);
      initialFormRef.current = JSON.stringify(next);
    }
  }, [data, resetHistory]);

  const isDirty = initialFormRef.current !== JSON.stringify(form);
  useUnsavedChanges(isDirty);

  const saveMutation = useMutation({
    mutationFn: () => updateHeroContent(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroContent"] });
      initialFormRef.current = JSON.stringify(form);
      toast.success("Hero section saved!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">
            Hero Section
          </h1>
          <p className="text-xs text-white/25 tracking-wide mt-1">
            Edit your homepage hero content
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saveMutation.isPending}
          className="bg-white/90 text-black px-5 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Preview — the circle after the opening clip ends: this is what visitors see. */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-1">
            Preview
          </h2>
          <p className="text-[10px] text-white/20 mb-4">
            What the circle settles on once the hero video finishes playing.
          </p>
          <div className="bg-black rounded-lg p-8 flex items-center justify-center min-h-[160px] relative overflow-hidden">
            <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center">
              <img
                src={form.hero_image || "/CRA8.png"}
                alt=""
                className="w-full h-full object-contain scale-[1.25]"
              />
            </div>
            <p className="absolute bottom-3 text-[9px] tracking-[0.4em] uppercase text-white/15">
              {form.tagline || "Spiritual Drama"}
            </p>
          </div>
        </section>

        {/* Text Content */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Text Content
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Brand Text
              </label>
              <input
                type="text"
                value={form.brand_text}
                onChange={(e) => setForm((p) => ({ ...p, brand_text: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="CRA8"
              />
              <p className="mt-1 text-[10px] text-white/15">
                Not shown on screen — the circle displays the logo image below instead.
                Used for the page's screen-reader heading and video title only.
              </p>
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Tagline (Bottom text)
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Spiritual Drama"
              />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Media
          </h2>
          <div className="space-y-5">
            <ImageUpload
              value={form.video_url}
              onChange={(url) => setForm((p) => ({ ...p, video_url: url }))}
              label="Hero Video (plays first)"
              accept="video/mp4,video/webm,video/quicktime,video/ogg"
              previewType="video"
              allowManualUrl
            />
            <p className="-mt-3 text-[10px] text-white/15">
              Upload a short video (recommended: mp4/webm, 4-12 seconds), or paste a YouTube
              link (watch, youtu.be, or /shorts/ — add ?t=8 to start partway in). Muted and
              chromeless either way; the logo takes over once it finishes.
            </p>
            <ImageUpload
              value={form.hero_image}
              onChange={(url) => setForm((p) => ({ ...p, hero_image: url }))}
              label="Hero Circle Image (shown after video ends)"
            />
            <p className="-mt-3 text-[10px] text-white/15">
              Leave empty to show the CRA8 logo — that's the default treatment.
            </p>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Circle Link URL
              </label>
              <input
                type="text"
                value={form.hero_link}
                onChange={(e) => setForm((p) => ({ ...p, hero_link: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="/work/prophet-suddenly-4"
              />
              <p className="mt-1 text-[10px] text-white/15">
                Where the whole circle links to when clicked — an internal page or an
                external URL. Defaults to the latest project if left empty.
              </p>
            </div>
          </div>
        </section>

        <div className="flex gap-3 pt-2 pb-10">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="bg-white/90 text-black px-6 py-3 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
          >
            {saveMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHero;
