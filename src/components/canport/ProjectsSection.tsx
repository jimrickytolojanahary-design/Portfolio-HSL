import React, { useEffect, useRef, useState, useCallback } from "react";
import { projectsData } from "../../data/portfolioData";
import { Project, Screenshot } from "../../portfolio-types";
import {
  Maximize2,
  X,
  Sparkles,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProjectScreenMockup } from "./ProjectScreenMockup";
import { ProjectCardSkeleton } from "./ProjectCardSkeleton";
import { useScrollLock } from "../../hooks/use-scroll-lock";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollReveal } from "./ScrollReveal";

const projectBadgeTooltips: Record<
  string,
  { title: string; subtitle: string; description: string }
> = {
  "suivi-clients": {
    title: "Pipeline 100% tracé (HubSpot CRM)",
    subtitle: "Cycle complet de vente & post-vente",
    description:
      "Chaque prospect franchit des étapes définies (contact, qualification, proposition, actif) avec alertes automatiques pour maximiser les relances sans opportunité perdue.",
  },
  "suivi-taches": {
    title: "Pipeline de coordination (Notion & Trello)",
    subtitle: "Gestion de flux & alignement d'équipe",
    description:
      "Flux Kanban structuré par priorités (High / Medium / Low) et délais fermes : chaque collaborateur sait exactement quoi traiter et pour quand.",
  },
  "email-support-sav": {
    title: "Pipeline de support & SAV (Gmail)",
    subtitle: "Désescalade & réactivité < 24h",
    description:
      "Organisation rigoureuse par libellés prioritaires et réponses empathiques transmises sous 24h pour désamorcer les litiges et rassurer les apprenants.",
  },
  "suivi-paiements": {
    title: "Pipeline financier (Google Sheets & Notion)",
    subtitle: "Échéancier & contrôle des impayés",
    description:
      "Rapprochement automatisé des encaissements et abonnements : détection immédiate des retards et relances sous 48h pour zéro impayé.",
  },
};

interface ProjectsSectionProps {
  onOpenBooking?: (plan?: string) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ onOpenBooking }) => {
  const [activeProjectId, setSelectedProjectId] = useState<string>(projectsData[0]?.id ?? "");
  const [desktopVirtualIndex, setDesktopVirtualIndex] = useState(projectsData.length); // starts at copy 1
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState(true);
  const desktopRailRef = useRef<HTMLDivElement>(null);
  const [desktopPositions, setDesktopPositions] = useState<number[]>([]);
  const mobileBentoCarouselRef = useRef<HTMLDivElement>(null);
  const [activeMobileCardIndex, setActiveMobileCardIndex] = useState(0);

  // Synchronise global activeProjectId with desktop & mobile card index
  const setActiveProjectId = useCallback((id: string) => {
    const index = projectsData.findIndex((project) => project.id === id);
    if (index < 0) return;
    setSelectedProjectId(id);
    setActiveMobileCardIndex(index);
    setDesktopVirtualIndex(projectsData.length + index);
    setIsDesktopTransitioning(true);
  }, []);

  const [activeViewByProject, setActiveViewByProject] = useState<Record<string, string>>({
    "suivi-clients": "sc-1",
    "suivi-taches": "st-1",
    "email-support-sav": "es-1",
    "suivi-paiements": "sp-1",
  });
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [zoomedScreenshot, setZoomedScreenshot] = useState<{
    project: Project;
    screenshot: Screenshot;
  } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Preload initial showcase image & release initial loading state for skeleton screen
  useEffect(() => {
    const firstImgUrl = projectsData[0]?.screenshots[0]?.imageUrl;
    if (firstImgUrl) {
      const img = new Image();
      img.src = firstImgUrl;
      img.onload = () => setIsInitialLoading(false);
      img.onerror = () => setIsInitialLoading(false);
    }
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const isZoomed = Boolean(zoomedScreenshot);
  useScrollLock(isZoomed);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isZoomed) return;
    const prev = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomedScreenshot(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [isZoomed]);

  // Initial centering of project 0 on Mobile & Tablet (< 1024px)
  useEffect(() => {
    const selector = selectorRef.current;
    if (!selector || window.matchMedia("(min-width: 1024px)").matches) return;

    const centerInitial = () => {
      const initialPill = selector.querySelector<HTMLElement>(
        `[data-project-id="${projectsData[0]?.id}"][data-copy="2"]`,
      );
      if (!initialPill) return;
      const rect = initialPill.getBoundingClientRect();
      const delta = rect.left + rect.width / 2 - window.innerWidth / 2;
      selector.scrollLeft += delta;
    };

    const timer = setTimeout(centerInitial, 60);
    return () => clearTimeout(timer);
  }, []);

  // Silent infinite loop rebasing for Mobile/Tablet (< 1024px) when idle after scrolling
  useEffect(() => {
    const selector = selectorRef.current;
    if (!selector) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (window.matchMedia("(min-width: 1024px)").matches) return;
        const copy0Pill = selector.querySelector<HTMLElement>('[data-copy="0"]');
        const copy1Pill = selector.querySelector<HTMLElement>('[data-copy="1"]');
        if (!copy0Pill || !copy1Pill) return;
        const copyWidth = copy1Pill.offsetLeft - copy0Pill.offsetLeft;
        if (copyWidth <= 0) return;

        // 5 copies: 0, 1, 2, 3, 4. Center is copy 2 (~ 2 * copyWidth)
        if (selector.scrollLeft < copyWidth * 1.2) {
          selector.scrollLeft += copyWidth * 2;
        } else if (selector.scrollLeft > copyWidth * 3.8) {
          selector.scrollLeft -= copyWidth * 2;
        }
      }, 150);
    };

    selector.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      selector.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Center selected project in the middle of the screen when activeProjectId changes
  useEffect(() => {
    const selector = selectorRef.current;
    if (!selector || window.matchMedia("(min-width: 1024px)").matches) return;

    const pills = Array.from(
      selector.querySelectorAll<HTMLElement>(`[data-project-id="${activeProjectId}"]`),
    );
    if (pills.length === 0) return;

    const screenCenter = window.innerWidth / 2;
    let closestPill: HTMLElement = pills[0]!;
    let closestDist = Infinity;
    for (const pill of pills) {
      const rect = pill.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - screenCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestPill = pill;
      }
    }

    if (closestDist > 6 && closestPill) {
      const rect = closestPill.getBoundingClientRect();
      const delta = rect.left + rect.width / 2 - screenCenter;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      selector.scrollBy({
        left: delta,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  }, [activeProjectId]);

  // Measure variable-width pills for Desktop (≥ 1024px)
  useEffect(() => {
    const rail = desktopRailRef.current;
    if (!rail) return;
    let disposed = false;
    const measure = () => {
      if (disposed || !window.matchMedia("(min-width: 1024px)").matches) return;
      const pills = Array.from(rail.querySelectorAll<HTMLElement>("[data-desktop-pill]"));
      if (pills.length === 0) return;
      const gap = Number.parseFloat(window.getComputedStyle(rail).columnGap) || 12;
      let left = 0;
      setDesktopPositions(
        pills.map((pill, idx) => {
          const width = Number.parseFloat(window.getComputedStyle(pill).width) || pill.offsetWidth;
          const pos = idx === 0 ? 0 : left;
          left += width + gap;
          return pos;
        }),
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    rail
      .querySelectorAll<HTMLElement>("[data-desktop-pill]")
      .forEach((pill) => observer.observe(pill));
    window.addEventListener("resize", measure);
    void document.fonts.ready.then(measure);
    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Desktop loop rebasing outside animations: when transition ends, rebase between copies if needed
  const handleDesktopTransitionEnd = useCallback(() => {
    const N = projectsData.length;
    setDesktopVirtualIndex((current) => {
      if (current >= 2 * N) {
        setIsDesktopTransitioning(false);
        return current - N;
      }
      if (current < N) {
        setIsDesktopTransitioning(false);
        return current + N;
      }
      return current;
    });
  }, []);

  // Re-enable transition on next frame after rebasing
  useEffect(() => {
    if (!isDesktopTransitioning) {
      const raf = requestAnimationFrame(() => {
        setIsDesktopTransitioning(true);
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [isDesktopTransitioning]);

  // Desktop navigation with infinite loop
  const selectAdjacentDesktop = useCallback((direction: -1 | 1) => {
    setIsDesktopTransitioning(true);
    setDesktopVirtualIndex((prev) => {
      const next = prev + direction;
      const N = projectsData.length;
      const normalizedProject = projectsData[((next % N) + N) % N];
      if (normalizedProject) {
        setSelectedProjectId(normalizedProject.id);
        const pIndex = projectsData.findIndex((p) => p.id === normalizedProject.id);
        setActiveMobileCardIndex(pIndex >= 0 ? pIndex : 0);
      }
      return next;
    });
  }, []);

  // Mobile navigation with infinite loop & screen-centered target pill
  const selectAdjacentMobile = useCallback((direction: -1 | 1) => {
    const selector = selectorRef.current;
    if (!selector) return;

    const pills = Array.from(selector.querySelectorAll<HTMLElement>("[data-project-id]"));
    if (pills.length === 0) return;

    const screenCenter = window.innerWidth / 2;
    let closestPill: HTMLElement = pills[0]!;
    let closestDist = Infinity;

    for (const pill of pills) {
      const rect = pill.getBoundingClientRect();
      const dist = Math.abs(rect.left + rect.width / 2 - screenCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestPill = pill;
      }
    }

    const currentIndex = closestPill ? pills.indexOf(closestPill) : -1;
    const targetIndex = currentIndex + direction;
    const targetPill = pills[targetIndex];

    if (targetPill) {
      const targetProjectId = targetPill.getAttribute("data-project-id");
      if (targetProjectId) {
        const pIndex = projectsData.findIndex((p) => p.id === targetProjectId);
        setSelectedProjectId(targetProjectId);
        setActiveMobileCardIndex(pIndex >= 0 ? pIndex : 0);
        setDesktopVirtualIndex(projectsData.length + (pIndex >= 0 ? pIndex : 0));
        setIsDesktopTransitioning(true);
      }
      const rect = targetPill.getBoundingClientRect();
      const delta = rect.left + rect.width / 2 - screenCenter;
      selector.scrollBy({
        left: delta,
        behavior: "smooth",
      });
    }
  }, []);

  // Direct pill click on mobile: center immediately in the middle of the screen
  const handleMobilePillClick = (projectId: string, element: HTMLElement) => {
    const pIndex = projectsData.findIndex((p) => p.id === projectId);
    setSelectedProjectId(projectId);
    setActiveMobileCardIndex(pIndex >= 0 ? pIndex : 0);
    setDesktopVirtualIndex(projectsData.length + (pIndex >= 0 ? pIndex : 0));
    setIsDesktopTransitioning(true);

    const rect = element.getBoundingClientRect();
    const delta = rect.left + rect.width / 2 - window.innerWidth / 2;
    const selector = selectorRef.current;
    if (selector && Math.abs(delta) > 1) {
      selector.scrollBy({
        left: delta,
        behavior: "smooth",
      });
    }
  };

  const currentProject = projectsData.find((p) => p.id === activeProjectId) ?? projectsData[0]!;
  const activeViewId =
    activeViewByProject[currentProject.id] ?? currentProject.screenshots[0]?.id ?? "";
  const currentScreenshot =
    currentProject.screenshots.find((s) => s.id === activeViewId) ?? currentProject.screenshots[0]!;

  const handleSelectView = (projectId: string, viewId: string) => {
    setActiveViewByProject((prev) => ({
      ...prev,
      [projectId]: viewId,
    }));
  };

  const handleMobileScroll = useCallback(() => {
    const carousel = mobileBentoCarouselRef.current;
    if (!carousel) return;
    const scrollLeft = carousel.scrollLeft;
    const firstChild = carousel.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.offsetWidth + 14 : carousel.clientWidth * 0.82;
    const newIndex = Math.round(scrollLeft / cardWidth);
    if (newIndex >= 0 && newIndex < projectsData.length && newIndex !== activeMobileCardIndex) {
      setActiveMobileCardIndex(newIndex);
    }
  }, [activeMobileCardIndex]);

  const selectAdjacentView = (direction: -1 | 1, inModal = false) => {
    const project = inModal && zoomedScreenshot ? zoomedScreenshot.project : currentProject;
    const activeId =
      inModal && zoomedScreenshot ? zoomedScreenshot.screenshot.id : currentScreenshot.id;
    const currentViewIndex = project.screenshots.findIndex(
      (screenshot) => screenshot.id === activeId,
    );
    const nextIndex =
      (currentViewIndex + direction + project.screenshots.length) % project.screenshots.length;
    const nextScreenshot = project.screenshots[nextIndex];
    if (!nextScreenshot) return;
    if (inModal) {
      setZoomedScreenshot({ project, screenshot: nextScreenshot });
    } else {
      handleSelectView(project.id, nextScreenshot.id);
    }
  };

  return (
    <section
      id="projets"
      className="relative py-16 sm:py-24 md:py-32 bg-gradient-to-b from-[#F7F3EB]/90 via-[#FAF7F2]/60 to-[#F7F3EB]/90 border-t border-[#EAE3D8] scroll-mt-20 overflow-hidden"
    >
      {/* Subtle luminous ambient backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[700px] max-w-[90vw] h-[340px] bg-gradient-to-tr from-[#E0A97E]/10 via-[#F3E7D7]/30 to-transparent rounded-full blur-3xl opacity-75"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 right-0 w-[500px] h-[300px] bg-gradient-to-bl from-[#E2D5C3]/20 via-transparent to-transparent rounded-full blur-3xl opacity-60"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-[#E7E0D5]/90 text-xs font-semibold uppercase tracking-wider text-[#7A583E] mb-3.5 shadow-[0_2px_12px_rgba(45,36,30,0.04)]">
            <Sparkles className="w-3.5 h-3.5 text-[#A87C51]" />
            <span>Exemples de mon travail & Réalisations</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D241E] tracking-tight">
            Cas concrets : ce que ça change quand vous déléguez
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#635345] leading-relaxed">
            Des processus éprouvés au quotidien pour zéro oubli et une totale clarté.
          </p>
        </ScrollReveal>

        {/* Mobile & Tablet Slider Bar (< 1024px) : Flèche gauche à gauche, onglets au milieu, flèche droite à droite */}
        <div className="flex lg:hidden items-center gap-2 mb-5">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => selectAdjacentMobile(-1)}
            aria-label="Projet précédent"
            className="rounded-full h-10 w-10 shrink-0 border-[#DED3C5]/90 bg-white/90 backdrop-blur-md text-[#4A3F35] shadow-xs hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          <div
            ref={selectorRef}
            className="flex flex-1 items-center overflow-x-auto px-1 pb-2 pt-1 gap-2.5 sm:gap-3 scrollbar-none min-w-0"
          >
            {[0, 1, 2, 3, 4].flatMap((copy) =>
              projectsData.map((project) => {
                const isSelected = project.id === activeProjectId;
                return (
                  <button
                    key={`${project.id}-${copy}`}
                    data-project-id={project.id}
                    data-copy={copy}
                    aria-hidden={copy !== 2}
                    tabIndex={copy === 2 ? 0 : -1}
                    type="button"
                    onClick={(e) => handleMobilePillClick(project.id, e.currentTarget)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap cursor-pointer shrink-0 border snap-center ${
                      isSelected
                        ? "bg-[#2D241E] text-[#FDFBF7] border-[#2D241E] shadow-[0_8px_20px_rgba(45,36,30,0.18)] scale-[1.02]"
                        : "bg-white/85 backdrop-blur-md text-[#5C4D3E] border-[#E8E1D5]/90 hover:bg-white hover:border-[#D5C7B7] hover:shadow-xs"
                    }`}
                  >
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? "bg-[#43362C] text-[#E0A97E]" : "bg-[#F2ECE4] text-[#7A695B]"
                      }`}
                    >
                      {project.number}
                    </span>
                    <span>{project.title}</span>
                  </button>
                );
              }),
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => selectAdjacentMobile(1)}
            aria-label="Projet suivant"
            className="rounded-full h-10 w-10 shrink-0 border-[#DED3C5]/90 bg-white/90 backdrop-blur-md text-[#4A3F35] shadow-xs hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Desktop Slider Bar (≥ 1024px) : Onglets flush à gauche + Flèches groupées à droite avec boucle infinie */}
        <div className="hidden lg:flex items-center justify-between gap-4 mb-7">
          <div className="min-w-0 flex-1 overflow-hidden py-1">
            <div
              ref={desktopRailRef}
              onTransitionEnd={handleDesktopTransitionEnd}
              className="relative flex w-max items-center gap-3 motion-reduce:transition-none"
              style={{
                transform: `translateX(-${desktopPositions[desktopVirtualIndex] ?? 0}px)`,
                transition: isDesktopTransitioning ? "transform 300ms ease-in-out" : "none",
              }}
            >
              {[0, 1, 2].flatMap((copy) =>
                projectsData.map((project, index) => {
                  const globalIndex = copy * projectsData.length + index;
                  const isSelected = globalIndex === desktopVirtualIndex;
                  return (
                    <Button
                      key={`desktop-${project.id}-${copy}`}
                      data-project-id={project.id}
                      data-desktop-pill="true"
                      data-desktop-copy={copy}
                      type="button"
                      variant="ghost"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setDesktopVirtualIndex(globalIndex);
                        setIsDesktopTransitioning(true);
                        setActiveProjectId(project.id);
                      }}
                      className={`h-auto flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 ease-in-out whitespace-nowrap cursor-pointer shrink-0 border ${
                        isSelected
                          ? "bg-[#2D241E] text-[#FDFBF7] border-[#2D241E] shadow-[0_8px_20px_rgba(45,36,30,0.18)] scale-[1.02]"
                          : "bg-white/85 backdrop-blur-md text-[#5C4D3E] border-[#E8E1D5]/90 hover:bg-white hover:border-[#D5C7B7] hover:shadow-xs"
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-[#43362C] text-[#E0A97E]" : "bg-[#F2ECE4] text-[#7A695B]"
                        }`}
                      >
                        {project.number}
                      </span>
                      <span>{project.title}</span>
                    </Button>
                  );
                }),
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => selectAdjacentDesktop(-1)}
              aria-label="Projet précédent"
              className="rounded-full h-11 w-11 border-[#DED3C5]/90 bg-white/90 backdrop-blur-md text-[#4A3F35] shadow-xs hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => selectAdjacentDesktop(1)}
              aria-label="Projet suivant"
              className="rounded-full h-11 w-11 border-[#DED3C5]/90 bg-white/90 backdrop-blur-md text-[#4A3F35] shadow-xs hover:bg-white hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Swipe drag indicator on mobile */}
        <div
          className="-mt-1 mb-6 flex items-center justify-center sm:hidden cursor-grab active:cursor-grabbing select-none touch-pan-y"
          onPointerDown={(e) => {
            const selector = selectorRef.current;
            if (!selector) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            const startX = e.clientX;
            const startScroll = selector.scrollLeft;
            const onMove = (ev: PointerEvent) => {
              selector.scrollLeft = startScroll - (ev.clientX - startX);
            };
            const onEnd = () => {
              window.removeEventListener("pointermove", onMove);
              window.removeEventListener("pointerup", onEnd);
              window.removeEventListener("pointercancel", onEnd);
            };
            window.addEventListener("pointermove", onMove);
            window.addEventListener("pointerup", onEnd);
            window.addEventListener("pointercancel", onEnd);
          }}
          role="presentation"
          aria-label="Glisser pour faire défiler les projets"
        >
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.1em] text-[#7A695B]">
            <span className="inline-block animate-[drag-arrow-left_1.6s_ease-in-out_infinite]">
              ←
            </span>
            <span>Glisser pour voir plus</span>
            <span className="inline-block animate-[drag-arrow-right_1.6s_ease-in-out_infinite]">
              →
            </span>
          </p>
        </div>

        {/* Carte principale du Projet : Skeleton Screen lors du chargement initial puis transitions fluides */}
        {isInitialLoading ? (
          <ProjectCardSkeleton variant="showcase" />
        ) : (
          <motion.div
            key={currentProject.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl border border-white/80 bg-white/85 backdrop-blur-xl shadow-[0_24px_60px_-15px_rgba(45,36,30,0.08),0_0_0_1px_rgba(231,224,213,0.7)] overflow-hidden will-change-[transform,opacity] motion-reduce:transform-none motion-reduce:transition-none"
          >
            {/* Entête du projet */}
            <div className="p-5 sm:p-8 border-b border-[#EAE3D8]/80 bg-[#FAF8F5]/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A583E] sm:text-[#A87C51]">
                    Cas n°{currentProject.number} • {currentProject.tools[0]}
                  </span>
                  <span className="text-[#C5B7A8]">•</span>
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50/90 text-emerald-800 border border-emerald-200/80 text-[10px] font-bold backdrop-blur-xs cursor-help transition-all duration-200 hover:bg-emerald-100/90 hover:border-emerald-300 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-[#7A583E]"
                          aria-label={`Détail du statut : ${currentProject.highlightBadge}`}
                        >
                          <span>{currentProject.highlightBadge}</span>
                          <Info
                            className="w-3 h-3 text-emerald-700/80 shrink-0"
                            aria-hidden="true"
                          />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="start"
                        sideOffset={6}
                        className="max-w-xs p-3.5 rounded-2xl bg-[#2D241E]/95 text-white border border-[#4A3C31] shadow-2xl backdrop-blur-xl text-left z-50 animate-in fade-in-0 zoom-in-95"
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-[#E0A97E] uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-[#E0A97E]" />
                          <span>
                            {projectBadgeTooltips[currentProject.id]?.title ?? "Pipeline de suivi"}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-[#C5B7A8] mb-1.5">
                          {projectBadgeTooltips[currentProject.id]?.subtitle}
                        </p>
                        <p className="text-[11px] leading-relaxed text-[#F5EFE6]">
                          {projectBadgeTooltips[currentProject.id]?.description ??
                            currentProject.highlightBadge}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2D241E] tracking-tight">
                  {currentProject.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#635345] mt-1.5 max-w-2xl leading-relaxed">
                  {currentProject.shortDescription}
                </p>
              </div>

              {/* Action button: Voir le détail ⌵ */}
              <div className="flex items-center shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen((prev) => !prev)}
                  className={`inline-flex min-w-0 items-center justify-center gap-2 min-h-11 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 ease-in-out cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
                    isDetailsOpen
                      ? "bg-[#2D241E] text-white border-[#2D241E] shadow-sm"
                      : "bg-white/90 backdrop-blur-md text-[#4A3F35] border-[#E2DAD0] hover:bg-white hover:border-[#D5C8B8]"
                  }`}
                  title="Déplier / replier les 3 volets fondamentaux"
                >
                  <span>Voir le détail</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${
                      isDetailsOpen ? "rotate-180 text-[#E0A97E]" : "text-[#7A695B]"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Interactive Screen Viewer (Window style) */}
            <div className="p-3 sm:p-6 lg:p-8 bg-gradient-to-b from-[#F9F7F3]/60 to-[#F4EFE8]/50">
              <div className="group/card overflow-hidden rounded-2xl border border-[#DED4C8]/90 bg-white shadow-[0_20px_50px_rgba(68,52,38,0.08)] transition-[transform,box-shadow] duration-300 ease-in-out motion-reduce:transition-none lg:hover:-translate-y-1 lg:hover:shadow-[0_28px_70px_rgba(68,52,38,0.13)]">
                {/* Window Title Bar avec Sélecteur de vues secondaires */}
                <div className="flex items-center justify-between border-b border-[#EAE3D8] bg-[#F4EFE8]/90 backdrop-blur-md px-4 py-3 sm:px-6">
                  {/* Window micro-dots */}
                  <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#D9CEBF]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#D9CEBF]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5DDD0] border border-[#D9CEBF]" />
                  </div>

                  {/* Sélecteur de vues (Vue 1, Vue 2, Vue 3) */}
                  <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-0.5 mx-auto sm:mx-0">
                    {currentProject.screenshots.map((sc, index) => {
                      const isViewActive = activeViewId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => handleSelectView(currentProject.id, sc.id)}
                          aria-pressed={isViewActive}
                          className="group/view grid min-h-11 min-w-11 cursor-pointer place-items-center rounded-lg px-0.5 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#7A583E] sm:px-2.5 sm:text-xs"
                        >
                          <span
                            className={`inline-flex h-8 items-center rounded-xl border px-3 transition-all duration-300 ease-in-out sm:h-9 sm:px-4 ${
                              isViewActive
                                ? "border-[#2D241E] bg-[#2D241E] text-white shadow-xs scale-[1.02]"
                                : "border-[#E8E1D5] bg-white/90 text-[#635345] hover:bg-white group-hover/view:bg-[#F2ECE4]"
                            }`}
                          >
                            Vue {index + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Window Body: Images de l'aperçu épurées sans flèches superposées */}
                <div className="group relative flex min-h-[220px] items-center justify-center overflow-hidden bg-[#EDE7DE] p-2.5 sm:min-h-[480px] sm:p-6">
                  {!loadedImages[currentScreenshot.id] && !imgErrors[currentScreenshot.id] && (
                    <div
                      className="absolute inset-0 z-10 grid place-items-center bg-[#F2EDE6]"
                      role="status"
                      aria-label="Chargement de l’image"
                    >
                      <div className="relative h-12 w-12">
                        <span className="absolute inset-0 rounded-full border border-[#D8CABA]" />
                        <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#7A583E]" />
                        <span className="absolute inset-[18px] rounded-full bg-[#A87C51]" />
                      </div>
                    </div>
                  )}
                  {!imgErrors[currentScreenshot.id] ? (
                    <img
                      key={currentScreenshot.id}
                      src={currentScreenshot.imageUrl}
                      alt={currentScreenshot.title}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      className={`block h-auto w-full max-w-full max-h-[55vh] sm:max-h-[520px] object-contain rounded-xl shadow-[0_20px_45px_rgba(63,49,37,0.16)] transition-[opacity,transform] duration-500 ease-in-out motion-reduce:transition-none cursor-zoom-in lg:group-hover:scale-[1.02] ${loadedImages[currentScreenshot.id] ? "opacity-100" : "opacity-0"}`}
                      onClick={() =>
                        setZoomedScreenshot({
                          project: currentProject,
                          screenshot: currentScreenshot,
                        })
                      }
                      onLoad={() =>
                        setLoadedImages((prev) => ({ ...prev, [currentScreenshot.id]: true }))
                      }
                      onError={() => {
                        setImgErrors((prev) => ({ ...prev, [currentScreenshot.id]: true }));
                      }}
                    />
                  ) : (
                    <div className="w-full h-full min-h-[240px] sm:min-h-[460px] flex items-center justify-center">
                      <ProjectScreenMockup screenshotId={currentScreenshot.id} />
                    </div>
                  )}

                  {/* Overlay discret au survol */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-[#2D241E]/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-in-out motion-reduce:transition-none lg:group-hover:opacity-100"
                  />

                  {/* Bouton plein écran discret en bas à droite */}
                  <div className="absolute bottom-3 right-3 z-20 hidden items-center gap-2 transition-[opacity,transform] duration-300 ease-in-out motion-reduce:transition-none sm:bottom-5 sm:right-5 sm:flex lg:translate-y-1 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:focus-within:translate-y-0 lg:focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedScreenshot({
                          project: currentProject,
                          screenshot: currentScreenshot,
                        })
                      }
                      aria-label="Afficher en plein écran"
                      title="Afficher en plein écran"
                      className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/85 text-[#2D241E] shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out hover:bg-white hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2D241E]"
                    >
                      <Maximize2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Actions mobiles sous l'image (< 640px) */}
                <div
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-[#DED4C8] bg-[#FAF8F5]/90 px-3.5 py-2.5 sm:hidden"
                  aria-label="Actions de l’image"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => selectAdjacentView(-1)}
                      aria-label="Photo précédente"
                      className="h-11 w-11 shrink-0 rounded-xl border-[#BFAF9E] bg-white text-[#2D241E] shadow-xs hover:bg-[#F3EDE4] active:bg-[#E8DED2] focus-visible:ring-2 focus-visible:ring-[#7A583E]"
                    >
                      <ChevronLeft className="h-5 w-5 stroke-[2.25]" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => selectAdjacentView(1)}
                      aria-label="Photo suivante"
                      className="h-11 w-11 shrink-0 rounded-xl border-[#BFAF9E] bg-white text-[#2D241E] shadow-xs hover:bg-[#F3EDE4] active:bg-[#E8DED2] focus-visible:ring-2 focus-visible:ring-[#7A583E]"
                    >
                      <ChevronRight className="h-5 w-5 stroke-[2.25]" />
                    </Button>
                    <span
                      className="truncate text-[11px] font-semibold text-[#5C4D3E]"
                      aria-live="polite"
                    >
                      {currentProject.screenshots.findIndex(
                        (screenshot) => screenshot.id === currentScreenshot.id,
                      ) + 1}{" "}
                      / {currentProject.screenshots.length}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setZoomedScreenshot({
                        project: currentProject,
                        screenshot: currentScreenshot,
                      })
                    }
                    aria-label="Afficher en plein écran"
                    className="h-11 shrink-0 gap-2 rounded-xl border-[#2D241E] bg-white px-3 text-xs font-bold text-[#2D241E] shadow-xs hover:bg-[#F3EDE4] active:bg-[#E8DED2] focus-visible:ring-2 focus-visible:ring-[#7A583E]"
                  >
                    <Maximize2 className="h-4 w-4" aria-hidden="true" />
                    Plein écran
                  </Button>
                </div>

                {/* Pied de carte : Légende dynamique précisant la vue actuelle et bouton Voir le détail */}
                <div className="px-4 sm:px-6 py-4 bg-white/90 backdrop-blur-md border-t border-[#EAE3D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-[#2D241E] mr-2">{currentScreenshot.title}</span>
                    <span className="text-[#6E5D4F]">{currentScreenshot.subtitle}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsDetailsOpen((prev) => !prev)}
                      className="inline-flex min-h-11 items-center gap-1 font-semibold text-[#65462F] hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A583E]"
                    >
                      <span>{isDetailsOpen ? "Masquer le détail ⌃" : "Voir le détail ⌵"}</span>
                    </button>
                    <span className="hidden md:inline text-[#D5C7B7] opacity-0 transition-opacity group-hover/card:opacity-100">
                      •
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setZoomedScreenshot({
                          project: currentProject,
                          screenshot: currentScreenshot,
                        })
                      }
                      className="hidden md:inline-flex opacity-0 transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 min-h-11 items-center gap-1 font-semibold text-[#2D241E] hover:underline cursor-pointer"
                    >
                      <span>Plein écran ↗</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Accordéon « Voir le détail » */}
            <AnimatePresence initial={false}>
              {isDetailsOpen && (
                <motion.div
                  id="project-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-[#EAE3D8] bg-white/95 backdrop-blur-md"
                >
                  <div className="p-5 sm:p-8">
                    {/* Accordion Header */}
                    <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:justify-between mb-6 pb-3 border-b border-[#F0EBE3]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#7A583E]">
                          Décomposition du cas • {currentProject.title}
                        </span>
                      </div>
                      <span className="w-fit text-[11px] font-semibold text-[#635345] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EAE3D8]">
                        3 volets fondamentaux
                      </span>
                    </div>

                    {/* 3 fundamental pillars */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
                      {/* 1. Le Besoin */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-50/70 to-white/90 border border-rose-100/90 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-md">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold shrink-0">
                              1
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-900">
                              1. Le Besoin Initial
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-[#635345] leading-relaxed">
                            {currentProject.need}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-rose-100 text-[11px] text-rose-700 font-medium">
                          Point de douleur initial identifié
                        </div>
                      </div>

                      {/* 2. La Solution */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF7F2]/90 to-white/90 border border-[#E8E1D5]/90 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-md">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-lg bg-[#EFE8DC] text-[#7A583E] flex items-center justify-center text-xs font-bold shrink-0">
                              2
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A583E]">
                              2. La Solution Mise en Place
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-[#635345] leading-relaxed">
                            {currentProject.solution}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#E8E1D5] text-[11px] text-[#7A583E] font-medium">
                          Dispositif & Système configurés
                        </div>
                      </div>

                      {/* 3. Le Résultat */}
                      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-white/90 border border-emerald-100/90 shadow-xs flex flex-col justify-between transition-shadow hover:shadow-md">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">
                              3
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                              3. Le Résultat Concret
                            </h4>
                          </div>
                          <p className="text-xs sm:text-sm text-[#635345] leading-relaxed">
                            {currentProject.result}
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-emerald-100 text-[11px] text-emerald-800 font-medium">
                          Gains mesurés & Sérénité retrouvée
                        </div>
                      </div>
                    </div>

                    {/* Bottom row: Tools used & Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#F0EBE3]">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#8A7969] mr-1">
                          Outils configurés :
                        </span>
                        {currentProject.tools.map((tool) => (
                          <span
                            key={tool}
                            className="px-3 py-1 rounded-lg bg-[#FAF7F2] text-[#4A3F35] text-xs font-semibold border border-[#E8E1D5]"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {currentProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] text-[#7A695B] bg-[#F5EFE6] px-2.5 py-0.5 rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Tous les cas concrets disponibles (Mobile Swipe Carousel & Desktop Bento) */}
        <div className="mt-14 sm:mt-20 pt-10 sm:pt-14 border-t border-[#EAE3D8]">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8A7969]">
              Tous les cas concrets disponibles :
            </h4>
            <span className="hidden sm:inline-block text-xs font-medium text-[#A89886]">
              {projectsData.length} cas documentés
            </span>
          </div>

          {/* Mobile Layout (< 768px): Carrousel tactile fluide avec peek effect */}
          <div className="block md:hidden">
            <div
              ref={mobileBentoCarouselRef}
              onScroll={handleMobileScroll}
              className="-mx-4 flex gap-3.5 overflow-x-auto px-4 pb-4 pt-1 snap-x snap-mandatory scrollbar-none touch-pan-x"
            >
              {projectsData.map((project) => {
                const isSelected = project.id === activeProjectId;
                const firstScreenshot = project.screenshots[0];
                return (
                  <button
                    key={`mobile-project-${project.id}`}
                    type="button"
                    onClick={() => {
                      setActiveProjectId(project.id);
                      document.getElementById("projets")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className={`w-[82vw] shrink-0 snap-center rounded-2xl p-4 text-left border transition-all duration-300 ease-in-out cursor-pointer backdrop-blur-md relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? "bg-white/95 border-[#2D241E] shadow-[0_16px_36px_rgba(45,36,30,0.12)] ring-2 ring-[#2D241E]/15"
                        : "bg-white/75 border-[#E8E1D5]/90 shadow-xs hover:bg-white active:scale-[0.98]"
                    }`}
                  >
                    {/* Visual Card Preview thumbnail */}
                    {firstScreenshot && (
                      <div className="relative mb-3.5 h-32 w-full overflow-hidden rounded-xl bg-[#EDE7DE] border border-[#E8E1D5]/80">
                        <img
                          src={firstScreenshot.imageUrl}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-top opacity-90 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
                              isSelected ? "bg-[#2D241E] text-white" : "bg-white/90 text-[#4A3F35]"
                            }`}
                          >
                            {project.number}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-white/95 backdrop-blur-md">
                            {project.screenshots.length} vues
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A583E]">
                            {project.tools[0]}
                          </span>
                          <span className="text-xs font-bold text-[#766454]">{project.number}</span>
                        </div>
                        <h5 className="text-sm font-bold text-[#2D241E] mb-1.5 line-clamp-1">
                          {project.title}
                        </h5>
                        <p className="text-[11px] text-[#6E5D4F] line-clamp-2 leading-relaxed">
                          {project.shortDescription}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#F0EBE3] flex items-center justify-between text-[11px] font-semibold">
                        <span className={isSelected ? "text-[#2D241E]" : "text-[#8A7969]"}>
                          {isSelected ? "Actuellement sélectionné" : "Explorer ce cas"}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${
                            isSelected ? "text-[#E0A97E] translate-x-1" : "text-[#B5A493]"
                          }`}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pagination Indicators sur Mobile */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {projectsData.map((project, index) => {
                const isActive = activeMobileCardIndex === index;
                return (
                  <button
                    key={`dot-${project.id}`}
                    type="button"
                    aria-label={`Aller au cas ${project.number} - ${project.title}`}
                    onClick={() => {
                      setActiveProjectId(project.id);
                      const carousel = mobileBentoCarouselRef.current;
                      if (carousel) {
                        const card = carousel.children[index] as HTMLElement | undefined;
                        if (card) {
                          card.scrollIntoView({
                            behavior: "smooth",
                            inline: "center",
                            block: "nearest",
                          });
                        }
                      }
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ease-in-out cursor-pointer ${
                      isActive ? "w-8 bg-[#2D241E]" : "w-2 bg-[#D5C7B7] hover:bg-[#A89886]"
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Desktop Layout (≥ 768px): Bento Grid épuré */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4.5 lg:gap-5">
            {projectsData.map((project) => {
              const isSelected = project.id === activeProjectId;
              const firstScreenshot = project.screenshots[0];
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => {
                    setActiveProjectId(project.id);
                    document.getElementById("projets")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-4.5 lg:p-5 text-left border transition-all duration-300 ease-in-out cursor-pointer backdrop-blur-md ${
                    isSelected
                      ? "bg-white/95 border-[#2D241E] shadow-[0_20px_45px_rgba(45,36,30,0.12)] ring-2 ring-[#2D241E]/15 scale-[1.01]"
                      : "bg-white/75 border-[#E8E1D5]/90 shadow-xs hover:bg-white/95 hover:border-[#D5C7B7] hover:shadow-[0_18px_40px_rgba(45,36,30,0.08)] hover:-translate-y-1.5"
                  }`}
                >
                  {/* Card Thumbnail Preview Window */}
                  {firstScreenshot && (
                    <div className="relative mb-3.5 h-32 w-full overflow-hidden rounded-xl bg-[#EDE7DE] border border-[#E8E1D5]/80">
                      <img
                        src={firstScreenshot.imageUrl}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover object-top opacity-90 transition-transform duration-500 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
                            isSelected ? "bg-[#2D241E] text-white" : "bg-white/90 text-[#4A3F35]"
                          }`}
                        >
                          {project.number}
                        </span>
                      </div>
                      <div className="absolute bottom-2.5 right-2.5">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/55 text-white/95 backdrop-blur-md">
                          {project.screenshots.length} vues
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A583E]">
                          {project.tools[0]}
                        </span>
                        <span className="text-xs font-bold text-[#766454] sm:text-[#CBBCA9]">
                          {project.number}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-[#2D241E] mb-1.5 group-hover:text-[#8C5E47] transition-colors duration-300">
                        {project.title}
                      </h5>
                      <p className="text-[11px] text-[#6E5D4F] line-clamp-2 leading-relaxed">
                        {project.shortDescription}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0EBE3] flex items-center justify-between text-[11px] font-semibold">
                      <span
                        className={
                          isSelected
                            ? "text-[#2D241E]"
                            : "text-[#8A7969] group-hover:text-[#2D241E]"
                        }
                      >
                        {isSelected ? "Actuellement sélectionné" : "Explorer ce cas"}
                      </span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-all duration-300 ease-in-out ${
                          isSelected
                            ? "text-[#E0A97E] translate-x-1"
                            : "text-[#B5A493] group-hover:text-[#2D241E] group-hover:translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox / Zoom Modal */}
      {zoomedScreenshot && (
        <div
          onClick={() => setZoomedScreenshot(null)}
          className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-black/65 backdrop-blur-md animate-fade-in motion-reduce:animate-none sm:items-center sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu du projet"
            className="relative max-h-[100dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border border-white/80 bg-[#FAF8F5]/95 backdrop-blur-xl p-5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:max-w-5xl sm:rounded-3xl sm:p-8"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setZoomedScreenshot(null)}
              ref={closeBtnRef}
              aria-label="Fermer le plein écran"
              className="sticky top-0 z-20 float-right grid h-11 w-11 place-items-center rounded-full bg-white/90 text-[#7A6C5E] shadow-sm hover:text-[#2C2723] hover:bg-white hover:scale-105 active:scale-95 border border-[#E8E1D5] backdrop-blur-md transition-all duration-300 ease-in-out cursor-pointer sm:absolute sm:top-6 sm:right-6"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="clear-both mb-5 sm:mb-6 sm:pr-12 sm:clear-none">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7A583E]">
                Cas n°{zoomedScreenshot.project.number} • {zoomedScreenshot.project.title}
              </span>
              <h3 className="text-2xl font-extrabold text-[#2D241E] mt-1">
                {zoomedScreenshot.screenshot.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#635345] mt-1">
                {zoomedScreenshot.screenshot.subtitle}
              </p>
            </div>

            {/* View Switcher inside modal */}
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 mb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 sm:mb-4">
              {zoomedScreenshot.project.screenshots.map((sc, idx) => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() =>
                    setZoomedScreenshot({
                      project: zoomedScreenshot.project,
                      screenshot: sc,
                    })
                  }
                  className={`shrink-0 min-h-11 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 ease-in-out cursor-pointer ${
                    zoomedScreenshot.screenshot.id === sc.id
                      ? "bg-[#2D241E] text-white border-[#2D241E] shadow-xs scale-[1.02]"
                      : "bg-white/90 text-[#4A3F35] border-[#E8DFD3] hover:bg-white hover:border-[#D5C8B8]"
                  }`}
                >
                  Vue {idx + 1}
                </button>
              ))}
            </div>

            {/* Fullscreen Direct Visual Canvas */}
            <div className="relative mb-5 flex min-h-[240px] items-center justify-center overflow-auto rounded-xl border border-[#DED4C8] bg-[#EDE7DE] p-2.5 sm:mb-6 sm:min-h-[500px] sm:rounded-2xl sm:p-6">
              {!loadedImages[zoomedScreenshot.screenshot.id] &&
                !imgErrors[zoomedScreenshot.screenshot.id] && (
                  <div
                    className="absolute inset-0 z-10 grid place-items-center bg-[#F2EDE6]"
                    role="status"
                    aria-label="Chargement de l’image"
                  >
                    <div className="relative h-12 w-12">
                      <span className="absolute inset-0 rounded-full border border-[#D8CABA]" />
                      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#7A583E]" />
                      <span className="absolute inset-[18px] rounded-full bg-[#A87C51]" />
                    </div>
                  </div>
                )}
              {!imgErrors[zoomedScreenshot.screenshot.id] ? (
                <img
                  key={zoomedScreenshot.screenshot.id}
                  src={zoomedScreenshot.screenshot.imageUrl}
                  alt={zoomedScreenshot.screenshot.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                  className={`w-full max-h-[72vh] object-contain rounded-xl shadow-[0_20px_45px_rgba(63,49,37,0.16)] transition-opacity duration-500 ${loadedImages[zoomedScreenshot.screenshot.id] ? "opacity-100" : "opacity-0"}`}
                  onLoad={() =>
                    setLoadedImages((prev) => ({ ...prev, [zoomedScreenshot.screenshot.id]: true }))
                  }
                  onError={() => {
                    setImgErrors((prev) => ({ ...prev, [zoomedScreenshot.screenshot.id]: true }));
                  }}
                />
              ) : (
                <div className="w-full h-full min-h-[240px] sm:min-h-[460px] flex items-center justify-center">
                  <ProjectScreenMockup
                    screenshotId={zoomedScreenshot.screenshot.id}
                    isZoomed={true}
                  />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => selectAdjacentView(-1, true)}
                aria-label="Photo précédente"
                className="absolute left-2.5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 rounded-full border-[#BFAF9E] bg-white/90 backdrop-blur-md text-[#2D241E] shadow-lg hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-[#7A583E] sm:left-5 sm:inline-flex"
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => selectAdjacentView(1, true)}
                aria-label="Photo suivante"
                className="absolute right-2.5 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 rounded-full border-[#BFAF9E] bg-white/90 backdrop-blur-md text-[#2D241E] shadow-lg hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out focus-visible:ring-2 focus-visible:ring-[#7A583E] sm:right-5 sm:inline-flex"
              >
                <ChevronRight />
              </Button>
            </div>

            <div
              className="mb-5 grid grid-cols-2 gap-2 sm:hidden"
              aria-label="Navigation de l’image agrandie"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => selectAdjacentView(-1, true)}
                className="h-11 gap-2 rounded-xl border-[#BFAF9E] bg-white text-xs font-bold text-[#2D241E] hover:bg-[#F3EDE4] active:bg-[#E8DED2] focus-visible:ring-2 focus-visible:ring-[#7A583E]"
              >
                <ChevronLeft className="h-4 w-4" /> Précédente
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => selectAdjacentView(1, true)}
                className="h-11 gap-2 rounded-xl border-[#BFAF9E] bg-white text-xs font-bold text-[#2D241E] hover:bg-[#F3EDE4] active:bg-[#E8DED2] focus-visible:ring-2 focus-visible:ring-[#7A583E]"
              >
                Suivante <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Email template specific display */}
            {zoomedScreenshot.project.emailTemplate &&
              zoomedScreenshot.screenshot.id === "es-2" && (
                <div className="p-4 rounded-xl bg-white/90 backdrop-blur-md border border-[#E8E1D5] mb-6">
                  <h5 className="text-xs font-bold text-[#7A583E] uppercase mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Précisions méthodologiques sur la rédaction SAV :
                  </h5>
                  <p className="text-xs text-[#5C4D3E] leading-relaxed">
                    « Chaque message de mécontentement est désamorcé dès le premier paragraphe en
                    validant l'émotion du client sans se justifier excessivement. Les démarches
                    concrètes sont annoncées clairement avec un délai précis (48h max). Résultat :
                    le client repart apaisé et l'image de marque du formateur est intacte. »
                  </p>
                </div>
              )}

            {/* Bottom modal actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 pt-4 border-t border-[#EAE3D8]">
              <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const planName = zoomedScreenshot.project.title;
                    setZoomedScreenshot(null);
                    onOpenBooking?.(planName);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#2D241E] text-white text-xs font-semibold hover:bg-[#3E3228] transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
                >
                  Mettre en place ce suivi chez moi
                </button>
                <button
                  type="button"
                  onClick={() => setZoomedScreenshot(null)}
                  className="px-4 py-2.5 rounded-full bg-white border border-[#E8E1D5] text-xs font-semibold text-[#5C4D3E] hover:bg-[#F5EFE6] transition-colors cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
