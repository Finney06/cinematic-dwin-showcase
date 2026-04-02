import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchMenuItems } from "@/lib/api";
import {
  updateMenuItem,
  createMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from "@/lib/adminApi";
import { toast } from "sonner";

const AdminMenu = () => {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", path: "/", page_type: "category" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: menuItems = [], isLoading } = useQuery({
    queryKey: ["adminMenuItems"],
    queryFn: () => fetchMenuItems(true),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, visible }: { id: number; visible: boolean }) =>
      updateMenuItem(id, { visible: visible ? 1 : 0 } as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast.success("Menu item updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateLabelMutation = useMutation({
    mutationFn: ({ id, label, path }: { id: number; label: string; path: string }) =>
      updateMenuItem(id, { label, path } as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast.success("Menu item updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addMutation = useMutation({
    mutationFn: () => createMenuItem(newItem as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast.success("Menu item added");
      setShowAddForm(false);
      setNewItem({ label: "", path: "/", page_type: "category" });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
      toast.success("Menu item deleted");
      setDeleteConfirm(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const moveItem = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= menuItems.length) return;

    const items = menuItems.map((item, i) => ({
      id: item.id,
      sort_order: i === index ? newIndex + 1 : i === newIndex ? index + 1 : i + 1,
    }));

    reorderMenuItems(items)
      .then(() => {
        queryClient.invalidateQueries({ queryKey: ["adminMenuItems"] });
        toast.success("Reordered");
      })
      .catch((err) => toast.error(err.message));
  };

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ label: "", path: "" });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl tracking-[0.06em] text-white/80 font-light">
            Menu & Navigation
          </h1>
          <p className="text-xs text-white/25 tracking-wide mt-1">
            Manage navigation items, order, and visibility
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-white/90 text-black px-4 py-2.5 rounded-lg text-xs tracking-[0.1em] uppercase font-medium hover:bg-white transition-colors cursor-pointer"
        >
          + Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden max-w-2xl">
          <div className="divide-y divide-white/[0.04]">
            {menuItems.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center gap-4 px-5 py-4 group transition-colors ${
                  !item.visible ? "opacity-40" : ""
                }`}
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="text-white/15 hover:text-white/50 disabled:opacity-20 text-xs cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(index, "down")}
                    disabled={index === menuItems.length - 1}
                    className="text-white/15 hover:text-white/50 disabled:opacity-20 text-xs cursor-pointer"
                  >
                    ▼
                  </button>
                </div>

                {/* Order number */}
                <span className="text-[10px] text-white/15 tabular-nums w-5 text-center">
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                {editingId === item.id ? (
                  <div className="flex-1 flex gap-3">
                    <input
                      type="text"
                      value={editForm.label}
                      onChange={(e) => setEditForm((p) => ({ ...p, label: e.target.value }))}
                      className="flex-1 bg-white/[0.06] border border-white/[0.1] rounded-md px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-white/20"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={editForm.path}
                      onChange={(e) => setEditForm((p) => ({ ...p, path: e.target.value }))}
                      className="w-32 bg-white/[0.06] border border-white/[0.1] rounded-md px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:border-white/20"
                      placeholder="/path"
                    />
                    <button
                      onClick={() => {
                        updateLabelMutation.mutate({
                          id: item.id,
                          label: editForm.label,
                          path: editForm.path,
                        });
                        setEditingId(null);
                      }}
                      className="text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/60">{item.label}</p>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {item.path} · {item.page_type}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {editingId !== item.id && (
                  <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditForm({ label: item.label, path: item.path });
                      }}
                      className="text-[10px] tracking-wider uppercase text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item.id)}
                      className="text-[10px] tracking-wider uppercase text-red-400/30 hover:text-red-400/60 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Visibility Toggle */}
                <button
                  onClick={() =>
                    toggleMutation.mutate({
                      id: item.id,
                      visible: !item.visible,
                    })
                  }
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                    item.visible ? "bg-white/20" : "bg-white/[0.06]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                      item.visible
                        ? "left-[22px] bg-white/70"
                        : "left-0.5 bg-white/20"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Item Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-sm text-white/70 font-medium mb-5">Add Menu Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Label
                </label>
                <input
                  type="text"
                  value={newItem.label}
                  onChange={(e) => setNewItem((p) => ({ ...p, label: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20"
                  placeholder="Menu label"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Path
                </label>
                <input
                  type="text"
                  value={newItem.path}
                  onChange={(e) => setNewItem((p) => ({ ...p, path: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 placeholder:text-white/15 focus:outline-none focus:border-white/20"
                  placeholder="/path"
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-white/40 font-medium mb-2">
                  Type
                </label>
                <select
                  value={newItem.page_type}
                  onChange={(e) => setNewItem((p) => ({ ...p, page_type: e.target.value }))}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-sm text-white/80 focus:outline-none focus:border-white/20"
                >
                  <option value="category" className="bg-[#141414]">Category (shows projects)</option>
                  <option value="page" className="bg-[#141414]">Page (custom content)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => addMutation.mutate()}
                disabled={!newItem.label || addMutation.isPending}
                className="px-4 py-2 bg-white/90 text-black rounded-lg text-xs font-medium hover:bg-white transition-colors disabled:opacity-40 cursor-pointer"
              >
                {addMutation.isPending ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-5">
          <div className="bg-[#141414] border border-white/[0.08] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-sm text-white/70 font-medium mb-2">Delete Menu Item</h3>
            <p className="text-xs text-white/35 mb-6">
              This will remove the item from navigation. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-white/[0.06] rounded-lg text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="px-4 py-2 bg-red-500/20 rounded-lg text-xs text-red-400/70 hover:bg-red-500/30 hover:text-red-400 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
