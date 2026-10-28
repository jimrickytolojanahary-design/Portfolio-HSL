import React from "react";
import { Skeleton } from "../ui/skeleton";

interface ProjectCardSkeletonProps {
  className?: string;
  variant?: "showcase" | "bento";
}

/**
 * Skeleton screen component for project cards during the initial loading phase.
 * Replicates the visual hierarchy (header, tabs, screen window mockup, and legend)
 * with shimmering placeholders to optimize perceived performance.
 */
export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({
  className = "",
  variant = "showcase",
}) => {
  if (variant === "bento") {
    return (
      <div
        role="status"
        aria-label="Chargement du projet..."
        className={`relative flex flex-col justify-between overflow-hidden rounded-2xl p-4.5 lg:p-5 border border-[#E8E1D5]/90 bg-white/80 backdrop-blur-md shadow-xs animate-pulse ${className}`}
      >
        <div>
          {/* Card Thumbnail Window placeholder */}
          <div className="relative mb-3.5 h-32 w-full overflow-hidden rounded-xl bg-[#EDE7DE] border border-[#E8E1D5]/80 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-[#E2D8CC]/80" />
            <div className="absolute top-2.5 left-2.5 h-4 w-8 rounded-md bg-[#DFD5C8]" />
            <div className="absolute bottom-2.5 right-2.5 h-4 w-12 rounded-full bg-[#DFD5C8]" />
          </div>

          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-3.5 w-20 bg-[#E8E0D5] rounded-md" />
            <Skeleton className="h-3.5 w-6 bg-[#E8E0D5] rounded-md" />
          </div>
          <Skeleton className="h-5 w-4/5 bg-[#E2D8CC] rounded-lg mb-2" />
          <Skeleton className="h-3 w-full bg-[#ECE5DC] rounded-md mb-1.5" />
          <Skeleton className="h-3 w-3/4 bg-[#ECE5DC] rounded-md" />
        </div>

        <div className="mt-4 pt-3 border-t border-[#F0EBE3] flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 bg-[#E8E0D5] rounded-md" />
          <Skeleton className="h-4 w-4 bg-[#E2D8CC] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-label="Chargement de la carte de projet..."
      className={`relative rounded-3xl border border-white/80 bg-white/85 backdrop-blur-xl shadow-[0_24px_60px_-15px_rgba(45,36,30,0.08),0_0_0_1px_rgba(231,224,213,0.7)] overflow-hidden animate-pulse ${className}`}
    >
      {/* Entête du projet skeleton */}
      <div className="p-5 sm:p-8 border-b border-[#EAE3D8]/80 bg-[#FAF8F5]/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Category & Status badge */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <Skeleton className="h-4 w-32 rounded-full bg-[#E8E0D5]" />
            <span className="text-[#C5B7A8]" aria-hidden="true">
              •
            </span>
            <Skeleton className="h-5 w-48 rounded-full bg-emerald-100/70" />
          </div>

          {/* Project Title */}
          <Skeleton className="h-8 sm:h-9 w-3/4 sm:w-1/2 rounded-xl bg-[#DECFC1] mb-2.5" />

          {/* Short description lines */}
          <div className="space-y-1.5 max-w-2xl">
            <Skeleton className="h-3.5 w-full bg-[#EDE7DE] rounded-md" />
            <Skeleton className="h-3.5 w-4/5 bg-[#EDE7DE] rounded-md" />
          </div>
        </div>

        {/* Action button: Voir le détail skeleton */}
        <div className="shrink-0 flex items-center">
          <Skeleton className="h-11 w-32 rounded-xl bg-[#E8E1D5]" />
        </div>
      </div>

      {/* Interactive Screen Viewer (Window style) skeleton */}
      <div className="p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-[#F9F7F3]/60 to-[#F4EFE8]/50">
        <div className="overflow-hidden rounded-2xl border border-[#DED4C8]/90 bg-white shadow-[0_20px_50px_rgba(68,52,38,0.08)]">
          {/* Window Title Bar avec Sélecteur de vues secondaires */}
          <div className="flex items-center justify-between border-b border-[#EAE3D8] bg-[#F4EFE8]/90 backdrop-blur-md px-4 py-3 sm:px-6">
            {/* Window micro-dots */}
            <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#D9CEBF]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#D9CEBF]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#D9CEBF]" />
            </div>

            {/* View switchers (Vue 1, Vue 2, Vue 3) */}
            <div className="flex max-w-full items-center gap-2 mx-auto sm:mx-0">
              <Skeleton className="h-8 sm:h-9 w-18 sm:w-20 rounded-xl bg-[#2D241E]/20" />
              <Skeleton className="h-8 sm:h-9 w-18 sm:w-20 rounded-xl bg-[#E8E1D5]" />
              <Skeleton className="h-8 sm:h-9 w-18 sm:w-20 rounded-xl bg-[#E8E1D5]" />
            </div>
          </div>

          {/* Window Body: Shimmering Screen Mockup Canvas */}
          <div className="relative flex min-h-[240px] sm:min-h-[460px] items-center justify-center overflow-hidden bg-[#EDE7DE] p-4 sm:p-8">
            <div className="w-full max-w-3xl flex flex-col gap-4">
              {/* Fake dashboard UI wires */}
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#DFD6CA]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#DFD6CA]" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 rounded bg-[#DFD6CA]" />
                    <div className="h-2.5 w-16 rounded bg-[#E8E1D5]" />
                  </div>
                </div>
                <div className="h-7 w-24 rounded-lg bg-[#DFD6CA]" />
              </div>

              {/* Fake rows / grid wireframe */}
              <div className="grid grid-cols-3 gap-3">
                <div className="h-20 rounded-xl bg-[#E4DACD]" />
                <div className="h-20 rounded-xl bg-[#E4DACD]" />
                <div className="h-20 rounded-xl bg-[#E4DACD]" />
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="h-10 rounded-lg bg-[#E2D8CB]" />
                <div className="h-10 rounded-lg bg-[#E2D8CB]" />
                <div className="h-10 rounded-lg bg-[#E2D8CB]" />
              </div>
            </div>
          </div>

          {/* Pied de carte skeleton */}
          <div className="px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-md border-t border-[#EAE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-36 bg-[#DECFC1] rounded-md" />
              <Skeleton className="h-3.5 w-48 bg-[#EDE7DE] rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-24 bg-[#DECFC1] rounded-md" />
              <Skeleton className="h-3.5 w-20 bg-[#DECFC1] rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
