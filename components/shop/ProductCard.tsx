import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { FALLBACK_LOGO, inr, productImage, type Product } from "@/lib/products";

export default function ProductCard({
  product,
  withButton = false,
  delay = 0,
}: {
  product: Product;
  withButton?: boolean;
  delay?: number;
}) {
  const cover = productImage(product);
  const hasImage = cover !== FALLBACK_LOGO;
  const outOfStock = !product.active || product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  return (
    <Reveal variant="fade-up" delay={delay} className="product h-full">
      <Link
        href={`/product/${product.id}`}
        className="no-underline text-inherit flex-1 flex flex-col"
      >
        <div className={`img relative ${hasImage ? "has-photo" : ""}`}>
          {hasImage ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 22vw"
              className={`object-cover ${outOfStock ? "opacity-60 saturate-50" : ""}`}
            />
          ) : (
            <Image
              src={FALLBACK_LOGO}
              alt="Vimtra Chennai Lions"
              width={240}
              height={240}
              className={`w-3/5 h-3/5 object-contain ${outOfStock ? "opacity-40" : "opacity-85"}`}
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}
            />
          )}
          {/* Stock badge overlay — top-right on the image */}
          {outOfStock && (
            <div
              className="absolute top-2 right-2 rounded-[999px] px-2.5 py-[5px] font-sora font-extrabold text-[9.5px] tracking-[0.12em] uppercase"
              style={{ background: "rgba(14,11,10,0.92)", color: "var(--hp-ivory)" }}
            >
              Out of stock
            </div>
          )}
          {lowStock && (
            <div
              className="absolute top-2 right-2 rounded-[999px] px-2.5 py-[5px] font-sora font-extrabold text-[9.5px] tracking-[0.12em] uppercase"
              style={{ background: "var(--hp-red)", color: "var(--hp-ivory)" }}
            >
              Only {product.stock} left
            </div>
          )}
        </div>
        <div className="body">
          <div className="cat">{product.cat}</div>
          <h3>{product.name}</h3>
          <div className="price">{inr(product.price)}</div>
        </div>
      </Link>
      {withButton && (
        <div className="p-[12px_16px_16px]">
          <AddToCartButton product={product} className="w-full" />
        </div>
      )}
    </Reveal>
  );
}
