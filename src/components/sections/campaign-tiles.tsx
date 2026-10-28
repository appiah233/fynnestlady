import Image from "next/image";
import Link from "next/link";

export function CampaignTiles() {
  return (
    <section aria-label="Explore the collection" className="container-page home-campaigns">
      <article className="home-campaign home-campaign--product">
        <div className="home-campaign__copy">
          <p className="home-eyebrow">Body care</p>
          <h2>Make time for your skin.</h2>
          <Link href="/shop?category=Body%20Care" className="home-text-link">
            Shop body care <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
        <Image
          src="/images/products/product-6.jpeg"
          alt="Fynnestlady Fruity Pebbles exfoliating scrub"
          width={540}
          height={540}
          className="home-campaign__product-image"
          sizes="(max-width: 767px) 45vw, 24vw"
        />
      </article>
      <article className="home-campaign home-campaign--portrait">
        <Image
          src="/images/campaign-face.png"
          alt="Woman smiling with a hand resting near her cheek"
          fill
          sizes="(max-width: 767px) 100vw, 45vw"
          className="object-cover"
        />
        <div className="home-campaign__copy">
          <p className="home-eyebrow">Explore your routine</p>
          <h2>Care that feels like you.</h2>
          <Link href="/shop?view=concern" className="home-text-link">
            Shop by concern <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </article>
    </section>
  );
}
