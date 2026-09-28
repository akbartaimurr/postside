import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

// Simple shared layout for the legal pages: site navbar, a readable single column of text,
// site footer. `sections` = [{ heading, paragraphs: [string] }].
export default function LegalPage({ title, updated, intro, sections }) {
  return (
    <div className="flex flex-1 flex-col bg-white">
      <SiteHeader />

      <main className="flex-1 px-6 pt-20 pb-28">
        <article className="mx-auto max-w-[44rem]">
          <h1 className="font-sans text-4xl font-[450] leading-[1.05] tracking-[-0.035em] sm:text-5xl">{title}</h1>
          <p className="mt-4 text-base text-muted">Last updated {updated}</p>
          <p className="mt-8 text-lg leading-relaxed text-[#3f3f3f]">{intro}</p>

          {sections.map(({ heading, paragraphs }) => (
            <section key={heading} className="mt-10">
              <h2 className="text-2xl font-medium tracking-tight">{heading}</h2>
              {paragraphs.map((text) => (
                <p key={text} className="mt-3 text-lg leading-relaxed text-[#3f3f3f]">
                  {text}
                </p>
              ))}
            </section>
          ))}
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
