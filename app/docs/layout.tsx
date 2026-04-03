import { DocsSidebar } from "@/components/DocsSidebar";
import { Footer } from "@/components/Footer";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mx-auto flex max-w-7xl">
        <DocsSidebar />
        <div className="min-w-0 flex-1 px-6 py-12 lg:px-16">
          <div className="mx-auto max-w-3xl">{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
}
