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
import AdminApp from "./admin";
import MemberPortal from "./portal";

function parseRoute(): { page: string; slug?: string } {
  const raw = window.location.pathname.replace(/^\/+|\/+$/g, "") || "home";
  const parts = raw.split("/");
  if (parts.length >= 2 && ["news", "events"].includes(parts[0])) {
    return { page: `${parts[0]}-detail`, slug: parts[1] };
  }
  return { page: parts[0] };
}

function navigate(href: string, setter: (r: { page: string; slug?: string }) => void) {
  const url = href.startsWith("/") ? href : "/" + href;
  window.history.pushState({}, "", url);
  setter(parseRoute());
  window.scrollTo(0, 0);
}

function App() {
  const [route, setRoute] = useState(parseRoute);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
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
      navigate(href, setRoute);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (route.page === "admin") return <AdminApp />;
  if (route.page === "portal") return <MemberPortal />;
  return <NileSite page={route.page} slug={route.slug} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
