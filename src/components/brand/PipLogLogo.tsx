import logoAsset from "@/assets/piplog-icon-master.png.asset.json";

interface PipLogLogoProps {
  size?: number;
  className?: string;
}

/**
 * PipLog brand logo — uses the master icon asset exactly as provided.
 */
export function PipLogLogo({ size = 120, className = "" }: PipLogLogoProps) {
  return (
    <img
      src={logoAsset.url}
      alt="PipLog Trading Journal"
      width={size}
      height={size}
      className={`inline-block select-none ${className}`}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
