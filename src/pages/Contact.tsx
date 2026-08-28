import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageShell from "@/components/site/PageShell";
import Masthead from "@/components/site/Masthead";
import Reveal from "@/components/site/Reveal";
import PageBlocks from "@/components/PageBlocks";
import { useSiteSettings } from "@/hooks/useContent";
import NotFound from "@/pages/NotFound";
import { useCmsPage } from "@/hooks/useCmsPage";
import { submitContactMessage } from "@/lib/api";
import { orEmpty } from "@/lib/brand";

const DEFAULT_TOPICS = ["A project", "Working with CRA8", "Press", "Internship", "Something else"];

const label = "block font-body text-[11px] tracking-[0.18em] uppercase text-foreground/40 mb-2";
const input =
  "w-full bg-foreground/[0.03] border border-foreground/10 focus:border-foreground/35 rounded-sm px-4 py-3 font-body text-[15px] text-foreground/90 placeholder:text-foreground/25 focus:outline-none transition-colors";

const readStringList = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) return fallback;
  const list = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return list.length ? list : fallback;
};

/**
 * Contact.
 *
 * A form, and the studio's details beside it. Four fields is everything CRA8
 * needs to reply properly — who you are, where to write back, what it's about,
 * and what you want — and nothing a visitor has to think about. Labels are
 * visible rather than hidden in placeholders, the enquiry type is a plain
 * dropdown, and the whole thing fits on one screen.
 */
const Contact = () => {
  const page = useCmsPage("contact", "Contact");
  const { data: settings } = useSiteSettings();

  const formEnabled = page.content.formEnabled !== false;
  const topics = readStringList(page.content.topics, DEFAULT_TOPICS);

  // Hooks run unconditionally above this line — the early return below must
  // come after every hook the component ever calls, on every render.
  const [form, setForm] = useState({ name: "", email: "", topic: topics[0], message: "", company: "" });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => submitContactMessage(form),
    onSuccess: () => setForm({ name: "", email: "", topic: topics[0], message: "", company: "" }),
  });

  if (!page.isLoading && page.isUnpublished) return <NotFound />;

  const email = orEmpty(settings?.contact_email);
  const phone = orEmpty(settings?.contact_phone);
  const location = orEmpty(settings?.contact_location);

  const socialLinks = (() => {
    if (settings?.social_links) {
      try {
        const parsed = JSON.parse(settings.social_links);
        if (Array.isArray(parsed)) return parsed.filter((link) => link?.label && link?.url);
      } catch {
        return [];
      }
    }
    return [
      settings?.social_instagram ? { label: "Instagram", url: settings.social_instagram } : null,
      settings?.social_youtube ? { label: "YouTube", url: settings.social_youtube } : null,
      settings?.social_twitter ? { label: "Twitter", url: settings.social_twitter } : null,
    ].filter(Boolean) as { label: string; url: string }[];
  })();

  const setField = (key: keyof typeof form, value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return setError("Please add your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      return setError("Please check your email address — that's where we'll reply.");
    if (form.message.trim().length < 10) return setError("Tell us a little more so we can reply properly.");
    setError("");
    mutation.mutate();
  };

  return (
    <PageShell title={page.seo.title} description={page.seo.description} image={page.seo.image}>
      <Masthead
        eyebrow="Contact"
        title={page.title}
        intro={page.intro || "Tell us what you're working on. We read everything that comes in."}
      />

      <PageBlocks blocks={page.blocks} className="mt-10 max-w-2xl" />

      <div className="mt-14 sm:mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-8">
        {/* ═══ THE FORM ═══ */}
        {formEnabled && (
          <Reveal className="lg:col-span-7">
            {mutation.isSuccess ? (
              <div className="border border-foreground/10 rounded-sm p-8 sm:p-10">
                <p className="font-display text-2xl sm:text-3xl font-light text-foreground/85 leading-[1.3]">
                  Thank you — your message is with us.
                </p>
                <p className="mt-4 font-body text-sm text-foreground/45 leading-relaxed">
                  We read everything that comes in and reply to what we can
                  {email ? <>, from {email}</> : null}.
                </p>
                <button
                  type="button"
                  onClick={() => mutation.reset()}
                  className="mt-8 font-body text-[11px] tracking-[0.2em] uppercase text-foreground/45 hover:text-foreground/80 transition-colors border-b border-foreground/15 pb-1 cursor-pointer"
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* Hidden from people, irresistible to bots. */}
                <div aria-hidden className="absolute w-px h-px overflow-hidden -left-[9999px]">
                  <label htmlFor="contact-company">Company</label>
                  <input
                    id="contact-company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.company}
                    onChange={(event) => setField("company", event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className={label}>
                      Your name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(event) => setField("name", event.target.value)}
                      className={input}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className={label}>
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(event) => setField("email", event.target.value)}
                      placeholder="you@example.com"
                      className={input}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-topic" className={label}>
                    What's it about?
                  </label>
                  <select
                    id="contact-topic"
                    value={form.topic}
                    onChange={(event) => setField("topic", event.target.value)}
                    className={input}
                  >
                    {topics.map((topic) => (
                      <option key={topic} value={topic} className="bg-background text-foreground">
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className={label}>
                    Your message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={form.message}
                    onChange={(event) => setField("message", event.target.value)}
                    placeholder="What you're making, roughly when, and how we can help."
                    className={`${input} resize-y`}
                  />
                </div>

                {(error || mutation.isError) && (
                  <p role="alert" className="font-body text-sm text-foreground/70">
                    {error || (mutation.error as Error)?.message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full sm:w-auto px-8 py-3.5 bg-foreground text-background font-body text-[11px] tracking-[0.25em] uppercase hover:bg-foreground/85 transition-colors disabled:opacity-40 cursor-pointer rounded-sm"
                >
                  {mutation.isPending ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </Reveal>
        )}

        {/* ═══ OR JUST WRITE ═══ */}
        <Reveal
          delay={0.1}
          className={formEnabled ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-6"}
        >
          <div className="space-y-8">
            {email && (
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-2">
                  {formEnabled ? "Or email us" : "Email"}
                </span>
                <a
                  href={`mailto:${email}`}
                  className="font-body text-base text-foreground/70 hover:text-foreground transition-colors break-all"
                >
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-2">
                  Phone
                </span>
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="font-body text-base text-foreground/70 hover:text-foreground transition-colors"
                >
                  {phone}
                </a>
              </div>
            )}
            {location && (
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-2">
                  Studio
                </span>
                <p className="font-body text-base text-foreground/70 whitespace-pre-line leading-relaxed">
                  {location}
                </p>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div>
                <span className="font-body text-[10px] tracking-[0.3em] uppercase text-foreground/25 block mb-2">
                  Follow
                </span>
                <div className="flex flex-col gap-1.5">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body text-base text-foreground/70 hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
            {!email && !phone && !location && socialLinks.length === 0 && (
              <p className="font-body text-sm text-foreground/30 leading-relaxed">
                Messages sent here reach the studio directly.
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
};

export default Contact;
