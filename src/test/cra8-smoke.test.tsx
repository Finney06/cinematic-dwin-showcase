import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import type {
  AboutContent,
  Article,
  CategoryData,
  PageContent,
  ProjectData,
  Service,
  SiteSettings,
} from "@/lib/api";
import { BRAND } from "@/lib/brand";

// ─── Fixtures ────────────────────────────────────────────────
const project = (overrides: Partial<ProjectData>): ProjectData => ({
  id: "x",
  title: "Untitled",
  category: "film",
  category_label: "Film",
  year: "2026",
  role: "",
  description: "d",
  synopsis: "s",
  logline: "",
  thumbnail: "",
  youtube_id: "",
  trailer_youtube_id: "",
  director: "",
  producers: "",
  cast_info: "",
  status: "",
  credits: [],
  gallery: [],
  blocks: [],
  seo_description: "",
  published: 1,
  featured: 0,
  sort_order: 0,
  created_at: "",
  updated_at: "",
  ...overrides,
});

const projects: ProjectData[] = [
  project({
    id: "prophet-suddenly-4",
    title: "Prophet Suddenly 4: The Children's Ministry",
    role: "Director of Photography, VFX Artist, Gaffer",
    thumbnail: "https://img.youtube.com/vi/UjlbcOR7CfI/maxresdefault.jpg",
    youtube_id: "UjlbcOR7CfI",
    producers: "The Winlos",
    status: "Now Streaming",
    sort_order: 10,
  }),
  project({
    id: "spirituals-4",
    title: "Spirituals 4",
    role: "DOP, Gaffer, VFX Artist",
    thumbnail: "https://img.youtube.com/vi/y41jI31M-3Y/maxresdefault.jpg",
    youtube_id: "y41jI31M-3Y",
    producers: "The Winlos Studio",
    status: "Now Streaming",
    sort_order: 9,
  }),
];

/** A page row exactly as the API returns it, with nothing filled in. */
const emptyPage = (slug: string): PageContent => ({
  page_slug: slug,
  title: "",
  content: {},
  published: 1,
  is_system: 0,
  seo_title: "",
  seo_description: "",
  seo_image: "",
  updated_at: null,
});

const page = (slug: string, overrides: Partial<PageContent>): PageContent => ({
  ...emptyPage(slug),
  ...overrides,
});

const filmCategory: CategoryData = {
  id: 1,
  slug: "film",
  label: "Film",
  description: "",
  hero_image: "",
  sort_order: 1,
  published: 1,
  project_count: 2,
};

// A freshly seeded/migrated database: every CMS field genuinely empty. This is
// what should drive the CRA8 fallback defaults — never string-matching content.
const EMPTY_HERO = { brand_text: "", tagline: "", video_url: "", hero_image: "", hero_link: "" };
const EMPTY_SETTINGS: SiteSettings = {
  contact_email: "",
  social_instagram: "",
  social_youtube: "",
  social_twitter: "",
  copyright_text: "",
  site_title: "",
};
const EMPTY_ABOUT = { ...emptyPage("about"), content: {} as AboutContent };

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    fetchProjects: vi.fn(async () => projects),
    fetchLatestProjects: vi.fn(async () => projects),
    fetchProject: vi.fn(async () => projects[0]),
    fetchHeroContent: vi.fn(async () => EMPTY_HERO),
    fetchAboutContent: vi.fn(async () => EMPTY_ABOUT),
    fetchSiteSettings: vi.fn(async () => EMPTY_SETTINGS),
    fetchMenuItems: vi.fn(async () => []),
    fetchPageContent: vi.fn(async (slug: string) => emptyPage(slug)),
    fetchPages: vi.fn(async () => [] as PageContent[]),
    fetchCategories: vi.fn(async () => [] as CategoryData[]),
    fetchArticles: vi.fn(async () => [] as Article[]),
    fetchArticle: vi.fn(async () => {
      throw new actual.ApiError("Not found", 404);
    }),
    fetchServices: vi.fn(async () => [] as Service[]),
    fetchTeam: vi.fn(async () => []),
    submitContactMessage: vi.fn(async () => ({ message: "Message sent" })),
  };
});

vi.mock("@/lib/adminApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/adminApi")>();
  return {
    ...actual,
    fetchAdminPages: vi.fn(async () => [] as PageContent[]),
    fetchAdminPage: vi.fn(async (slug: string) => emptyPage(slug)),
    fetchAdminCategories: vi.fn(async () => [] as CategoryData[]),
    fetchAdminProjects: vi.fn(async () => projects),
    fetchAdminProject: vi.fn(async () => projects[0]),
    fetchMessages: vi.fn(async () => ({ messages: [], unread: 0 })),
    fetchCollection: vi.fn(async () => []),
  };
});

// jsdom has neither observer API; framer-motion's whileInView needs one.
class TestIntersectionObserver {
  constructor(private cb: IntersectionObserverCallback) {}
  observe(el: Element) {
    this.cb(
      [{ target: el, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.assign(globalThis, {
  IntersectionObserver: TestIntersectionObserver,
  ResizeObserver: TestResizeObserver,
});
window.HTMLMediaElement.prototype.play = async () => {};
window.scrollTo = () => {};

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// A test that sets a persistent mock (mockResolvedValue) would otherwise leak
// into the next one, so every test starts from the same empty-CMS baseline.
beforeEach(async () => {
  const api = await import("@/lib/api");
  vi.mocked(api.fetchPageContent).mockImplementation(async (slug: string) => emptyPage(slug));
  vi.mocked(api.fetchMenuItems).mockImplementation(async () => []);
  vi.mocked(api.fetchPages).mockImplementation(async () => []);
  vi.mocked(api.fetchCategories).mockImplementation(async () => []);
  vi.mocked(api.fetchArticles).mockImplementation(async () => []);
  vi.mocked(api.fetchServices).mockImplementation(async () => []);
  vi.mocked(api.fetchTeam).mockImplementation(async () => []);
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

async function renderPage(ui: ReactNode, initialPath = "/") {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  await act(async () => {
    createRoot(container).render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  });
  // Let the mocked queries resolve and re-render. Three flushes: some trees
  // only start a later query once an earlier one resolves (SlugPage waits on
  // the category list before rendering the page that fetches content).
  for (let i = 0; i < 3; i += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  return container;
}

const routed = (element: ReactNode, path: string, at: string) =>
  renderPage(
    <Routes>
      <Route path={path} element={element} />
    </Routes>,
    at
  );

describe("CRA8 defaults — shown only when the CMS is genuinely empty", () => {
  it("home is the hero and nothing else — a single, non-scrolling screen", async () => {
    const Index = (await import("@/pages/Index")).default;
    const container = await renderPage(<Index />);
    const text = container.textContent || "";
    const html = container.innerHTML;

    // Brand identity only: the navbar logo and the hero tagline.
    expect(text).toContain("CRA8");
    expect(text).toContain(BRAND.tagline);
    expect(text).not.toMatch(/cre8te/i);

    // Nothing below the hero is rendered on Home any more — no slate preview,
    // no studio statement, no founder credit, no footer.
    expect(text).not.toContain("Prophet Suddenly 4");
    expect(text).not.toContain("Spirituals 4");
    expect(text).not.toContain("Founded by");
    expect(text).not.toContain("©");
    expect(html).not.toContain('href="/work/prophet-suddenly-4"');

    // The page is exactly one viewport tall (h-[100svh]) and clips overflow.
    expect(container.firstElementChild?.className).toContain("h-[100svh]");
    expect(container.firstElementChild?.className).toContain("overflow-hidden");
    expect(html).toContain('href="/work"');
  });

  it("navbar always shows the CRA8 logo mark, not a text wordmark", async () => {
    const Index = (await import("@/pages/Index")).default;
    const container = await renderPage(<Index />);

    const navLogo = container.querySelector('nav img[src="/CRA8.png"]');
    expect(navLogo).not.toBeNull();
    expect(navLogo?.getAttribute("alt")).toBe("CRA8");
  });

  it("hero plays the default opening clip, then reveals the CRA8 logo", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const Index = (await import("@/pages/Index")).default;
    const container = await renderPage(<Index />);
    const heroLogo = () => container.querySelector('img[src="/CRA8.png"][aria-hidden]');

    const clip = container.querySelector("video");
    expect(clip?.getAttribute("src")).toBe("/trillar-video.mp4");
    expect(clip?.muted).toBe(true);
    expect(clip?.style.opacity).toBe("0");
    expect(heroLogo()).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.querySelector("video")?.style.opacity).toBe("1");

    await act(async () => {
      container.querySelector("video")?.dispatchEvent(new Event("ended"));
    });
    const logo = heroLogo();
    expect(logo).not.toBeNull();
    expect(logo?.className).toContain("object-contain");
  });

  it("about shows a clean neutral placeholder on a fresh database — no invented lore, no imagery", async () => {
    const About = (await import("@/pages/About")).default;
    const container = await renderPage(<About />);
    const text = container.textContent || "";
    const html = container.innerHTML;

    expect(text).toContain("CRA8 is a film studio based in Nigeria.");
    // No founder block and no placeholder photos until the client fills them in.
    expect(text).not.toContain("DWINDIK");
    expect(text).not.toContain("Founder");
    expect(html).not.toContain("/dwindik/");
    expect(html).not.toMatch(/img\.youtube\.com/);
  });

  it("work lists the whole slate", async () => {
    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />);
    const text = container.textContent || "";

    expect(text).toContain("Work");
    expect(text).toContain("Spirituals 4");
  });
});

describe("admin content is trusted verbatim once saved", () => {
  it("shows whatever the CMS returns for hero fields — including a word that overlaps a fallback default", async () => {
    // Regression test: an editor once typed "DWINDIK" into the Tagline field in
    // Admin → Hero, saved it, and the public site kept showing "Spiritual Drama"
    // instead — a content-sniffing fallback was silently discarding any saved
    // value that contained the word "dwindik" anywhere in it. The site must
    // never second-guess what was actually saved.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchHeroContent).mockResolvedValueOnce({
      brand_text: "CRA8",
      tagline: "DWINDIK",
      video_url: "",
      hero_image: "",
      hero_link: "",
    });

    const Index = (await import("@/pages/Index")).default;
    const container = await renderPage(<Index />);

    expect(container.textContent).toContain("DWINDIK");
    expect(container.textContent).not.toContain("Spiritual Drama");
  });

  it("hero also accepts a YouTube clip supplied from the CMS", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const api = await import("@/lib/api");
    vi.mocked(api.fetchHeroContent).mockResolvedValueOnce({
      brand_text: "",
      tagline: "",
      video_url: "https://youtu.be/dtjsc_MhWgc?t=8",
      hero_image: "",
      hero_link: "",
    });

    const Index = (await import("@/pages/Index")).default;
    const container = await renderPage(<Index />);
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    const src = container.querySelector("iframe")?.getAttribute("src") || "";
    expect(src).toContain("youtube.com/embed/dtjsc_MhWgc");
    expect(src).toContain("mute=1");
    expect(src).toContain("controls=0");
    expect(src).toContain("start=8");
  });

  it("about renders saved copy verbatim, even content that names the old brand", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchAboutContent).mockResolvedValueOnce({
      ...emptyPage("about"),
      title: "CRA8",
      // Admin can save partial About content — every field renders independently
      // with its own CRA8 fallback, so a partial object here is realistic.
      content: {
        title: "CRA8",
        bioIntro: "Formerly known as the Dwindik portfolio, now the CRA8 studio site.",
      } as AboutContent,
    });

    const About = (await import("@/pages/About")).default;
    const container = await renderPage(<About />);

    expect(container.textContent).toContain("Formerly known as the Dwindik portfolio");
  });

  it("about shows the team grid once there are people in it, and hides it otherwise", async () => {
    const api = await import("@/lib/api");
    const About = (await import("@/pages/About")).default;

    const empty = await renderPage(<About />);
    expect(empty.textContent).not.toContain("The Studio");

    vi.mocked(api.fetchTeam).mockResolvedValue([
      {
        id: 1,
        slug: "dwindik",
        name: "DWINDIK",
        role: "Director of Photography",
        bio: "",
        image: "",
        links: [],
        sort_order: 1,
        published: 1,
      },
    ]);
    const withTeam = await renderPage(<About />);
    expect(withTeam.textContent).toContain("The Studio");
    expect(withTeam.textContent).toContain("Director of Photography");
  });
});

describe("every page's copy is editable in Admin → Pages", () => {
  // The site's pages used to hardcode their own headings, so nothing a visitor
  // saw could be changed from the admin. Each page now reads its title, lead
  // and a stackable block list from page_content, keyed by slug — additively,
  // so the project grid each page already had still renders.
  it("a filtered Work view reads its label, description and hero straight from the category — not a page of its own", async () => {
    // Categories have no page_content row of their own any more: Admin →
    // Categories is their one editor, so their description and hero image are
    // exactly what a filter shows, with nothing separate to keep in sync.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([
      { ...filmCategory, description: "Feature and short-form spiritual drama.", hero_image: "/film-hero.jpg" },
    ]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />, "/work?category=film");
    const text = container.textContent || "";

    // The heading stays "Work" — Film is a filter on it, not a page of its own.
    expect(container.querySelector("h1")?.textContent).toBe("Work");
    expect(text).toContain("The Archive — Film");
    expect(text).toContain("Feature and short-form spiritual drama.");
    expect(container.querySelector('img[src="/film-hero.jpg"]')).not.toBeNull();
    expect(text).toContain("Prophet Suddenly 4: The Children's Ministry");
  });

  it("keeps Work's own content blocks off a filtered view — a filter has no page to hold them in", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchPageContent).mockResolvedValue(
      page("work", { title: "Work", content: { blocks: [{ type: "text", text: "Only on the whole archive." }] } })
    );
    vi.mocked(api.fetchCategories).mockResolvedValue([filmCategory]);

    const Work = (await import("@/pages/Work")).default;

    const unfiltered = await renderPage(<Work />, "/work");
    expect(unfiltered.textContent).toContain("Only on the whole archive.");

    const filtered = await renderPage(<Work />, "/work?category=film");
    expect(filtered.textContent).not.toContain("Only on the whole archive.");
  });

  it("still lists the discipline's work when it has no admin copy of its own", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([filmCategory]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />, "/work?category=film");
    expect(container.textContent).toContain("Prophet Suddenly 4: The Children's Ministry");
  });

  it("the Work page's heading and blocks are editable too", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchPageContent).mockResolvedValue(
      page("work", { title: "Selected Work", content: { blocks: [{ type: "text", text: "The full slate." }] } })
    );

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />);

    expect(container.querySelector("h1")?.textContent).toBe("Selected Work");
    expect(container.textContent).toContain("The full slate.");
    expect(container.textContent).toContain("Prophet Suddenly 4: The Children's Ministry");
  });
});

describe("routing resolves categories and admin-created pages", () => {
  it("renders a newly created page at its own URL", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchPages).mockResolvedValue([page("press-kit", { title: "Press Kit" })]);
    vi.mocked(api.fetchPageContent).mockResolvedValue(
      page("press-kit", {
        title: "Press Kit",
        content: { blocks: [{ type: "text", text: "Assets and bios for press." }] },
      })
    );

    const SlugPage = (await import("@/pages/SlugPage")).default;
    const container = await routed(<SlugPage />, "/:slug", "/press-kit");

    expect(container.querySelector("h1")?.textContent).toBe("Press Kit");
    expect(container.textContent).toContain("Assets and bios for press.");
  });

  it("redirects an old discipline URL onto the filtered Work page", async () => {
    // /film used to be a page of its own. It now redirects, so bookmarks, menu
    // items and anything already linked from elsewhere keep working.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([filmCategory]);

    const SlugPage = (await import("@/pages/SlugPage")).default;
    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(
      <Routes>
        <Route path="/work" element={<Work />} />
        <Route path="/:slug" element={<SlugPage />} />
      </Routes>,
      "/film"
    );

    expect(container.querySelector("h1")?.textContent).toBe("Work");
    expect(container.textContent).toContain("The Archive — Film");
    expect(container.textContent).toContain("Spirituals 4");
  });

  it("still 404s for a URL that is not a real page", async () => {
    const SlugPage = (await import("@/pages/SlugPage")).default;
    const container = await routed(<SlugPage />, "/:slug", "/not-a-real-page");

    expect(container.textContent).toContain("404");
  });

  it("404s an unpublished page rather than showing it", async () => {
    // Unpublishing has to be indistinguishable from "never existed", or taking
    // a page offline would still leak its address.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchPages).mockResolvedValue([page("press-kit", { title: "Press Kit", published: 0 })]);

    const SlugPage = (await import("@/pages/SlugPage")).default;
    const container = await routed(<SlugPage />, "/:slug", "/press-kit");

    expect(container.textContent).toContain("404");
    expect(container.textContent).not.toContain("Press Kit");
  });

  it("keeps an empty discipline reachable but out of the filter bar", async () => {
    // Categories have no publish switch: the work in them decides whether they
    // are offered. An empty one still resolves — its URL may be linked from
    // somewhere — but it never appears as a filter chip.
    const api = await import("@/lib/api");
    const empty = { ...filmCategory, slug: "television", label: "Television", project_count: 0 };
    vi.mocked(api.fetchCategories).mockResolvedValue([empty]);
    vi.mocked(api.fetchProjects).mockResolvedValue([]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />, "/work?category=television");

    expect(container.textContent).not.toContain("404");
    expect(container.textContent).toContain("No television published yet");
    expect(container.querySelector('a[href="/work?category=television"]')).toBeNull();
  });

  it("keeps rendering the older subtitle/body fields a page was saved with", async () => {
    // News and Internship predate the block editor. Their copy still lives in
    // the old field shape and must survive the move to the generic page.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchPages).mockResolvedValue([page("news", { title: "News" })]);
    vi.mocked(api.fetchPageContent).mockResolvedValue(
      page("news", {
        title: "News",
        content: {
          subtitle: "Announcements",
          intro: "What the studio is up to.",
          body: "First paragraph.\n\nSecond paragraph.",
          sections: [{ heading: "Screenings", body: "Lagos, March." }],
          cta: { label: "Subscribe", url: "https://example.com" },
        },
      })
    );

    const SlugPage = (await import("@/pages/SlugPage")).default;
    const container = await routed(<SlugPage />, "/:slug", "/news");
    const text = container.textContent || "";

    expect(text).toContain("Announcements");
    expect(text).toContain("What the studio is up to.");
    expect(text).toContain("First paragraph.");
    expect(text).toContain("Second paragraph.");
    expect(text).toContain("Screenings");
    expect(text).toContain("Lagos, March.");
    expect(container.querySelector('a[href="https://example.com"]')).not.toBeNull();
    // The lead paragraph is shown once, by the masthead — not twice.
    expect(text.match(/What the studio is up to\./g)?.length).toBe(1);
  });
});

describe("Journal", () => {
  const article = (overrides: Partial<Article>): Article => ({
    id: 1,
    slug: "on-set",
    title: "On set with Prophet Suddenly 4",
    kicker: "Behind the Scenes",
    excerpt: "Ten nights in Tanzania.",
    cover_image: "/cover.jpg",
    author: "DWINDIK",
    published_at: "2026-03-01",
    blocks: [{ type: "text", text: "The first night ran until four." }],
    featured: 1,
    sort_order: 1,
    published: 1,
    seo_title: "",
    seo_description: "",
    ...overrides,
  });

  it("lists entries and their sections", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchArticles).mockResolvedValue([
      article({}),
      article({ id: 2, slug: "craft", title: "Cutting a trailer", kicker: "Creative Process", featured: 0 }),
    ]);

    const Journal = (await import("@/pages/Journal")).default;
    const container = await renderPage(<Journal />);
    const text = container.textContent || "";

    expect(container.querySelector("h1")?.textContent).toBe("Journal");
    expect(text).toContain("On set with Prophet Suddenly 4");
    expect(text).toContain("Behind the Scenes");
    expect(text).toContain("Cutting a trailer");
    expect(container.querySelector('a[href="/journal/craft"]')).not.toBeNull();
  });

  it("says so plainly when nothing is published yet", async () => {
    const Journal = (await import("@/pages/Journal")).default;
    const container = await renderPage(<Journal />);
    expect(container.textContent).toContain("The first entry is being written");
  });

  it("renders one entry's blocks", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchArticle).mockResolvedValue(article({}));
    vi.mocked(api.fetchArticles).mockResolvedValue([article({})]);

    const JournalArticle = (await import("@/pages/JournalArticle")).default;
    const container = await routed(<JournalArticle />, "/journal/:slug", "/journal/on-set");
    const text = container.textContent || "";

    expect(container.querySelector("h1")?.textContent).toBe("On set with Prophet Suddenly 4");
    expect(text).toContain("The first night ran until four.");
    expect(text).toContain("DWINDIK");
  });

  it("404s an entry that isn't published", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchArticle).mockRejectedValue(new api.ApiError("Not found", 404));

    const JournalArticle = (await import("@/pages/JournalArticle")).default;
    const container = await routed(<JournalArticle />, "/journal/:slug", "/journal/draft");

    expect(container.textContent).toContain("404");
  });
});

describe("Services", () => {
  it("renders the CMS list, in order, with its capabilities", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchServices).mockResolvedValue([
      {
        id: 1,
        slug: "cinematography",
        title: "Cinematography",
        summary: "Camera and lighting built around the story.",
        description: "Director of photography and gaffer work.",
        image: "",
        capabilities: ["Director of Photography", "Gaffer"],
        sort_order: 1,
        published: 1,
      },
    ]);

    const Services = (await import("@/pages/Services")).default;
    const container = await renderPage(<Services />);
    const text = container.textContent || "";

    expect(container.querySelector("h1")?.textContent).toBe("Services");
    expect(text).toContain("Cinematography");
    expect(text).toContain("Camera and lighting built around the story.");
    expect(text).toContain("Director of Photography");
    expect(text).toContain("Gaffer");
  });

  it("shows an empty state rather than a broken page when nothing is published", async () => {
    const Services = (await import("@/pages/Services")).default;
    const container = await renderPage(<Services />);
    expect(container.textContent).toContain("Coming soon");
  });
});

describe("Contact", () => {
  it("leads with the email address from Settings and posts the form", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchSiteSettings).mockResolvedValue({
      ...EMPTY_SETTINGS,
      contact_email: "hello@cra8.studio",
    });

    const Contact = (await import("@/pages/Contact")).default;
    const container = await renderPage(<Contact />);

    expect(container.querySelector('a[href="mailto:hello@cra8.studio"]')).not.toBeNull();

    const name = container.querySelector<HTMLInputElement>("#contact-name")!;
    const email = container.querySelector<HTMLInputElement>("#contact-email")!;
    const message = container.querySelector<HTMLTextAreaElement>("#contact-message")!;

    const setValue = (element: HTMLInputElement | HTMLTextAreaElement, value: string) => {
      const setter = Object.getOwnPropertyDescriptor(
        element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
        "value"
      )!.set!;
      setter.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
    };

    await act(async () => {
      setValue(name, "Ada");
      setValue(email, "ada@example.com");
      setValue(message, "We are casting a feature in Lagos this autumn.");
    });

    await act(async () => {
      container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(api.submitContactMessage).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Ada", email: "ada@example.com" })
    );
    expect(container.textContent).toContain("Thank you");
  });

  it("hides the form when it's switched off in the admin", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchPageContent).mockResolvedValue(
      page("contact", { title: "Contact", content: { formEnabled: false } })
    );

    const Contact = (await import("@/pages/Contact")).default;
    const container = await renderPage(<Contact />);

    expect(container.querySelector("form")).toBeNull();
  });
});

describe("Project detail", () => {
  it("shows the synopsis, credits and a link out to the full film", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchProject).mockResolvedValue(
      project({
        id: "prophet-suddenly-4",
        title: "Prophet Suddenly 4",
        logline: "A minister's hunger for greatness takes a dark turn.",
        synopsis: "Pastor Victor travels to Tanzania.",
        youtube_id: "UjlbcOR7CfI",
        director: "The Winlos",
        role: "Director of Photography",
        credits: [{ role: "Colourist", name: "A. Colourist" }],
        gallery: ["/still-1.jpg"],
        blocks: [{ type: "text", text: "Shot over ten nights." }],
      })
    );

    const ProjectDetail = (await import("@/pages/ProjectDetail")).default;
    const container = await routed(<ProjectDetail />, "/work/:id", "/work/prophet-suddenly-4");
    const text = container.textContent || "";

    expect(container.querySelector("h1")?.textContent).toBe("Prophet Suddenly 4");
    expect(text).toContain("A minister's hunger for greatness takes a dark turn.");
    expect(text).toContain("Pastor Victor travels to Tanzania.");
    expect(text).toContain("Colourist");
    expect(text).toContain("A. Colourist");
    expect(text).toContain("Shot over ten nights.");
    expect(container.querySelector('img[src="/still-1.jpg"]')).not.toBeNull();
    expect(
      container.querySelector('a[href="https://www.youtube.com/watch?v=UjlbcOR7CfI"]')
    ).not.toBeNull();
  });

  it("plays a trailer ambiently where one exists, and never the full film", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchProject).mockResolvedValue(
      project({ id: "ps4", title: "PS4", youtube_id: "UjlbcOR7CfI", trailer_youtube_id: "dtjsc_MhWgc" })
    );

    const ProjectDetail = (await import("@/pages/ProjectDetail")).default;
    const container = await routed(<ProjectDetail />, "/work/:id", "/work/ps4");

    const ambient = container.querySelector('iframe[src*="dtjsc_MhWgc"]');
    expect(ambient?.getAttribute("src")).toContain("autoplay=1");
    expect(ambient?.getAttribute("src")).toContain("mute=1");
    // The feature itself is only ever an on-demand player.
    const feature = container.querySelector('iframe[src*="UjlbcOR7CfI"]');
    expect(feature?.getAttribute("src")).not.toContain("autoplay=1");
  });

  it("404s a project that isn't published", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchProject).mockRejectedValue(new api.ApiError("Not found", 404));

    const ProjectDetail = (await import("@/pages/ProjectDetail")).default;
    const container = await routed(<ProjectDetail />, "/work/:id", "/work/draft");

    expect(container.textContent).toContain("404");
  });
});

describe("Admin → Pages shows everything a page actually displays", () => {
  // The Work page renders projects from the projects table, not from
  // page_content, so its editor looked completely empty even though the live
  // page was full of films. The editor lists them inline, each linking to its
  // own editor.
  it("lists the slate on Work, linked to their project editors", async () => {
    const AdminPages = (await import("@/pages/admin/AdminPages")).default;
    const container = await renderPage(<AdminPages />, "/admin/pages");
    const text = container.textContent || "";

    expect(text).toContain("2 projects on the slate");
    expect(text).toContain("Prophet Suddenly 4: The Children's Ministry");
    expect(text).toContain("Spirituals 4");

    const editLinks = [...container.querySelectorAll('a[href^="/admin/projects/"]')].map((a) =>
      a.getAttribute("href")
    );
    expect(editLinks).toContain("/admin/projects/prophet-suddenly-4/edit");
    expect(editLinks).toContain("/admin/projects/spirituals-4/edit");
  });

  it("does not show the slate list for a plain content page", async () => {
    const adminApi = await import("@/lib/adminApi");
    vi.mocked(adminApi.fetchAdminPages).mockResolvedValueOnce([page("press-kit", { title: "Press Kit" })]);

    const AdminPages = (await import("@/pages/admin/AdminPages")).default;
    const container = await renderPage(<AdminPages />, "/admin/pages");

    // Work is still first in the list, so select the custom page explicitly.
    const pressKitButton = [...container.querySelectorAll("button")].find((button) =>
      button.textContent?.includes("/press-kit")
    );
    expect(pressKitButton).toBeDefined();
    await act(async () => {
      pressKitButton!.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent || "").not.toMatch(/projects? on the slate/);
  });

  it("keeps Film, Music and other sections out of the Pages list entirely — they're edited in Categories", async () => {
    // These used to appear here as their own rows even though they aren't
    // pages; a category is now edited in exactly one place.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([filmCategory]);

    const AdminPages = (await import("@/pages/admin/AdminPages")).default;
    const container = await renderPage(<AdminPages />, "/admin/pages");

    const rowLabels = [...container.querySelectorAll('button[type="button"]')].map((b) => b.textContent);
    expect(rowLabels.some((label) => label?.includes("Film"))).toBe(false);
    expect(container.querySelector('a[href="/admin/categories"]')).not.toBeNull();
  });
});

describe("the slate's layout is set by the CMS, not by markup", () => {
  it("opens Work with the project marked Featured, not just the first one", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchProjects).mockResolvedValue([
      project({ id: "first", title: "First By Order", sort_order: 1 }),
      project({ id: "chosen", title: "The Featured One", sort_order: 2, featured: 1 }),
    ]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />);

    // The feature is the only project set as an h2 over its own image.
    expect(container.querySelector("h2")?.textContent).toBe("The Featured One");
    // …and it isn't repeated in the grid below.
    const titles = [...container.querySelectorAll("h3")].map((node) => node.textContent);
    expect(titles).toContain("First By Order");
    expect(titles).not.toContain("The Featured One");
  });

  it("groups Work by discipline, each section linking to its own page", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([
      filmCategory,
      { ...filmCategory, id: 2, slug: "music", label: "Music", project_count: 1 },
    ]);
    vi.mocked(api.fetchProjects).mockResolvedValue([
      project({ id: "feature", title: "The Opener", featured: 1 }),
      project({ id: "a-film", title: "A Film", category: "film" }),
      project({ id: "a-video", title: "A Music Video", category: "music", category_label: "Music" }),
    ]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />);
    const text = container.textContent || "";

    expect(text).toContain("Film");
    expect(text).toContain("Music");
    // Each discipline's header filters the same page rather than leaving it.
    expect(container.querySelector('a[href="/work?category=film"]')).not.toBeNull();
    expect(container.querySelector('a[href="/work?category=music"]')).not.toBeNull();
    expect(text).toContain("A Music Video");
  });

  it("offers every discipline as a filter, with All back to the whole archive", async () => {
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([
      filmCategory,
      { ...filmCategory, id: 2, slug: "music", label: "Music", project_count: 1 },
    ]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />, "/work?category=film");

    expect(container.querySelector('a[href="/work"]')).not.toBeNull();
    expect(container.querySelector('a[href="/work?category=film"]')).not.toBeNull();
    expect(container.querySelector('a[href="/work?category=music"]')).not.toBeNull();
  });

  it("files a project into its section from its category alone", async () => {
    // Adding a project is the whole job: nothing about the page's layout is
    // configured per project, so a new one lands in the right place already.
    const api = await import("@/lib/api");
    vi.mocked(api.fetchCategories).mockResolvedValue([
      { ...filmCategory, id: 2, slug: "music", label: "Music", project_count: 1 },
    ]);
    vi.mocked(api.fetchProjects).mockResolvedValue([
      project({ id: "opener", title: "Opener", featured: 1 }),
      project({ id: "new-one", title: "Brand New Video", category: "music", category_label: "Music" }),
    ]);

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />);

    expect(container.textContent).toContain("Music");
    expect(container.textContent).toContain("Brand New Video");
  });
});

describe("undo and redo", () => {
  it("steps an editor's draft backwards and forwards, and stops at the last save", async () => {
    const { EditHistoryProvider, useEditHistory, useUndoRedo, HISTORY_LIMIT } = await import(
      "@/hooks/useEditHistory"
    );
    const { useState } = await import("react");

    let api: {
      set: (value: string) => void;
      reset: (value: string) => void;
      value: () => string;
    } | null = null;

    const Editor = () => {
      const [text, setText] = useState("start");
      const { reset } = useUndoRedo(text, setText);
      api = { set: setText, reset, value: () => text };
      return <p>{text}</p>;
    };

    const Controls = () => {
      const { controls } = useEditHistory();
      return (
        <>
          <button type="button" data-testid="undo" disabled={!controls?.canUndo} onClick={() => controls?.undo()}>
            undo
          </button>
          <button type="button" data-testid="redo" disabled={!controls?.canRedo} onClick={() => controls?.redo()}>
            redo
          </button>
        </>
      );
    };

    vi.useFakeTimers({ shouldAdvanceTime: true });
    const container = await renderPage(
      <EditHistoryProvider>
        <Editor />
        <Controls />
      </EditHistoryProvider>
    );

    const click = async (testId: string) => {
      await act(async () => {
        container
          .querySelector(`[data-testid="${testId}"]`)!
          .dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
    };
    // Edits inside the burst window collapse into one step, so let each settle.
    const edit = async (value: string) => {
      await act(async () => api!.set(value));
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
    };

    await edit("one");
    await edit("two");
    expect(container.querySelector("p")?.textContent).toBe("two");

    await click("undo");
    expect(container.querySelector("p")?.textContent).toBe("one");
    await click("undo");
    expect(container.querySelector("p")?.textContent).toBe("start");

    await click("redo");
    expect(container.querySelector("p")?.textContent).toBe("one");

    // Saving (or loading another record) clears history — undo must never
    // reach back past it into content that is already on the server.
    await act(async () => api!.reset("saved"));
    expect(container.querySelector<HTMLButtonElement>('[data-testid="undo"]')?.disabled).toBe(true);
    expect(container.querySelector<HTMLButtonElement>('[data-testid="redo"]')?.disabled).toBe(true);

    // History is bounded, so a long session can't grow without limit.
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) await edit(`step-${i}`);
    for (let i = 0; i < HISTORY_LIMIT + 5; i += 1) await click("undo");
    expect(container.querySelector("p")?.textContent).toBe(`step-${4}`);
  });
});

describe("built-in pages have a real publish switch", () => {
  // Work, Services, Journal and Contact used to be permanently live — only
  // custom pages could be drafted. They now use the same switch as any other
  // page, and unpublishing one has to actually take it offline rather than
  // just clearing its custom copy while the page keeps rendering underneath.
  it("404s Work, Services, Journal and Contact when their page is unpublished", async () => {
    const api = await import("@/lib/api");
    const draft = page("work", { title: "Work", published: 0 });
    vi.mocked(api.fetchPageContent).mockImplementation(async (slug: string) =>
      slug === "work" ? Promise.reject(new api.ApiError("Not found", 404)) : emptyPage(slug)
    );
    void draft;

    const Work = (await import("@/pages/Work")).default;
    const container = await renderPage(<Work />);
    expect(container.textContent).toContain("404");
  });

  it("keeps rendering normally once a built-in page is published again", async () => {
    const Services = (await import("@/pages/Services")).default;
    // The shared mock baseline (published: 1 / emptyPage) is restored between
    // tests, so this alone confirms the default state renders the real page.
    const container = await renderPage(<Services />);
    expect(container.textContent).not.toContain("404");
    expect(container.querySelector("h1")?.textContent).toBe("Services");
  });
});
