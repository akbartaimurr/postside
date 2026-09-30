import Image from "next/image";
import ArrowIcon from "@/components/ArrowIcon";

// Links point at the home page's sections ("/#…") so they also work from other pages
const navLinks = [
  { label: "How it works", href: "/#how-it-works" }, // rent a US cloud phone monthly, post from anywhere
];

// Site navbar, shared by every page. Its side padding lines the logo and button up with the
// page's content columns (2.5rem / 4rem / 13rem, +2px left over from the old framed layout).
export default function SiteHeader() {
  return (
    <header className="flex h-16 items-center justify-between bg-white px-[calc(2.5rem+2px)] sm:px-[calc(4rem+2px)] lg:px-[calc(13rem+2px)]">
      <div className="flex items-center gap-6">
        <a href="/" className="flex items-center gap-1 font-display text-[1.375rem] font-semibold">
          <Image src="/logo.png" alt="" width={736} height={646} priority className="h-4 w-auto" />
          Postside
        </a>

        <nav className="hidden items-center gap-6 text-[1.01875rem] font-medium text-muted md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-[#454545]">
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="text-base font-medium">
        <a
          href="/#waitlist"
          className="flex h-9 items-center gap-1.5 squircle bg-foreground px-4 font-semibold text-surface hover:bg-neutral-700"
        >
          Join the waitlist
          <ArrowIcon />
        </a>
      </div>
    </header>
  );
}
