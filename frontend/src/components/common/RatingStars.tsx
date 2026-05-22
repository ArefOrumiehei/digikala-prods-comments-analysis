import { IconStar, IconStarFilled, IconStarHalfFilled } from "@tabler/icons-react";
import { toPersianDigits } from "smart-persian-tools";

export function RatingStars({ rate, useIn }: { rate: number | null; useIn: "search" | "detail" | "comment" }) {
  if (!rate) return null;
  const full = Math.floor(rate);
  const half = rate - full >= 0.5;

  return (
    <div className="flex items-center flex-row-reverse gap-1" dir="ltr">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < full) {
            return (
              <IconStarFilled
                key={i}
                size={useIn === "comment" ? 12 : 14}
                className="text-amber-500 fill-amber-500"
              />
            );
          }

          if (i === full && half) {
            return (
              <IconStarHalfFilled
                key={i}
                size={useIn === "comment" ? 12 : 14}
                className="text-amber-500 fill-amber-500"
              />
            );
          }

          return (
            <IconStar
              key={i}
              size={useIn === "comment" ? 12 : 14}
              className="text-amber-500"
            />
          );
        })}
      </div>

      {useIn !== "comment" &&
      <span className={`${useIn === "search" ? "text-xs text-gray-400 dark:text-gray-500" : "text-sm font-medium text-amber-600 dark:text-gray-300"} mr-1`}>
        {toPersianDigits(rate.toFixed(1))}
      </span>}
    </div>
  );
}