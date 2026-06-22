import { jsx } from "react/jsx-runtime";
const url = "/__l5e/assets-v1/cdae62f9-f6c0-42a5-a33e-0dd340049b72/piplog-icon-master.png";
const logoAsset = {
  url
};
function PipLogLogo({ size = 120, className = "" }) {
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: logoAsset.url,
      alt: "PipLog Trading Journal",
      width: size,
      height: size,
      className: `inline-block select-none ${className}`,
      style: { width: size, height: size },
      draggable: false
    }
  );
}
export {
  PipLogLogo as P
};
