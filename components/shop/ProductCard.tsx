import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import AddToCartButton from "@/components/shop/AddToCartButton";
import { FALLBACK_LOGO, inr, type Product } from "@/lib/products";

export default function ProductCard({
  product,
  withButton = false,
  delay = 0,
}: {
  product: Product;
  withButton?: boolean;
  delay?: number;
}) {
  return (
    <Reveal variant="fade-up" delay={delay} className="product h-full">
      <Link
        href={`/product/${product.id}`}
        className="no-underline text-inherit flex-1 flex flex-col"
      >
        <div className="img">
          {product.img ? (
            <Image
              src={product.img}
              alt={product.name}
              fill
              sizes="(max-width:640px) 100vw, 280px"
              className="object-cover"
            />
          ) : (
            <Image
              src={FALLBACK_LOGO}
              alt="Vimtra Chennai Lions"
              width={240}
              height={240}
              className="w-3/5 h-3/5 object-contain opacity-85"
              style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.2))" }}
            />
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
