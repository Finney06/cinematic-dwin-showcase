import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  AdminHeader,
  ConfirmDelete,
  Field,
  ImageField,
  PrimaryButton,
  StringListField,
  TextField,
  TextareaField,
  Toggle,
} from "@/components/admin/FormFields";
import BlockListEditor from "@/components/admin/BlockListEditor";
import { useUnsavedChanges } from "@/hooks/useUnsavedChanges";
import { useUndoRedo } from "@/hooks/useEditHistory";
import {
  createPage,
  deletePage,
  fetchAdminPage,
  fetchAdminPages,
  fetchAdminProjects,
  updatePageContent,
} from "@/lib/adminApi";
import { ADMIN_QUERY, invalidateContent } from "@/lib/adminQueries";
import { readBlocks, type PageBlock } from "@/lib/pageBlocks";

/**
 * Pages that the app renders with its own layout. They always exist, can be
 * unpublished but never deleted, and their heading/lead/preview text are edited here
 * like any other page. About is the exception — it has a richer editor of its
 * own at Admin → About.
 *
 * Categories (Film, Music, …) are deliberately not listed here. They are
 * filters on Work, not pages, and Admin → Categories is already their one
 * editor — label, description, hero image. Listing them a second time here
 * would just be the same information with two places to go looking for it.
 */
const SYSTEM_PAGES = [
  { slug: "work", label: "Work" },
  { slug: "services", label: "Services" },
  { slug: "journal", label: "Journal" },
  { slug: "contact", label: "Contact" },
];

type PageKind = "system" | "page";

interface PageEntry {
  slug: string;
  label: string;
  kind: PageKind;
  published: boolean;
  /** False until the page has been saved once — it still renders, just empty. */
  exists: boolean;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const KIND_LABEL: Record<PageKind, string> = {
  system: "Built in",
  page: "Custom",
};

const AdminPages = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    intro: "",
    heroImage: "",
    blocks: [] as PageBlock[],
    published: true,
    seo_title: "",
    seo_description: "",
    seo_image: "",
    /** Contact-only. Kept on the page's content JSON alongside everything else. */
    formEnabled: true,
    topics: [] as string[],
  });
  const savedRef = useRef("");
  /** The server copy last loaded in, so an identical refetch is a no-op. */
  const lastLoadedRef = useRef("");
  /** Set right before a save, so the refetch it triggers resyncs quietly instead of wiping history. */
  const justSavedRef = useRef(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newPage, setNewPage] = useState({ title: "", slug: "", addToMenu: true, published: false });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { reset: resetHistory, sync: syncHistory } = useUndoRedo(draft, setDraft);

  const { data: pages = [], isLoading: pagesLoading } = useQuery({
    queryKey: ["adminPages"],
    queryFn: fetchAdminPages,
    ...ADMIN_QUERY,
  });

  /**
   * Every address an editor can open, whether or not it has a saved row yet.
   * A system page with no content row still appears — otherwise a page
   * that's live on the site would be missing from its own editor.
   */
  const entries = useMemo<PageEntry[]>(() => {
    const bySlug = new Map(pages.map((page) => [page.page_slug, page]));
    const seen = new Set<string>();
    const list: PageEntry[] = [];

    const push = (slug: string, label: string, kind: PageKind) => {
      if (seen.has(slug)) return;
      seen.add(slug);
      const row = bySlug.get(slug);
      list.push({
        slug,
        label: row?.title?.trim() || label,
        kind,
        published: row ? row.published !== 0 : true,
        exists: Boolean(row),
      });
    };

    SYSTEM_PAGES.forEach((page) => push(page.slug, page.label, "system"));
    pages
      .filter((page) => !["about", "home"].includes(page.page_slug))
      .forEach((page) => push(page.page_slug, page.title || page.page_slug, "page"));

    return list;
  }, [pages]);

  useEffect(() => {
    if (!entries.length) return;
    if (!entries.some((entry) => entry.slug === selected)) setSelected(entries[0].slug);
  }, [entries, selected]);

  const entry = entries.find((item) => item.slug === selected);

  const { data: pageData, isLoading: pageLoading } = useQuery({
    queryKey: ["adminPage", selected],
    queryFn: () => fetchAdminPage(selected),
    ...ADMIN_QUERY,
    enabled: !!selected,
  });

  /**
   * Work also renders the whole slate, which lives in its own table. Listing
   * it here means the editor shows everything the page actually displays —
   * otherwise a page full of films looks empty.
   */
  const showsProjects = selected === "work";
  const { data: pageProjects = [] } = useQuery({
    queryKey: ["adminPageProjects", selected],
    queryFn: () => fetchAdminProjects(),
    ...ADMIN_QUERY,
    enabled: showsProjects,
  });

  // A background refetch hands back a new object even when nothing changed.
  // Reloading on that would wipe unsaved edits and the undo history, so the
  // server copy is only taken when it is genuinely different from the last one.
  useEffect(() => {
    if (!pageData) return;
    const signature = JSON.stringify({ selected, pageData });
    if (signature === lastLoadedRef.current) return;
    lastLoadedRef.current = signature;

    const content = (pageData.content || {}) as Record<string, unknown>;
    const next = {
      title: pageData.title || "",
      intro: typeof content.intro === "string" ? content.intro : "",
      heroImage: typeof content.heroImage === "string" ? content.heroImage : "",
      blocks: readBlocks(content),
      published: pageData.published !== 0,
      seo_title: pageData.seo_title || "",
      seo_description: pageData.seo_description || "",
      seo_image: pageData.seo_image || "",
      formEnabled: content.formEnabled !== false,
      topics: Array.isArray(content.topics) ? (content.topics as string[]) : [],
    };
    savedRef.current = JSON.stringify(next);
    if (justSavedRef.current) {
      // This is the server echoing back what was just saved — resync
      // quietly so undo can still step back past the save.
      justSavedRef.current = false;
      syncHistory(next);
    } else {
      setDraft(next);
      // A genuinely new page was loaded — history starts at what the server
      // actually holds, so undo can never reach back into another page's edits.
      resetHistory(next);
    }
  }, [pageData, selected, resetHistory, syncHistory]);

  const isDirty = savedRef.current !== JSON.stringify(draft);
  useUnsavedChanges(isDirty);

  const saveMutation = useMutation({
    mutationFn: () =>
      updatePageContent(selected, {
        title: draft.title,
        published: draft.published,
        seo_title: draft.seo_title,
        seo_description: draft.seo_description,
        seo_image: draft.seo_image,
        // Merge, never replace: fields this editor doesn't know about (an old
        // page's `body` or `sections`) have to survive a save here.
        content: {
          ...(pageData?.content || {}),
          intro: draft.intro,
          heroImage: draft.heroImage,
          blocks: draft.blocks,
          ...(selected === "contact" ? { formEnabled: draft.formEnabled, topics: draft.topics } : {}),
        },
      }),
    onSuccess: () => {
      justSavedRef.current = true;
      invalidateContent(queryClient);
      savedRef.current = JSON.stringify(draft);
      toast.success("Saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const slug = slugify(newPage.slug || newPage.title);
      if (!newPage.title.trim()) throw new Error("Give the page a title");
      if (!slug) throw new Error("Give the page an address");
      return createPage({ ...newPage, slug, content: { blocks: [] } });
    },
    onSuccess: (created) => {
      invalidateContent(queryClient);
      setSelected(created.page_slug);
      setShowCreate(false);
      setNewPage({ title: "", slug: "", addToMenu: true, published: false });
      toast.success("Page created — add some content, then publish it");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePage(selected),
    onSuccess: () => {
      invalidateContent(queryClient);
      setConfirmDelete(false);
      setSelected("");
      toast.success("Page deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setConfirmDelete(false);
    },
  });

  const setField = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const livePath = `/${selected}`;

  return (
    <div>
      <AdminHeader
        title="Pages"
        description="Every page on the site. Built-in pages can be drafted and published like any other; only they can't be deleted. Film, Music and other sections aren't pages — edit them in Categories."
      >
        <PrimaryButton onClick={() => setShowCreate(true)}>+ New Page</PrimaryButton>
        <button
          type="button"
          onClick={() => saveMutation.mutate()}
          disabled={!selected || saveMutation.isPending}
          className="bg-white/[0.06] text-white/45 px-5 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase hover:bg-white/[0.1] hover:text-white/70 transition-colors disabled:opacity-40 cursor-pointer"
        >
          {saveMutation.isPending ? "Saving…" : isDirty ? "Save changes •" : "Saved"}
        </button>
      </AdminHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Page list ─── */}
        <aside className="lg:col-span-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
            {pagesLoading ? (
              <div className="p-5 space-y-2 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-9 bg-white/[0.05] rounded" />
                ))}
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04] max-h-[70vh] overflow-y-auto">
                {entries.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => setSelected(item.slug)}
                    className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                      selected === item.slug ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${item.published ? "text-white/70" : "text-white/35"}`}
                      >
                        {item.label}
                      </span>
                      {!item.published && (
                        <span className="text-[9px] tracking-[0.15em] uppercase text-white/25 shrink-0">
                          Draft
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-white/20 mt-0.5 truncate">
                      /{item.slug} · {KIND_LABEL[item.kind]}
                    </span>
                  </button>
                ))}

                <Link to="/admin/about" className="block px-4 py-3 hover:bg-white/[0.03] transition-colors">
                  <span className="text-sm text-white/50">About</span>
                  <span className="block text-[10px] text-white/20 mt-0.5">/about · Its own editor →</span>
                </Link>

                <Link
                  to="/admin/categories"
                  className="block px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="text-sm text-white/50">Film, Music &amp; other sections</span>
                  <span className="block text-[10px] text-white/20 mt-0.5">
                    Filters on Work, not pages — edit them in Categories →
                  </span>
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Editor ─── */}
        <div className="lg:col-span-8 space-y-6">
          {!selected ? (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-14 text-center text-sm text-white/30">
              Select a page to edit.
            </div>
          ) : pageLoading ? (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 animate-pulse space-y-3">
              <div className="h-10 bg-white/[0.06] rounded" />
              <div className="h-24 bg-white/[0.06] rounded" />
            </div>
          ) : (
            <>
              <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
                <Toggle
                  checked={draft.published}
                  onChange={(checked) => setField("published", checked)}
                  label={draft.published ? "Published" : "Draft"}
                  hint="A draft is invisible to visitors — its address shows “not found” — and it stays out of the menu. Save to apply."
                />
                <a
                  href={livePath}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] tracking-[0.15em] uppercase text-white/35 hover:text-white/70 transition-colors"
                >
                  {livePath} — View live →
                </a>
              </section>

              <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
                <TextField
                  label="Heading"
                  value={draft.title}
                  onChange={(value) => setField("title", value)}
                  placeholder={entry?.label || "Page title"}
                  hint="The oversized title at the top of the page."
                />
                <TextareaField
                  label="Lead paragraph"
                  rows={3}
                  value={draft.intro}
                  onChange={(value) => setField("intro", value)}
                  hint="Optional. Sits directly under the heading rule."
                />
                {entry?.kind === "page" && (
                  <ImageField
                    label="Hero image"
                    value={draft.heroImage}
                    onChange={(value) => setField("heroImage", value)}
                    hint="Optional. A full-width still above the heading."
                  />
                )}
              </section>

              {selected === "contact" && (
                <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
                  <Field label="Contact form" hint="The email address and social links come from Settings.">
                    <Toggle
                      checked={draft.formEnabled}
                      onChange={(checked) => setField("formEnabled", checked)}
                      label={draft.formEnabled ? "Form is on" : "Form is off"}
                      hint="With the form off, the page shows the email address alone."
                    />
                  </Field>
                  <StringListField
                    label="Enquiry types"
                    values={draft.topics}
                    onChange={(topics) => setField("topics", topics)}
                    placeholder="Work with us"
                    addLabel="Enquiry type"
                    hint="Shown as buttons on the form and saved with each message."
                  />
                </section>
              )}

              <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                <BlockListEditor
                  blocks={draft.blocks}
                  onChange={(blocks) => setField("blocks", blocks)}
                  label="Page content"
                />
              </section>

              {showsProjects && (
                <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">
                      {pageProjects.length} {pageProjects.length === 1 ? "project" : "projects"} on the slate
                    </span>
                    <Link
                      to="/admin/projects"
                      className="text-[10px] tracking-[0.15em] uppercase text-white/35 hover:text-white/70 transition-colors"
                    >
                      Manage in Projects →
                    </Link>
                  </div>
                  <div className="space-y-1">
                    {pageProjects.map((project) => (
                      <Link
                        key={project.id}
                        to={`/admin/projects/${project.id}/edit`}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors group"
                      >
                        {project.thumbnail && (
                          <img
                            src={project.thumbnail}
                            alt=""
                            className="w-12 h-8 object-cover rounded shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        )}
                        <span className="flex-1 text-sm text-white/60 group-hover:text-white/90 transition-colors truncate">
                          {project.title}
                        </span>
                        {!project.published && (
                          <span className="text-[9px] tracking-[0.15em] uppercase text-white/25 shrink-0">
                            Draft
                          </span>
                        )}
                        <span className="text-[10px] text-white/25 tabular-nums shrink-0">{project.year}</span>
                      </Link>
                    ))}
                    {!pageProjects.length && (
                      <p className="text-[11px] text-white/25 px-2">None yet — add one in Projects.</p>
                    )}
                  </div>
                </section>
              )}

              {selected === "journal" && <RelatedHint to="/admin/journal" label="Manage Journal entries" />}
              {selected === "services" && <RelatedHint to="/admin/services" label="Manage the services list" />}
              {selected === "contact" && <RelatedHint to="/admin/messages" label="Read enquiries" />}

              <section className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 space-y-5">
                <h2 className="text-xs tracking-[0.15em] uppercase text-white/35 font-medium">
                  How this page appears when shared
                </h2>
                <p className="text-[11px] text-white/25 -mt-2">
                  What shows up in a Google search result, or when the link is shared on WhatsApp, Instagram
                  or Twitter. Leave any of this blank and it uses the heading and lead paragraph above instead.
                </p>
                <TextField
                  label="Preview title"
                  value={draft.seo_title}
                  onChange={(value) => setField("seo_title", value)}
                  placeholder={draft.title || entry?.label}
                  hint="Optional. Defaults to the heading above."
                />
                <TextareaField
                  label="Preview description"
                  rows={2}
                  value={draft.seo_description}
                  onChange={(value) => setField("seo_description", value)}
                  hint="One or two sentences shown in search results and link previews."
                />
                <ImageField
                  label="Preview image"
                  value={draft.seo_image}
                  onChange={(value) => setField("seo_image", value)}
                  hint="Optional. Shown when the page is shared on social media."
                />
              </section>

              {entry?.kind === "page" && entry.exists && (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="text-[10px] tracking-[0.15em] uppercase text-red-400/50 hover:text-red-400/80 transition-colors cursor-pointer"
                >
                  Delete this page
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Create ─── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 max-w-md w-full space-y-5">
            <div>
              <h3 className="text-sm text-white/70 font-medium">New page</h3>
              <p className="text-xs text-white/30 mt-1">
                It gets its own address straight away and uses the site's existing design.
              </p>
            </div>

            <TextField
              label="Title"
              value={newPage.title}
              onChange={(value) =>
                setNewPage((prev) => ({
                  ...prev,
                  title: value,
                  slug: prev.slug ? prev.slug : slugify(value),
                }))
              }
              placeholder="Press Kit"
            />
            <TextField
              label="Address"
              value={newPage.slug}
              onChange={(value) => setNewPage((prev) => ({ ...prev, slug: slugify(value) }))}
              placeholder="press-kit"
              hint={`The page will live at /${newPage.slug || slugify(newPage.title) || "your-page"}`}
            />
            <Toggle
              checked={newPage.addToMenu}
              onChange={(checked) => setNewPage((prev) => ({ ...prev, addToMenu: checked }))}
              label="Add to the menu"
              hint="You can always change this later in Menu."
            />
            <Toggle
              checked={newPage.published}
              onChange={(checked) => setNewPage((prev) => ({ ...prev, published: checked }))}
              label={newPage.published ? "Publish now" : "Start as a draft"}
              hint="A draft is invisible to visitors — its address shows “not found” — until you publish it."
            />

            <div className="flex gap-3 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <PrimaryButton onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create page"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      <ConfirmDelete
        open={confirmDelete}
        title="Delete page"
        body={`This removes /${selected} and takes it out of the menu. Unpublish instead if you might bring it back.`}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setConfirmDelete(false)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
};

/** A pointer to the screen that owns the rest of this page's content. */
const RelatedHint = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="block bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-4 text-[11px] tracking-[0.15em] uppercase text-white/35 hover:text-white/70 hover:border-white/[0.12] transition-colors"
  >
    {label} →
  </Link>
);

export default AdminPages;
