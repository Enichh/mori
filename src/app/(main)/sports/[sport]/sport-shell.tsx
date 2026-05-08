"use client";
import { useState, useEffect } from "react";
import { SportDetailClient } from "./sport-detail-client";

export function SportShell() {
  const [sport, setSport] = useState("");
  useEffect(() => {
    const s = window.location.pathname.split("/").filter(Boolean).pop() || "";
    setSport(s);
  }, []);
  return <SportDetailClient sport={sport} />;
}
