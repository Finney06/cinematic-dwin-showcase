import CollectionAdmin from "@/components/admin/CollectionAdmin";

/**
 * Journal — CRA8's own writing. Sections ("Behind the Scenes", "Culture", and
 * anything CRA8 invents next) are just the Section field: type a new one and
 * it appears as a filter on /journal automatically.
 */
const AdminJournal = () => (
  <CollectionAdmin
    collection="journal"
    title="Journal"
    description="Behind the scenes, director stories, creative process, campaign launches, culture and studio news."
    singular="Entry"
    titleKey="title"
    subtitleKey="kicker"
    imageKey="cover_image"
    publicPath={(item) => `/journal/${item.slug}`}
    publishHint="Drafts are invisible on the site until you publish them."
    blank={{
      title: "",
      kicker: "",
      excerpt: "",
      cover_image: "",
      author: "",
      published_at: new Date().toISOString().slice(0, 10),
      blocks: [],
      featured: 0,
      published: 0,
      seo_title: "",
      seo_description: "",
    }}
    fields={[
      { key: "title", label: "Title", type: "text", placeholder: "On set with Prophet Suddenly 4" },
      {
        key: "kicker",
        label: "Section",
        type: "text",
        half: true,
        placeholder: "Behind the Scenes",
        hint: "Shown above the title, and used to group the Journal index.",
      },
      { key: "author", label: "Author", type: "text", half: true, placeholder: "Author name" },
      { key: "published_at", label: "Date", type: "date", half: true },
      {
        key: "slug",
        label: "URL",
        type: "text",
        half: true,
        placeholder: "on-set-prophet-suddenly-4",
        hint: "Leave blank to build it from the title. Changing it breaks old links.",
      },
      {
        key: "excerpt",
        label: "Standfirst",
        type: "textarea",
        rows: 3,
        hint: "One or two sentences. Shown on the Journal index and in link previews.",
      },
      { key: "cover_image", label: "Cover image", type: "image" },
      { key: "featured", label: "Feature this entry", type: "toggle", hint: "Featured entries lead the index." },
      { key: "blocks", label: "The entry", type: "blocks" },
      {
        key: "seo_title",
        label: "Preview title",
        type: "text",
        half: true,
        hint: "What shows up in a Google search result. Optional — defaults to the title.",
      },
      {
        key: "seo_description",
        label: "Preview description",
        type: "text",
        half: true,
        hint: "What shows up in a Google search result or a shared link. Optional — defaults to the standfirst.",
      },
    ]}
  />
);

export default AdminJournal;
