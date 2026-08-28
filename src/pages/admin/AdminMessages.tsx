import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminHeader, ConfirmDelete } from "@/components/admin/FormFields";
import { deleteMessage, fetchMessages, updateMessageStatus } from "@/lib/adminApi";
import { ADMIN_QUERY, invalidateContent } from "@/lib/adminQueries";
import type { ContactMessage } from "@/lib/api";

const FILTERS = [
  { key: "new", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
] as const;

/**
 * The Contact form's inbox. Messages are stored in the database rather than
 * emailed, so the form keeps working years from now without an email provider,
 * an API key, or a billing account that can lapse.
 */
const AdminMessages = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("new");
  const [openId, setOpenId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["adminMessages"],
    queryFn: fetchMessages,
    ...ADMIN_QUERY,
  });

  const messages = data?.messages || [];
  const visible = filter === "all" ? messages : messages.filter((message) => message.status === filter);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ContactMessage["status"] }) =>
      updateMessageStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminMessages"] }),
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMessages"] });
      setDeleteId(null);
      toast.success("Message deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const open = (message: ContactMessage) => {
    setOpenId(openId === message.id ? null : message.id);
    if (message.status === "new") statusMutation.mutate({ id: message.id, status: "read" });
  };

  return (
    <div>
      <AdminHeader
        title="Messages"
        description="Enquiries sent through the Contact page. Nothing here is emailed out — this is the inbox."
      >
        {data?.unread ? (
          <span className="px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-300/70 text-[10px] tracking-[0.15em] uppercase">
            {data.unread} unread
          </span>
        ) : null}
      </AdminHeader>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setFilter(option.key)}
            className={`px-3 py-2 rounded-lg text-xs tracking-wide transition-colors cursor-pointer ${
              filter === option.key
                ? "bg-white/[0.08] text-white/60"
                : "bg-white/[0.03] text-white/25 hover:text-white/50"
            }`}
          >
            {option.label}
            {option.key === "new" && data?.unread ? ` (${data.unread})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-12 text-center">
          <p className="text-sm text-white/40">Couldn't load messages.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-[11px] tracking-[0.15em] uppercase text-white/45 hover:text-white/70 cursor-pointer"
          >
            Try again
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-6 py-14 text-center">
          <p className="text-sm text-white/30">
            {filter === "new" ? "No unread messages" : "Nothing here"}
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden max-w-3xl divide-y divide-white/[0.04]">
          {visible.map((message) => (
            <div key={message.id} className={message.status === "new" ? "" : "opacity-70"}>
              <button
                type="button"
                onClick={() => open(message)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors cursor-pointer"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    message.status === "new" ? "bg-emerald-300/70" : "bg-white/10"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] text-white/70 truncate">
                    {message.name}
                    <span className="text-white/25 text-[13px]"> · {message.topic}</span>
                  </p>
                  <p className="text-[11px] text-white/25 mt-0.5 truncate">{message.email}</p>
                </div>
                <span className="text-[10px] text-white/20 whitespace-nowrap shrink-0">
                  {new Date(message.created_at).toLocaleDateString()}
                </span>
              </button>

              {openId === message.id && (
                <div className="px-5 pb-5 -mt-1">
                  <p className="text-sm text-white/60 leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/[0.06] rounded-lg p-4">
                    {message.message}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        `Re: ${message.topic} — CRA8`
                      )}`}
                      className="px-3 py-1.5 bg-white/90 text-black rounded-md text-[10px] tracking-wider uppercase font-medium hover:bg-white transition-colors"
                    >
                      Reply by email
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        statusMutation.mutate({
                          id: message.id,
                          status: message.status === "archived" ? "read" : "archived",
                        })
                      }
                      className="px-3 py-1.5 bg-white/[0.06] rounded-md text-[10px] tracking-wider uppercase text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      {message.status === "archived" ? "Unarchive" : "Archive"}
                    </button>
                    <button
                      type="button"
                      onClick={() => statusMutation.mutate({ id: message.id, status: "new" })}
                      className="px-3 py-1.5 bg-white/[0.06] rounded-md text-[10px] tracking-wider uppercase text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      Mark unread
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(message.id)}
                      className="px-3 py-1.5 bg-red-500/10 rounded-md text-[10px] tracking-wider uppercase text-red-400/50 hover:text-red-400/80 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDelete
        open={deleteId !== null}
        title="Delete message"
        body="This permanently removes the enquiry. Archive it instead if you might want it later."
        onConfirm={() => deleteMutation.mutate(deleteId as number)}
        onCancel={() => setDeleteId(null)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminMessages;
