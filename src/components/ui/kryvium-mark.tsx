import Image from "next/image";

export function KryviumMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-64.png"
      alt="Kryvium"
      width={size}
      height={size}
      className={`kryvium-mark select-none ${className}`}
      priority
    />
  );
}
