import CollectionAdmin from "@/components/admin/CollectionAdmin";

/** Services — what CRA8 offers, in the order they appear on /services. */
const AdminServices = () => (
  <CollectionAdmin
    collection="services"
    title="Services"
    description="The crafts listed on /services. Drag to reorder — the page follows this order exactly."
    singular="Service"
    titleKey="title"
    subtitleKey="summary"
    imageKey="image"
    publishable={false}
    publicPath={() => "/services"}
    blank={{
      title: "",
      summary: "",
      description: "",
      image: "",
      capabilities: [],
    }}
    fields={[
      { key: "title", label: "Service", type: "text", half: true, placeholder: "Cinematography" },
      {
        key: "slug",
        label: "URL key",
        type: "text",
        half: true,
        hint: "Leave blank to build it from the title.",
      },
      {
        key: "summary",
        label: "Summary",
        type: "textarea",
        rows: 2,
        hint: "One line, set large beside the title.",
      },
      { key: "description", label: "Description", type: "textarea", rows: 5 },
      { key: "image", label: "Image", type: "image", hint: "Optional. A still from work in this craft." },
      {
        key: "capabilities",
        label: "Capabilities",
        type: "strings",
        placeholder: "Director of Photography",
        addLabel: "Capability",
        hint: "Listed like on-screen credits beside the description.",
      },
    ]}
  />
);

export default AdminServices;
