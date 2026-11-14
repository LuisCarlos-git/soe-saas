import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { PageLoading } from "@soe/ui";

export function PageNavigation() {
  const pending = useRouterState({ select: (state) => state.isLoading });
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return;
    }
    const timer = window.setTimeout(() => setVisible(true), 150);
    return () => window.clearTimeout(timer);
  }, [pending]);
  return <PageLoading visible={pending && visible} />;
}
