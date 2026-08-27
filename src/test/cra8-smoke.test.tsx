import { describe, it, expect, vi, afterEach } from "vitest";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import type { AboutContent } from "@/lib/api";
import { BRAND } from "@/lib/brand";

const projects = [
  {
    id: "prophet-suddenly-4",
    title: "Prophet Suddenly 4: The Children's Ministry",
    category: "film",
    category_label: "Film",
    year: "2026",
    role: "Director of Photography, VFX Artist, Gaffer",
    description: "d",
    synopsis: "s",
    thumbnail: "https://img.youtube.com/vi/UjlbcOR7CfI/maxresdefault.jpg",
    youtube_id: "UjlbcOR7CfI",
    director: "",
    producers: "The Winlos",
    cast_info: "",
    status: "Now Streaming",
    sort_order: 10,
    created_at: "",
    updated_at: "",
  },
  {
    id: "spirituals-4",
    title: "Spirituals 4",
    category: "film",
    category_label: "Film",
    year: "2026",
    role: "DOP, Gaffer, VFX Artist",
    description: "d",
    synopsis: "s",
    thumbnail: "https://img.youtube.com/vi/y41jI31M-3Y/maxresdefault.jpg",
    youtube_id: "y41jI31M-3Y",
    director: "",
    producers: "The Winlos Studio",
    cast_info: "",
    status: "Now Streaming",
    sort_order: 9,
    created_at: "",
    updated_at: "",
  },
];

// A freshly seeded/migrated database: every CMS field genuinely empty. This is
// what should drive the CRA8 fallback defaults — never string-matching content.
const EMPTY_HERO = { brand_text: "", tagline: "", video_url: "", hero_image: "", hero_link: "" };
const EMPTY_SETTINGS = { contact_email: "", copyright_text: "", site_title: "" };
const EMPTY_ABOUT = { page_slug: "about", title: "", content: {} };

vi.mock("@/lib/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api")>();
  return {
    ...actual,
    fetchProjects: vi.fn(async () => projects),
    fetchLatestProjects: vi.fn(async () => projects),
    fetchHeroContent: vi.fn(async () => EMPTY_HERO),
    fetchAboutContent: vi.fn(async () => EMPTY_ABOUT),
    fetchSiteSettings: vi.fn(async () => EMPTY_SETTINGS),
    fetchMenuItems: vi.fn(async () => []),
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

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

async function renderPage(ui: ReactNode) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  await act(async () => {
    createRoot(container).render(
      <QueryClientProvider client={client}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    );
  });
  // Let the mocked queries resolve and re-render.
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return container;
}

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
    // no studio statement, no founder credit, no footer. Those live on their
    // own pages (Work, About) instead of repeating on the homepage.
    expect(text).not.toContain("Prophet Suddenly 4");
    expect(text).not.toContain("Spirituals 4");
    expect(text).not.toContain("Faith.");
    expect(text).not.toContain("Founded by");
    expect(text).not.toContain("©");
    expect(html).not.toContain('href="/work/prophet-suddenly-4"');

    // The page is exactly one viewport tall (h-[100svh]) and clips overflow,
    // so it never scrolls regardless of content.
    expect(container.firstElementChild?.className).toContain("h-[100svh]");
    expect(container.firstElementChild?.className).toContain("overflow-hidden");

    // The circle still links out — to Work by default, since there's no
    // "featured project" context on a hero-only homepage any more.
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
    // The navbar shows its own CRA8 logo throughout — scope selectors to the
    // hero circle's copy (aria-hidden, decorative) so the two don't collide.
    const heroLogo = () => container.querySelector('img[src="/CRA8.png"][aria-hidden]');

    // The clip is mounted but held back until the circle has settled.
    const clip = container.querySelector("video");
    expect(clip?.getAttribute("src")).toBe("/trillar-video.mp4");
    expect(clip?.muted).toBe(true);
    expect(clip?.style.opacity).toBe("0");
    expect(heroLogo()).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.querySelector("video")?.style.opacity).toBe("1");

    // The logo takes the circle when the clip runs out.
    await act(async () => {
      container.querySelector("video")?.dispatchEvent(new Event("ended"));
    });
    const logo = heroLogo();
    expect(logo).not.toBeNull();
    expect(logo?.className).toContain("object-contain");
  });

  it("about falls back to the CRA8 studio copy and credits DWINDIK as founder on a fresh database", async () => {
    const About = (await import("@/pages/About")).default;
    const container = await renderPage(<About />);
    const text = container.textContent || "";
    const html = container.innerHTML;

    expect(text).toContain("A film studio working in spiritual drama and thriller.");
    // The founder credit is deliberate, real content — not a legacy artifact
    // the "trust the CMS" fix would otherwise strip out.
    expect(text).toContain("DWINDIK");
    expect(text).toContain("Founder");
    expect(text).toContain("The Winlos Media Ministry");
    // Imagery defaults to real photos of DWINDIK, not the slate's movie-poster
    // thumbnails — those already live on /work and shouldn't repeat here.
    expect(html).toContain("/dwindik/4.jpeg");
    expect(html).toContain("/dwindik/5.jpeg");
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
    // value that contained the word "dwindik" or "cre8te" anywhere in it. The
    // site must never second-guess what was actually saved; it renders the CMS
    // value verbatim and only falls back to a CRA8 default when a field is empty.
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
      page_slug: "about",
      title: "CRA8",
      // Admin can save partial About content — every field renders independently
      // with its own CRA8 fallback, so a partial object here is realistic, not a gap.
      content: {
        title: "CRA8",
        bioIntro: "Formerly known as the Dwindik portfolio, now the CRA8 studio site.",
      } as AboutContent,
    });

    const About = (await import("@/pages/About")).default;
    const container = await renderPage(<About />);

    expect(container.textContent).toContain("Formerly known as the Dwindik portfolio");
  });
});
