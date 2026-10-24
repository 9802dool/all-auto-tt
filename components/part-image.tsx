import Image from "next/image";

export function PartImage({
  src,
  alt,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  if (!src) return null;
  if (src.endsWith(".svg")) {
    return <img src={src} alt={alt} className="h-full w-full object-cover" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
    />
  );
}
