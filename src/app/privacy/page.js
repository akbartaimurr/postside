import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Privacy Policy | Postside",
  description: "How Postside collects, uses and protects your information.",
};

// TODO(legal): have this reviewed before launch. It's a plain starting point, not legal advice.
const SECTIONS = [
  {
    heading: "What we collect",
    paragraphs: [
      "When you join the waitlist, we collect your email address.",
      "When you use Postside, we also collect your account details, the social accounts you connect to your cloud phone, and basic usage data such as when you log in and which features you use. Payments are handled by our payment provider, and we never see or store your full card details.",
    ],
  },
  {
    heading: "How we use it",
    paragraphs: [
      "We use your information to run Postside, keep your cloud phone and accounts working, contact you about your account or the waitlist, and improve the service.",
      "We only send marketing emails if you have agreed to receive them, and you can unsubscribe at any time.",
    ],
  },
  {
    heading: "Who we share it with",
    paragraphs: [
      "We share information only with the service providers we need to run Postside, such as hosting, email and payment providers, and only for that purpose. We may also share it if the law requires us to.",
      "We do not sell your personal information.",
    ],
  },
  {
    heading: "Your social accounts",
    paragraphs: [
      "Anything you do on TikTok, Instagram, YouTube or other apps from your cloud phone is also covered by those platforms' own privacy policies.",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "We keep your information while you use Postside or are on the waitlist, and delete it when it is no longer needed, unless we have to keep it for legal reasons.",
    ],
  },
  {
    heading: "Your choices",
    paragraphs: [
      "You can ask us to show you, correct or delete the information we hold about you, or take you off the waitlist, by emailing akbartaimurr@gmail.com.",
    ],
  },
  {
    heading: "Children",
    paragraphs: ["Postside is not meant for anyone under 18, and we do not knowingly collect their information."],
  },
  {
    heading: "Changes",
    paragraphs: [
      "If we change this policy, we will update the date at the top of this page, and let you know by email if the change is significant.",
    ],
  },
  {
    heading: "Contact",
    paragraphs: ["Questions about your privacy? Email us at akbartaimurr@gmail.com."],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 28, 2026"
      intro="This policy explains what information Postside collects, how we use it, and the choices you have."
      sections={SECTIONS}
    />
  );
}
