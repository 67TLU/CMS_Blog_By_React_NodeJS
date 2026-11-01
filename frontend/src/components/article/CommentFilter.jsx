export default function CommentFilter({ filter, onChange }) {
  return (
    <div
      className="
        flex
        w-fit
        gap-1
        rounded-lg
        border
        border-border
        bg-muted/50
        p-1
      "
    >
      <button
        type="button"
        onClick={() => onChange("NEWEST")}
        className={`
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          transition-all
          ${
            filter === "NEWEST"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        Mới nhất
      </button>

      <button
        type="button"
        onClick={() => onChange("MOST_LIKED")}
        className={`
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          transition-all
          ${
            filter === "MOST_LIKED"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }
        `}
      >
        Nhiều like nhất
      </button>
    </div>
  );
}
