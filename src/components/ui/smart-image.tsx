import Image from 'next/image';

/** SVG 不经 next/image 优化（本地可信素材），其余走 next/image。 */
export function SmartImage({
  src,
  alt,
  width,
  height,
  className,
  priority,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}) {
  if (src.endsWith('.svg')) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} loading={priority ? 'eager' : 'lazy'} />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 750}
      className={className}
      priority={priority}
    />
  );
}
