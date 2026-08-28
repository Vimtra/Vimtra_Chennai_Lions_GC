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
        <div className="img relative">
          {hasImage ? (
            <Image
              src={cover}
              alt={product.name}
              fill
              sizes="(max-width:640px) 100vw, 280px"
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
              className="absolute top-3 right-3 rounded-[999px] px-3 py-[6px] font-sora font-extrabold text-[10.5px] tracking-[0.16em] uppercase"
              style={{ background: "rgba(26,21,19,0.92)", color: "#fff" }}
            >
              Out of stock
            </div>
          )}
          {lowStock && (
            <div
              className="absolute top-3 right-3 rounded-[999px] px-3 py-[6px] font-sora font-extrabold text-[10.5px] tracking-[0.16em] uppercase"
              style={{ background: "#C4202A", color: "#fff" }}
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
        <div className="p-[14px_20px_20px]">
          <AddToCartButton product={product} className="w-full" />
        </div>
      )}
    </Reveal>
  );
}
