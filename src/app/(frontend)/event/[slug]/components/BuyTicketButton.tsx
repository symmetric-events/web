"use client";

import { Button } from "~/app/(frontend)/components/Button";

interface BuyTicketButtonProps {
  quantity: number;
  loadingQuantity: number | null;
  onClick: (quantity: number) => void;
  variant?: "primary" | "secondary";
}

export function BuyTicketButton({
  quantity,
  loadingQuantity,
  onClick,
  variant = "primary",
}: BuyTicketButtonProps) {
  const isLoading = loadingQuantity === quantity;
  const isDisabled = loadingQuantity !== null;

  return (
    <Button
      onClick={() => onClick(quantity)}
      variant={variant}
      size="lg"
      disabled={isDisabled}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </span>
      ) : (
        quantity === 1 ? "Buy Ticket" : "Buy Tickets"
      )}
    </Button>
  );
}

