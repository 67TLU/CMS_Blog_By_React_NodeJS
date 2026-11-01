// src/components/cards/Skeletons.jsx
import React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

// Skeleton Bài viết — khớp cấu trúc & theme với ArticleCard
// variant: "default" (thẻ lưới) | "featured" (thẻ nổi bật)
export function ArticleCardSkeleton({ variant = "default", className }) {
  if (variant === "featured") {
    return (
      <Card
        className={cn(
          "relative overflow-hidden rounded-xl h-full border-border bg-card",
          className
        )}
      >
        <Skeleton className="w-full h-[380px] rounded-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent flex flex-col justify-end p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-md bg-white/20" />
            <Skeleton className="h-4 w-16 rounded-full bg-white/10" />
          </div>
          <Skeleton className="h-6 w-4/5 bg-white/20" />
          <Skeleton className="h-6 w-3/5 bg-white/20" />
          <Skeleton className="h-3 w-2/3 bg-white/10" />
          <div className="flex items-center justify-between pt-3 border-t border-white/20 mt-2">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-16 bg-white/10" />
              <Skeleton className="h-4 w-4 rounded-sm bg-white/10" />
              <Skeleton className="h-4 w-4 rounded-sm bg-white/10" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden flex flex-col h-full border-border bg-card text-card-foreground",
        className
      )}
    >
      <div className="relative h-44 bg-muted">
        <Skeleton className="h-full w-full rounded-none" />
        <Skeleton className="absolute top-2.5 left-2.5 h-5 w-16 rounded-md bg-background/60" />
      </div>
      <CardContent className="p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border mt-4">
          <Skeleton className="h-3 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3.5 w-3.5 rounded-sm" />
            <Skeleton className="h-3.5 w-3.5 rounded-sm" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Bảng quản lý
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-zinc-800/60">
      <td className="p-4"><Skeleton className="h-4 w-48" /></td>
      <td className="p-4"><Skeleton className="h-3 w-20" /></td>
      <td className="p-4"><Skeleton className="h-3 w-16" /></td>
      <td className="p-4"><Skeleton className="h-3 w-12" /></td>
      <td className="p-4 text-right"><Skeleton className="h-6 w-12 ml-auto" /></td>
    </tr>
  );
}