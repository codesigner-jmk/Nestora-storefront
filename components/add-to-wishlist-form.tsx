"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addToWishlist } from "@/app/actions/customer";
import { HeartIcon } from "@/components/icons";

type WishlistActionState = { status: "idle" | "success" | "error"; message: string };
const initialState: WishlistActionState = { status: "idle", message: "" };

export function AddToWishlistForm({
  productId,
  returnTo,
  productName,
  variant = "icon",
}: {
  productId: string;
  returnTo: string;
  productName: string;
  variant?: "icon" | "text";
}) {
  const [state, formAction, pending] = useActionState(addToWishlist, initialState);
  const [dismissedState, setDismissedState] = useState<WishlistActionState | null>(null);

  useEffect(() => {
    if (state.status === "idle") return;
    const timeout = window.setTimeout(() => setDismissedState(state), 3200);
    return () => window.clearTimeout(timeout);
  }, [state]);
  const toastVisible = state.status !== "idle" && state !== dismissedState;

  return (
    <>
      <form className={variant === "icon" ? "wishlist-form" : "add-to-wishlist-form"} action={formAction}>
        <input type="hidden" name="productId" value={productId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          className={variant === "icon" ? "wishlist-control" : "text-link"}
          type="submit"
          aria-label={variant === "icon" ? `Add ${productName} to wishlist` : undefined}
          aria-busy={pending}
          disabled={pending}
        >
          {variant === "icon" ? <HeartIcon /> : <>Save to wishlist <span aria-hidden="true">♡</span></>}
        </button>
      </form>
      {toastVisible && typeof document !== "undefined" && createPortal(
        <div className={`wishlist-toast${state.status === "error" ? " wishlist-toast-error" : ""}`} role={state.status === "error" ? "alert" : "status"}>
          <span aria-hidden="true">{state.status === "success" ? "♡" : "!"}</span>
          {state.message}
        </div>,
        document.body,
      )}
    </>
  );
}
