"use client";
import { useEffect } from "react";

export default function AutoRefresh({ interval = 5000 }) {
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) window.dispatchEvent(new Event("refresh-data"));
    }, interval);
    return () => clearInterval(id);
  }, [interval]);
  return null;
}
