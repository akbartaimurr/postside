import { bricolage, inter } from "./fonts";
import "./globals.css";

export const metadata = {
  title: "Postside",
  description: "Go viral in America, from anywhere.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${bricolage.variable} h-full antialiased`}>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla's cz-shortcut-listen) add
          attributes to <body> before React loads. Only affects this element's own attributes. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
