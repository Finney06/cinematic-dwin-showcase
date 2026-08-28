import { Navigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { LoadingState } from "@/components/site/states";
import GenericPage from "@/pages/GenericPage";
import NotFound from "@/pages/NotFound";
import { useCategories, useMenuItems, usePages } from "@/hooks/useContent";

const normalise = (path: string) => path.replace(/^\/+|\/+$/g, "");

/**
 * The one dynamic route behind every URL the app doesn't hand-build: /film,
 * /news, /press-kit, and anything Dwindik creates next. It resolves the slug
 * against live CMS data, in priority order:
 *
 *   1. a discipline  → redirect to Work, filtered to it
 *   2. a published page → the block-built page
 *   3. a menu item pointing here but with no content row yet → an empty page
 *   4. nothing → 404
 *
 * Disciplines no longer have pages of their own: Work is the only place the
 * slate lives, and Film is a filter on it. These redirects are what keep old
 * bookmarks, existing menu items and anything already linked from elsewhere
 * working — permanently, without a second page to maintain.
 *
 * Unpublished content is deliberately indistinguishable from content that
 * never existed, so taking a page offline hides it completely.
 */
const SlugPage = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: pages, isLoading: pagesLoading } = usePages();
  const { data: menuItems, isLoading: menuLoading } = useMenuItems();

  const category = categories?.find((item) => item.slug === slug);
  const page = pages?.find((item) => item.page_slug === slug && item.published);
  const menuItem = menuItems?.find((item) => normalise(item.path) === slug && item.visible);

  if (categoriesLoading || pagesLoading || menuLoading) {
    return (
      <PageTransition>
        <Navbar />
        <main className="bg-background min-h-screen flex items-center justify-center">
          <LoadingState />
        </main>
      </PageTransition>
    );
  }

  if (category) return <Navigate to={`/work?category=${category.slug}`} replace />;
  if (page) return <GenericPage slug={slug} fallbackTitle={page.title || menuItem?.label || ""} />;
  if (menuItem) return <GenericPage slug={slug} fallbackTitle={menuItem.label} />;

  return <NotFound />;
};

export default SlugPage;
