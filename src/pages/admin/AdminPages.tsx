import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMenuItems, fetchPageContent } from "@/lib/api";
import { createMenuItem, deleteMenuItem, updatePageContent } from "@/lib/adminApi";
import { toast } from "sonner";

const AdminPages = () => {
  const queryClient = useQueryClient();
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [intro, setIntro] = useState("");
  const [body, setBody] = useState("");
  const [sections, setSections] = useState<{ heading: string; body: string }[]>([]);
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const { data: menuItems = [] } = useQuery({
    queryKey: ["adminMenuItems"],
    queryFn: () => fetchMenuItems(true),
  });

  const pageItems = useMemo(
    () =>
      menuItems.filter(
        (item) =>
          item.page_type === "page" &&
          item.visible === 1 &&
          item.path.replace(/^\//, "") !== "about"
      ),
    [menuItems]
  );

  const selectedItem = useMemo(
    () => pageItems.find((item) => item.path.replace(/^\//, "") === selectedSlug),
    [pageItems, selectedSlug]
  );

  useEffect(() => {
    const exists = pageItems.some(
      (item) => item.path.replace(/^\//, "") === selectedSlug
    );
    if (!selectedSlug || !exists) {
      const first = pageItems[0];
      setSelectedSlug(first ? first.path.replace(/^\//, "") : "");
    }
  }, [pageItems, selectedSlug]);

  const { data: pageData } = useQuery({
    queryKey: ["pageContent", selectedSlug],
    queryFn: () => fetchPageContent(selectedSlug),
    enabled: !!selectedSlug,
  });

  useEffect(() => {
    if (!pageData) return;
    const content = (pageData.content || {}) as {
      subtitle?: string;
      intro?: string;
      body?: string;
      sections?: { heading: string; body: string }[];
      cta?: { label?: string; url?: string };
    };
    setTitle(pageData.title || "");
    setSubtitle(content.subtitle || "");
    setIntro(content.intro || "");
    setBody(content.body || "");
    setSections(content.sections || []);
    setCtaLabel(content.cta?.label || "");
    setCtaUrl(content.cta?.url || "");
  }, [pageData]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updatePageContent(selectedSlug, {
        title,
        content: {
          subtitle,
          intro,
          body,
          sections,
          cta: {
            label: ctaLabel,
            url: ctaUrl,
          },
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pageContent", selectedSlug] });
      toast.success("Page saved!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const slug = newSlug.trim();
      if (!newLabel.trim() || !slug) throw new Error("Label and slug are required");
      if (menuItems.some((item) => item.path.replace(/^\//, "") === slug)) {
        throw new Error("That slug already exists");
      }
      await createMenuItem({
        label: newLabel.trim(),
        path: `/${slug}`,
        page_type: "page",
        visible: 1,
      });
      await updatePageContent(slug, {
        title: newLabel.trim(),
        content: { body: "" },
      });
      return slug;
    },
    onSuccess: (slug) => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      setSelectedSlug(slug);
      setNewLabel("");
      setNewSlug("");
      toast.success("Page created");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      setSelectedSlug("");
      setTitle("");
      setSubtitle("");
      setIntro("");
      setBody("");
      setSections([]);
      setCtaLabel("");
      setCtaUrl("");
      setDeleteConfirm(false);
      toast.success("Page deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSlugInput = (value: string) => {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setNewSlug(slug);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">
            Pages
          </h1>
          <p className="text-xs text-white/25 tracking-wide mt-1">
            Edit custom pages like News and Internship
          </p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!selectedSlug || saveMutation.isPending}
          className="bg-white/90 text-black px-5 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-6 max-w-2xl">
        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm tracking-[0.12em] uppercase text-white/45">
                Create New Page
              </h2>
              <p className="text-[11px] text-white/25 mt-1">
                Add custom pages without touching code.
              </p>
            </div>
            <button
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newLabel.trim() || !newSlug.trim()}
              className="bg-white/90 text-black px-4 py-2 rounded-lg text-[10px] tracking-[0.18em] uppercase font-medium hover:bg-white transition-colors disabled:opacity-40"
            >
              {createMutation.isPending ? "Creating..." : "Create Page"}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Page Label
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => {
                  setNewLabel(e.target.value);
                  if (!newSlug) handleSlugInput(e.target.value);
                }}
                placeholder="e.g. Press Kit"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Page Slug
              </label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => handleSlugInput(e.target.value)}
                placeholder="press-kit"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
              />
              <p className="mt-2 text-[10px] text-white/20">
                Page URL: /{newSlug || "your-slug"}
              </p>
            </div>
          </div>
        </section>
        <div>
          <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
            Select Page
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 focus:outline-none focus:border-white/20 transition-colors"
          >
            {!pageItems.length && (
              <option value="" className="bg-[#141414]">
                No pages yet
              </option>
            )}
            {pageItems.map((item) => (
              <option
                key={item.id}
                value={item.path.replace(/^\//, "")}
                className="bg-[#141414]"
              >
                {item.label}
              </option>
            ))}
          </select>
          {selectedItem && (
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-white/25">URL: {selectedItem.path}</p>
              <button
                onClick={() => setDeleteConfirm(true)}
                className="text-[10px] tracking-[0.15em] uppercase text-red-400/50 hover:text-red-400/80 transition-colors"
              >
                Delete Page
              </button>
            </div>
          )}
        </div>

        <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Page Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Page title"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                placeholder="Optional subtitle"
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Intro
              </label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
                placeholder="Short intro paragraph..."
              />
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Page Body
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
                placeholder="Write the content for this page..."
              />
              <p className="mt-2 text-[10px] text-white/20">
                Supports plain text. Separate paragraphs with blank lines.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium">
                  Sections
                </label>
                <button
                  type="button"
                  onClick={() => setSections((prev) => [...prev, { heading: "", body: "" }])}
                  className="text-[10px] tracking-[0.15em] uppercase text-white/30 hover:text-white/60 transition-colors"
                >
                  + Add Section
                </button>
              </div>
              <div className="mt-3 space-y-4">
                {sections.map((section, index) => (
                  <div
                    key={`${index}-${section.heading}`}
                    className="border border-white/[0.08] rounded-lg p-4 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] tracking-[0.18em] uppercase text-white/30">
                        Section {index + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setSections((prev) => prev.filter((_, i) => i !== index))
                        }
                        className="text-[10px] tracking-[0.15em] uppercase text-red-400/50 hover:text-red-400/80"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      value={section.heading}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, heading: e.target.value } : item
                          )
                        )
                      }
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="Section heading"
                    />
                    <textarea
                      value={section.body}
                      onChange={(e) =>
                        setSections((prev) =>
                          prev.map((item, i) =>
                            i === index ? { ...item, body: e.target.value } : item
                          )
                        )
                      }
                      rows={4}
                      className="mt-3 w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors resize-none"
                      placeholder="Section text..."
                    />
                  </div>
                ))}
                {!sections.length && (
                  <p className="text-[11px] text-white/20">Add sections for richer layouts.</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                Call To Action
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="CTA label"
                />
                <input
                  type="text"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20 transition-colors"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </section>
        {deleteConfirm && selectedItem && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-[12px] text-red-200/80">
              Delete “{selectedItem.label}”? This removes it from navigation. Content can be re-added
              by creating a page with the same slug.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => deleteMutation.mutate(selectedItem.id)}
                className="px-4 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase bg-red-500/20 text-red-200/80 hover:bg-red-500/30 transition-colors"
              >
                Confirm Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 rounded-lg text-[10px] tracking-[0.15em] uppercase bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPages;
