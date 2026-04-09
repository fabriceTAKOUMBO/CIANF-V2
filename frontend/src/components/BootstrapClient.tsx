"use client";

import { useEffect } from "react";

export default function BootstrapClient() {
  useEffect(() => {
    // @ts-expect-error bootstrap is global or we import it here
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  return null;
}
