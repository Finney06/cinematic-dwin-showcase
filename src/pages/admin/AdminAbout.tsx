import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAboutContent } from "@/lib/api";
import { updateAboutContent } from "@/lib/adminApi";
import ImageUpload from "@/components/admin/ImageUpload";
import { toast } from "sonner";
import type { AboutContent } from "@/lib/api";

const defaultAbout: AboutContent = {
  heroImage: "",
  title: "",
  subtitle: "",
  bioIntro: "",
  bioParagraphs: [""],
  galleryImages: ["", ""],
  craftQuote: "",
  craftSkills: [{ title: "", description: "" }],
  fullWidthImage: "",
  productionCompany: { name: "", description: "", collaborator: "" },
  portraitImage: "",
};

const AdminAbout = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<AboutContent>(defaultAbout);

  const { data } = useQuery({
    queryKey: ["aboutContent"],
    queryFn: fetchAboutContent,
  });

  useEffect(() => {
    if (data?.content) {
      setForm({ ...defaultAbout, ...data.content });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => updateAboutContent(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aboutContent"] });
      toast.success("About page saved!");
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
            About Page
          </h1>
          <p className="text-xs text-white/25 tracking-wide mt-1">
            Edit all content on the about page
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

      <form onSubmit={handleSubmit} className="space-y-10 max-w-2xl">
        {/* Hero Section */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Hero Section
          </h2>
          <div className="space-y-5">
            <ImageUpload
              value={form.heroImage}
              onChange={(url) => setForm((p) => ({ ...p, heroImage: url }))}
              label="Hero Image"
            />
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Bio Section */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Bio
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Intro (Large text)
              </label>
              <textarea
                value={form.bioIntro}
                onChange={(e) => setForm((p) => ({ ...p, bioIntro: e.target.value }))}
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Bio Paragraphs
              </label>
              {form.bioParagraphs.map((para, i) => (
                <div key={i} className="mb-3 flex gap-2">
                  <textarea
                    value={para}
                    onChange={(e) => {
                      const updated = [...form.bioParagraphs];
                      updated[i] = e.target.value;
                      setForm((p) => ({ ...p, bioParagraphs: updated }));
                    }}
                    rows={3}
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
                    placeholder={`Paragraph ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.bioParagraphs.filter((_, idx) => idx !== i);
                      setForm((p) => ({ ...p, bioParagraphs: updated.length ? updated : [""] }));
                    }}
                    className="self-start text-white/15 hover:text-red-400/60 transition-colors px-2 py-3 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, bioParagraphs: [...p.bioParagraphs, ""] }))}
                className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer"
              >
                + Add paragraph
              </button>
            </div>
          </div>
        </section>

        {/* Gallery Images */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Gallery Images
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {form.galleryImages.map((img, i) => (
              <ImageUpload
                key={i}
                value={img}
                onChange={(url) => {
                  const updated = [...form.galleryImages];
                  updated[i] = url;
                  setForm((p) => ({ ...p, galleryImages: updated }));
                }}
                label={`Image ${i + 1}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm((p) => ({ ...p, galleryImages: [...p.galleryImages, ""] }))}
            className="mt-3 text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer"
          >
            + Add image
          </button>
        </section>

        {/* Craft Section */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            The Craft
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Quote
              </label>
              <textarea
                value={form.craftQuote}
                onChange={(e) => setForm((p) => ({ ...p, craftQuote: e.target.value }))}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 italic placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-3">
                Skills
              </label>
              {form.craftSkills.map((skill, i) => (
                <div key={i} className="mb-4 bg-white/[0.02] border border-white/[0.04] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <input
                      type="text"
                      value={skill.title}
                      onChange={(e) => {
                        const updated = [...form.craftSkills];
                        updated[i] = { ...updated[i], title: e.target.value };
                        setForm((p) => ({ ...p, craftSkills: updated }));
                      }}
                      className="flex-1 bg-transparent text-sm text-white/70 font-medium placeholder:text-white/15 focus:outline-none"
                      placeholder="Skill title"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.craftSkills.filter((_, idx) => idx !== i);
                        setForm((p) => ({ ...p, craftSkills: updated.length ? updated : [{ title: "", description: "" }] }));
                      }}
                      className="text-white/15 hover:text-red-400/60 transition-colors ml-2 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                  <textarea
                    value={skill.description}
                    onChange={(e) => {
                      const updated = [...form.craftSkills];
                      updated[i] = { ...updated[i], description: e.target.value };
                      setForm((p) => ({ ...p, craftSkills: updated }));
                    }}
                    rows={2}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-md px-3 py-2 text-xs text-white/60 placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-colors resize-none"
                    placeholder="Skill description"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, craftSkills: [...p.craftSkills, { title: "", description: "" }] }))}
                className="text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer"
              >
                + Add skill
              </button>
            </div>
          </div>
        </section>

        {/* Full Width Image */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Full-Width Image
          </h2>
          <ImageUpload
            value={form.fullWidthImage}
            onChange={(url) => setForm((p) => ({ ...p, fullWidthImage: url }))}
            label="Full Width Image"
          />
        </section>

        {/* Production Company */}
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <h2 className="text-xs tracking-[0.15em] uppercase text-white/30 font-medium mb-5">
            Production Company
          </h2>
          <div className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={form.productionCompany.name}
                onChange={(e) => setForm((p) => ({ ...p, productionCompany: { ...p.productionCompany, name: e.target.value } }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Description
              </label>
              <textarea
                value={form.productionCompany.description}
                onChange={(e) => setForm((p) => ({ ...p, productionCompany: { ...p.productionCompany, description: e.target.value } }))}
                rows={3}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Collaborator
              </label>
              <input
                type="text"
                value={form.productionCompany.collaborator}
                onChange={(e) => setForm((p) => ({ ...p, productionCompany: { ...p.productionCompany, collaborator: e.target.value } }))}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <ImageUpload
              value={form.portraitImage}
              onChange={(url) => setForm((p) => ({ ...p, portraitImage: url }))}
              label="Portrait Image"
            />
          </div>
        </section>

        {/* Submit */}
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

export default AdminAbout;
