import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Terms of Service | Postside",
  description: "The terms for using Postside.",
};

// TODO(legal): have this reviewed before launch. It's a plain starting point, not legal advice.
const SECTIONS = [
  {
    heading: "Using Postside",
    paragraphs: [
      "Postside gives you access to a cloud phone with a US connection that you can use to run and post to your social media accounts. By using Postside, you agree to these terms.",
      "You must be at least 18 to use Postside.",
    ],
  },
  {
    heading: "Your accounts and content",
    paragraphs: [
      "You are responsible for the social accounts you log in to on your cloud phone and everything posted from them.",
      "You must follow the rules of every platform you use, including TikTok, Instagram and YouTube. Those platforms can limit, restrict or remove accounts at their own discretion.",
    ],
  },
  {
    heading: "What you can't do",
    paragraphs: [
      "Don't use Postside for anything illegal, for spam, scams or fraud, to harass anyone, or to post content you don't have the rights to. Don't try to break, overload or get around the security of the service.",
      "We may suspend or close your access if you break these rules.",
    ],
  },
  {
    heading: "Results",
    paragraphs: [
      "We work to give your accounts the best chance of reaching a US audience, but we can't guarantee views, followers or any other results, or that a platform will never limit your reach. How platforms treat your content is up to them.",
    ],
  },
  {
    heading: "Waitlist and early access",
    paragraphs: [
      "Joining the waitlist doesn't guarantee access or a launch date. Early access features may change or be removed.",
    ],
  },
  {
    heading: "Plans and payments",
    paragraphs: [
      "Paid plans renew automatically until you cancel. Prices and what each plan includes will be shown before you pay. You can cancel at any time, and your plan will stay active until the end of the period you have paid for.",
    ],
  },
  {
    heading: "Availability",
    paragraphs: [
      "We aim to keep Postside running smoothly, but it may sometimes be unavailable for maintenance or reasons outside our control.",
    ],
  },
  {
    heading: "Liability",
    paragraphs: [
      "Postside is provided as is. To the extent the law allows, we aren't responsible for losses caused by your use of the service, by third party platforms, or by actions those platforms take on your accounts.",
    ],
  },
  {
    heading: "Changes",
    paragraphs: [
      "We may update these terms from time to time. If we do, we will change the date at the top of this page, and let you know by email if the change is significant.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about these terms? Email us at akbartaimurr@gmail.com."],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="September 28, 2026"
      intro="These terms explain the rules for using Postside. Please read them before you use the service."
      sections={SECTIONS}
    />
  );
}
