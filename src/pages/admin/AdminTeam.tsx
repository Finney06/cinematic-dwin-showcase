import CollectionAdmin from "@/components/admin/CollectionAdmin";

/**
 * Team — the About page's grid. It stays empty until CRA8 has people to list,
 * and the section simply doesn't render on the site while it is.
 */
const AdminTeam = () => (
  <CollectionAdmin
    collection="team"
    title="Team"
    description="People shown on the About page. Leave this empty and the section is hidden entirely."
    singular="Member"
    titleKey="name"
    subtitleKey="role"
    imageKey="image"
    publishable={false}
    publicPath={() => "/about"}
    blank={{ name: "", role: "", bio: "", image: "", links: [] }}
    fields={[
      { key: "name", label: "Name", type: "text", half: true, placeholder: "DWINDIK" },
      { key: "role", label: "Role", type: "text", half: true, placeholder: "Director of Photography" },
      { key: "bio", label: "Bio", type: "textarea", rows: 4 },
      { key: "image", label: "Portrait", type: "image" },
      {
        key: "links",
        label: "Links",
        type: "pairs",
        keyName: "label",
        valueName: "url",
        keyPlaceholder: "Instagram",
        valuePlaceholder: "https://…",
        addLabel: "Link",
      },
    ]}
  />
);

export default AdminTeam;
