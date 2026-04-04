import { useState, useEffect, useRef } from "react";
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
    brand_text: "DWINDIK",
    tagline: "Cre8te",
    video_url: "",
    hero_image: "",
    hero_link: "",
  });

  const { data } = useQuery({
    queryKey: ["heroContent"],
    queryFn: fetchHeroContent,
  });

  useEffect(() => {
    if (data) {
      const next = {
        brand_text: data.brand_text || "DWINDIK",
        tagline: data.tagline || "Cre8te",
        video_url: data.video_url || "",
        hero_image: data.hero_image || "",
        hero_link: data.hero_link || "",
      };
      setForm(next);
      initialFormRef.current = JSON.stringify(next);
    }
  }, [data]);

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
        {/* Preview */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-4">
            Preview
          </h2>
          <div className="bg-[#0a0a0a] rounded-lg p-8 flex items-center justify-center min-h-[120px] relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 absolute" />
            <p className="text-2xl tracking-[0.25em] text-white/60 font-light relative z-10 uppercase">
              {form.brand_text || "DWINDIK"}
            </p>
            <p className="absolute bottom-3 text-[9px] tracking-[0.4em] uppercase text-white/15">
              {form.tagline || "Cre8te"}
            </p>
          </div>
        </section>

        {/* Brand Text */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Text Content
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Brand Text (Large title)
              </label>
              <input
                type="text"
                value={form.brand_text}
                onChange={(e) => setForm((p) => ({ ...p, brand_text: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="DWINDIK"
              />
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
                placeholder="Cre8te"
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
            />
            <p className="-mt-3 text-[10px] text-white/15">Upload a short hero video (recommended: mp4/webm, 4-12 seconds)</p>
            <ImageUpload
              value={form.hero_image}
              onChange={(url) => setForm((p) => ({ ...p, hero_image: url }))}
              label="Hero Circle Image (shown after video ends)"
            />
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Circle Link URL
              </label>
              <input
                type="text"
                value={form.hero_link}
                onChange={(e) => setForm((p) => ({ ...p, hero_link: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="https://youtu.be/..."
              />
              <p className="mt-1 text-[10px] text-white/15">Where the circle links to when clicked</p>
              <p className="mt-1 text-[10px] text-white/15">If using YouTube, place the link here (not in Hero Video)</p>
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
