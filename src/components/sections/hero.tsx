import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section aria-labelledby="home-hero-title" className="home-hero-wrap container-page">
      <div className="home-hero">
        <div className="home-hero__image">
          <Image
            src="/images/campaign-hero.png"
            alt="Woman smiling with her hands gently beside her face"
            fill
            priority
            sizes="(max-width: 767px) 100vw, 80vw"
            className="object-cover"
          />
        </div>
        <div className="home-hero__copy">
          <p className="home-eyebrow">Fynnestlady Skincare</p>
          <h1 id="home-hero-title" className="home-hero__title">
            Discover your <span>Fynnest glow.</span>
          </h1>
          <p className="home-hero__description">
            Your skin. Your needs. Thoughtful care for your daily routine.
          </p>
          <Link href="/shop" className="home-cta">
            Shop skincare <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
