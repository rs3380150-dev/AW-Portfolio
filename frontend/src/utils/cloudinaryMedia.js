import manifest from "@/data/cloudinary-media.json";

const transformations = [
  [/^\/assets\/images\/events\//, "f_auto,q_auto,c_fill,w_1200,h_800"],
  [/^\/assets\/images\/gallery\//, "f_auto,q_auto,c_limit,w_1400"],
  [/^\/assets\/images\/music-covers\//, "f_auto,q_auto,c_fill,w_800,h_800"],
  [/\/images\/site\/hero-poster\./, "f_auto,q_auto,c_fill,w_1920,h_1080"],
  [/\/images\/site\/social-share-og\./, "f_jpg,q_auto,c_fill,w_1200,h_630"],
  [/\/images\/site\/about-portrait\./, "f_auto,q_auto,c_limit,w_1200"],
  [/^\/assets\/images\/testimonials\//, "f_auto,q_auto,c_fill,g_face,w_160,h_160"],
  [/^\/assets\/images\/video-thumbnails\//, "f_auto,q_auto,c_fill,w_960,h_540"],
];

const encodePublicId = (publicId) =>
  publicId.split("/").map(encodeURIComponent).join("/");

export const cloudinaryMedia = (localPath) => {
  const asset = manifest.assets[localPath];
  if (!asset) return localPath;

  const transformation =
    asset.resourceType === "video"
      ? "q_auto:good"
      : transformations.find(([pattern]) => pattern.test(localPath))?.[1] ||
        "f_auto,q_auto";
  const publicId = encodePublicId(asset.publicId);

  return `https://res.cloudinary.com/${encodeURIComponent(manifest.cloudName)}/${asset.resourceType}/upload/${transformation}/v${asset.version}/${publicId}.${asset.format}`;
};

