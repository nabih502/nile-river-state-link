import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/cairo/400.css";
import "@fontsource/cairo/500.css";
import "@fontsource/cairo/600.css";
import "@fontsource/cairo/700.css";
import "@fontsource/cairo/800.css";
import "@fontsource/cairo/900.css";
import "./globals.css";
import NileSite from "./site";

function getPathPage(): string {
  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  return path || "home";
}

function App() {
  const [page, setPage] = useState(getPathPage);

  useEffect(() => {
    const onPop = () => setPage(getPathPage());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank") return;
      if (href.startsWith("#")) return;
      event.preventDefault();
      const target = href.replace(/^\/+|\/+$/g, "") || "home";
      const url = href.startsWith("/") ? href : "/" + href;
      window.history.pushState({}, "", url);
      setPage(target);
      window.scrollTo(0, 0);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return <NileSite page={page} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
