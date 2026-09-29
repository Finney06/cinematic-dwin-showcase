import { useCallback, useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { AdminHeader } from "@/components/admin/FormFields";
// The handover guide has one source: the same file that exports the PDF.
import guideHtml from "../../../docs/handover/User-Guide.html?raw";
import guidePdfUrl from "../../../docs/handover/User-Guide.pdf?url";

// The file points at the logo relative to itself for PDF export; in the admin
// it is served from the site root.
const guideDoc = guideHtml.replace(/\.\.\/\.\.\/public\//g, "/");

/**
 * The client's user guide, always to hand inside the admin. It renders in an
 * iframe so the guide's own print-ready styles don't mix with the admin's.
 */
const AdminGuide = () => {
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Grow the frame to its content so the page scrolls, not a box inside it.
  const fitHeight = useCallback(() => {
    const doc = frameRef.current?.contentDocument;
    if (frameRef.current && doc?.body) {
      frameRef.current.style.height = `${doc.documentElement.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    window.addEventListener("resize", fitHeight);
    return () => window.removeEventListener("resize", fitHeight);
  }, [fitHeight]);

  return (
    <div>
      <AdminHeader
        title="User Guide"
        description="How to update the website, step by step. Come back here any time."
      >
        <a
          href={guidePdfUrl}
          download="CRA8-Website-User-Guide.pdf"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] text-xs tracking-wide text-white/70 hover:bg-white/[0.1] hover:text-white/90 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          Download PDF
        </a>
      </AdminHeader>
      <iframe
        ref={frameRef}
        title="CRA8 website user guide"
        srcDoc={guideDoc}
        onLoad={() => {
          fitHeight();
          // Web fonts can land after load and change the height.
          frameRef.current?.contentDocument?.fonts?.ready.then(fitHeight);
        }}
        className="w-full min-h-[70vh] rounded-xl bg-white border-0"
      />
    </div>
  );
};

export default AdminGuide;
