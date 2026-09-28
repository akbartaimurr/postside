import EarlyAccessForm from "@/components/EarlyAccessForm";

// Closing call to action: heading + the same email form as the hero
export default function WaitlistCTA() {
  return (
    <section className="flex flex-col items-center px-6 pt-8 pb-28 text-center">
      <h2 className="font-display text-4xl font-[450] leading-[1.05] tracking-[-0.035em] sm:text-6xl">
        Join the waitlist
      </h2>
      <div className="mt-6 text-base font-medium">
        <EarlyAccessForm />
      </div>
    </section>
  );
}
