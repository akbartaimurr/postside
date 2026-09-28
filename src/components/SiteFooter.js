import Image from "next/image";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

// Site footer, shared by every page. Side padding matches the navbar so everything lines up.
export default function SiteFooter() {
  return (
    <footer className="px-[calc(2.5rem+2px)] py-10 text-left sm:px-[calc(4rem+2px)] lg:px-[calc(13rem+2px)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <a href="/" className="flex items-center gap-1 font-display text-[1.375rem] font-semibold">
          <Image src="/logo.png" alt="" width={736} height={646} className="h-4 w-auto" />
          Postside
        </a>

        <nav className="flex gap-6 text-base font-medium text-muted">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#454545]">
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <p className="mt-8 text-[0.9375rem] text-muted">© {new Date().getFullYear()} Postside. All rights reserved.</p>
    </footer>
  );
}
