import Mark from "./Mark";
import { NAME } from "@/lib/site";

/*
 * The wordmark: the name set as live type, so it follows the theme. The mark
 * sits to its left in the lockup. The gradient never touches the letters.
 */

type WordmarkProps = {
  /** Font size. A number is px; a string is any CSS length. */
  size?: number | string;
  /** Draws the mark to the left, sized in em so it scales with the word. */
  withMark?: boolean;
  className?: string;
};

export default function Wordmark({ size = 20, withMark = false, className }: WordmarkProps) {
  const fontSize = typeof size === "number" ? `${size}px` : size;
  return (
    <span
      className={`text-text font-display inline-flex items-center font-semibold tracking-tight whitespace-nowrap ${className ?? ""}`}
      style={{ fontSize, lineHeight: 1 }}
    >
      {withMark ? (
        <span aria-hidden="true" style={{ width: "1.5em", height: "1.5em", marginRight: "0.45em" }}>
          <Mark size={64} className="h-full w-full" />
        </span>
      ) : null}
      {NAME}
    </span>
  );
}
