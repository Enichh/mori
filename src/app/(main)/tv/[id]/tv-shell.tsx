"use client";
import { useState, useEffect } from "react";
import { TVDetailClient } from "./tv-detail-client";

export function TVShell() {
  const [id, setId] = useState("0");
  useEffect(() => {
    const pathId =
      window.location.pathname.split("/").filter(Boolean).pop() || "0";
    setId(pathId);
  }, []);
  return <TVDetailClient showId={parseInt(id) || 0} />;
}
