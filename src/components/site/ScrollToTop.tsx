import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * A single-page app keeps the scroll position across navigations, so following
 * a link from halfway down /work would drop you halfway down the next page.
 * Reset on every path change — but never on a hash link, which is asking to
 * jump to a section.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
