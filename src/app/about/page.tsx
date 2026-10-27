import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-0">
      <section className="surface-panel border border-hairline py-20 sm:py-24 lg:py-32">
        <div className="container-page">
          <div className="text-center max-w-[46rem] mx-auto space-y-6">
            <p className="text-utility font-bold uppercase tracking-[0.16em] text-primary">
              About Fynnestlady
            </p>
            <h1 className="font-display text-display">Your Skin. Your Needs. Your Fynnest Glow.</h1>
            <p className="text-body text-ink-muted leading-relaxed">
              12 Years of Experience. A Personal Approach to Your Skin.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-page">
          <h2 className="font-display text-heading mb-10">12 Years of Experience</h2>
          <div className="max-w-[48rem] space-y-6">
            <p className="text-body text-ink-muted leading-relaxed">
              At Fynnestlady Skincare, we believe that beautiful skin begins
              with understanding your skin. With 12 years of experience in the
              skincare industry, we specialise in acne-focused skincare,
              complexion improvement, and personalised skincare solutions
              designed around individual skin concerns and goals.
            </p>
            <p className="text-body text-ink-muted leading-relaxed">
              We understand how frustrating it can be to struggle with
              recurring breakouts, stubborn blemishes, uneven skin tone, dark
              spots, and a complexion that doesn&rsquo;t reflect how confident
              you want to feel. Finding the right skincare products can be
              overwhelming, especially when every product promises results.
              That&rsquo;s where Fynnestlady comes in.
            </p>
          </div>
        </div>
      </section>
      <section className="surface-muted py-12 sm:py-16 lg:py-20">
        <div className="container-page">
          <h2 className="font-display text-heading mb-10">Every Skin Is Different</h2>
          <p className="text-body text-ink-muted leading-relaxed max-w-[46rem]">
            Our approach is built on the understanding that every skin is
            different. What works for one person may not be suitable for
            another. That&rsquo;s why we believe skincare should go beyond
            simply buying products. It should begin with understanding your
            skin, identifying your concerns, and exploring products that align
            with your individual needs.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-page">
          <h2 className="font-display text-heading mb-10">What Makes Fynnestlady Different?</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Experience That Matters",
                body: "With 12 years in skincare, we bring experience and a focused approach to helping customers navigate their skincare concerns.",
              },
              {
                title: "Skincare With a Purpose",
                body: "We specialise in acne care and complexion improvement, offering products for specific skincare concerns and everyday skin maintenance.",
              },
              {
                title: "A Personal Approach",
                body: "We recognise that your skin is unique. We encourage you to share your concerns so we can help you explore suitable products for your needs.",
              },
              {
                title: "Your Confidence Matters",
                body: "We want you to feel informed, supported, and confident in the skincare choices you make.",
              },
            ].map((principle) => (
              <article key={principle.title} className="space-y-4">
                <h3 className="font-display text-subheading">{principle.title}</h3>
                <p className="text-body text-ink-muted leading-relaxed">{principle.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-muted py-12 sm:py-16 lg:py-20">
        <div className="container-page">
          <h2 className="font-display text-heading mb-10">No Unrealistic Overnight Promises</h2>
          <div className="max-w-[46rem] space-y-4">
            <p className="text-body text-ink-muted leading-relaxed">
              At Fynnestlady, we believe skincare is more than a beauty
              routine. It&rsquo;s a personal journey towards caring for your
              skin and feeling comfortable in it.
            </p>
            <p className="text-body text-ink-muted leading-relaxed">
              We don&rsquo;t believe in unrealistic overnight promises or
              one-size-fits-all solutions. We believe in thoughtful product
              choices, consistent skincare, and helping you understand what
              your skin needs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container-page">
          <h2 className="font-display text-heading mb-10">Your Skincare Journey Starts Here</h2>
          <div className="max-w-[46rem] space-y-6">
            <p className="text-body text-ink-muted leading-relaxed">
              Whether you&rsquo;re looking for acne-focused skincare, hoping to
              improve the appearance of uneven complexion, or searching for
              products to complement your everyday routine, Fynnestlady is here
              to help you explore your options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 min-w-[14rem] bg-primary text-primary-foreground rounded-sm px-6 py-4 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-hover focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Shop Skincare <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/shop?view=concern"
                className="inline-flex items-center justify-center gap-2 min-w-[14rem] border border-primary text-primary rounded-sm px-6 py-4 font-bold text-utility uppercase tracking-wider transition-colors hover:bg-primary-soft focus-visible:outline-primary focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Find My Skincare <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="surface-panel border border-hairline py-20 sm:py-24 lg:py-32">
        <div className="container-page">
          <div className="text-center max-w-[46rem] mx-auto space-y-6">
            <h2 className="font-display text-display">Be the Fynnest. Feel the Fynnest Effect.</h2>
            <p className="text-body text-ink-muted leading-relaxed">
              Because you deserve skincare that puts your needs first.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
