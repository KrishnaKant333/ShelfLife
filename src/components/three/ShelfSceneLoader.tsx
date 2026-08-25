"use client";

import dynamic from "next/dynamic";

const ShelfScene = dynamic(
  () => import("./ShelfScene"),
  {
    ssr: false,
  }
);

export default function ShelfSceneLoader() {
  return <ShelfScene />;
}