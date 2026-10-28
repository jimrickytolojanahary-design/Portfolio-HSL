import React, { useState, useId } from "react";
import { portfolioProfile, coreValues } from "../../data/portfolioData";
import {
  Heart,
  CheckCircle2,
  Zap,
  Sparkles,
  Quote,
  Users,
  Clock,
  ShieldCheck,
  Compass,
  Palette,
  RotateCcw,
} from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

// Nuances HSL prédéfinies harmonieuses et uniformes
const HSL_PRESETS = [
  { id: "ambre", label: "Ambre Signature", h: 26, s: 74, description: "Chaleur & authenticité" },
  { id: "terracotta", label: "Terracotta", h: 16, s: 76, description: "Énergie humaine" },
  { id: "miel", label: "Miel Doré", h: 38, s: 78, description: "Clarté & rigueur" },
  { id: "rose", label: "Bois de Rose", h: 4, s: 68, description: "Douceur feutrée" },
];

export const AboutSection: React.FC = () => {
  // Teinte HSL de base (par défaut 26: ambre terracotta chaud signature)
  const [hue, setHue] = useState<number>(26);
  const [saturation, setSaturation] = useState<number>(74);
  const [showHslTuner, setShowHslTuner] = useState<boolean>(false);
  const sliderId = useId();

  // Reset aux valeurs de référence de la charte
  const handleResetHsl = () => {
    setHue(26);
    setSaturation(74);
  };

  // Variables de styles HSL uniformes appliquées à tous les éléments de la section
  const sectionHslStyles: React.CSSProperties & Record<string, string | number> = {
    "--about-h": hue,
    "--about-s": `${saturation}%`,
  };

  return (
    <section
      id="a-propos"
      style={sectionHslStyles}
      className="relative py-14 sm:py-20 md:py-28 bg-gradient-to-b from-[#FDFBF7] via-[#FFFDF9] to-[#F7F3EB]/70 border-t border-[#EAE3D8] scroll-mt-20 overflow-hidden"
    >
      {/* Halos lumineux d'arrière-plan harmonisés avec la couleur HSL uniforme */}
      <div
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle, hsla(var(--about-h), var(--about-s), 65%, 0.16) 0%, hsla(var(--about-h), var(--about-s), 75%, 0.08) 50%, transparent 75%)`,
        }}
        className="pointer-events-none absolute top-6 left-0 w-[520px] h-[420px] rounded-full blur-[90px] opacity-90 transition-all duration-300"
      />
      <div
        aria-hidden="true"
        style={{
          background: `radial-gradient(circle, hsla(var(--about-h), var(--about-s), 60%, 0.14) 0%, hsla(var(--about-h), var(--about-s), 70%, 0.06) 50%, transparent 75%)`,
        }}
        className="pointer-events-none absolute bottom-0 right-0 w-[560px] h-[460px] rounded-full blur-[100px] opacity-85 transition-all duration-300"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Barre d'harmonie HSL uniforme (compacte et élégante) */}
        <div className="mb-8 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-[hsla(var(--about-h),35%,88%,0.9)] shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors duration-200">
          <div className="flex items-center gap-2.5">
            <div
              style={{
                background: `linear-gradient(135deg, hsl(var(--about-h), var(--about-s), 52%), hsl(var(--about-h), var(--about-s), 42%))`,
                boxShadow: `0 4px 12px hsla(var(--about-h), var(--about-s), 50%, 0.3)`,
              }}
              className="w-7 h-7 rounded-lg text-white flex items-center justify-center shrink-0 transition-all duration-200"
            >
              <Palette className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2D241E]">Harmonie chromatique HSL</span>
                <span
                  style={{
                    backgroundColor: `hsla(var(--about-h), var(--about-s), 93%, 0.9)`,
                    borderColor: `hsla(var(--about-h), var(--about-s), 80%, 0.9)`,
                    color: `hsl(var(--about-h), var(--about-s), 32%)`,
                  }}
                  className="font-mono text-[10px] px-2 py-0.5 rounded-full border font-semibold transition-colors duration-200"
                >
                  hsl({hue}, {saturation}%, 50%)
                </span>
              </div>
              <p className="text-[11px] text-[#7A6858]">
                Palette uniforme appliquée sur l’ensemble de la section
              </p>
            </div>
          </div>

          {/* Sélecteur rapide de nuances HSL prédéfinies */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {HSL_PRESETS.map((preset) => {
              const isSelected = hue === preset.h && saturation === preset.s;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setHue(preset.h);
                    setSaturation(preset.s);
                  }}
                  style={{
                    backgroundColor: isSelected
                      ? `hsla(var(--about-h), var(--about-s), 94%, 1)`
                      : "#ffffff",
                    borderColor: isSelected
                      ? `hsl(var(--about-h), var(--about-s), 50%)`
                      : "#EAE3D8",
                    color: isSelected ? `hsl(var(--about-h), var(--about-s), 28%)` : "#5A4A3D",
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all duration-150 flex items-center gap-1.5 hover:shadow-2xs ${
                    isSelected ? "shadow-2xs scale-[1.02]" : "hover:border-[#D0C2B4]"
                  }`}
                  title={preset.description}
                >
                  <span
                    style={{
                      backgroundColor: `hsl(${preset.h}, ${preset.s}%, 50%)`,
                    }}
                    className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                  />
                  <span>{preset.label}</span>
                </button>
              );
            })}

            {/* Bouton réglage fin / slider */}
            <button
              type="button"
              onClick={() => setShowHslTuner((prev) => !prev)}
              style={{
                backgroundColor: showHslTuner
                  ? `hsla(var(--about-h), var(--about-s), 92%, 1)`
                  : "transparent",
                borderColor: showHslTuner ? `hsl(var(--about-h), var(--about-s), 60%)` : "#EAE3D8",
                color: showHslTuner ? `hsl(var(--about-h), var(--about-s), 30%)` : "#7A6858",
              }}
              className="px-2.5 py-1 rounded-xl text-xs font-medium border hover:bg-neutral-50 transition-colors"
              title="Ajuster la teinte HSL en direct"
            >
              {showHslTuner ? "Masquer slider" : "Ajuster HSL"}
            </button>
          </div>
        </div>

        {/* Volet déroulant du réglage fin HSL */}
        {showHslTuner && (
          <div className="mb-8 p-4 rounded-2xl bg-white/95 border border-[hsla(var(--about-h),35%,85%,0.9)] shadow-xs animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center text-xs font-medium text-[#4D3F33] mb-1.5">
                  <label htmlFor={`${sliderId}-hue`}>Teinte (Hue H) : {hue}°</label>
                  <span className="font-mono text-[11px] text-[#7A6858]">{hue}°</span>
                </div>
                <input
                  id={`${sliderId}-hue`}
                  type="range"
                  min="0"
                  max="360"
                  value={hue}
                  onChange={(e) => setHue(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--about-h),var(--about-s),50%)] cursor-pointer h-2 bg-neutral-200 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-medium text-[#4D3F33] mb-1.5">
                  <label htmlFor={`${sliderId}-saturation`}>Saturation (S) : {saturation}%</label>
                  <span className="font-mono text-[11px] text-[#7A6858]">{saturation}%</span>
                </div>
                <input
                  id={`${sliderId}-saturation`}
                  type="range"
                  min="30"
                  max="95"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-[hsl(var(--about-h),var(--about-s),50%)] cursor-pointer h-2 bg-neutral-200 rounded-lg appearance-none"
                />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#EAE3D8] flex items-center justify-between text-[11px]">
              <span className="text-[#7A6858]">
                Déplacez les curseurs pour voir l'ensemble de la section s'harmoniser
                instantanément.
              </span>
              <button
                type="button"
                onClick={handleResetHsl}
                className="inline-flex items-center gap-1 font-semibold text-[#8C5D3E] hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rétablir Ambre Signature (26°)</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-start">
          {/* Colonne Biographie (Gauche) */}
          <ScrollReveal className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Badge Titre Coloré HSL Uniforme */}
            <div
              style={{
                background: `linear-gradient(135deg, hsla(var(--about-h), var(--about-s), 96%, 0.95), hsla(var(--about-h), var(--about-s), 91%, 0.85))`,
                borderColor: `hsla(var(--about-h), var(--about-s), 80%, 0.9)`,
                color: `hsl(var(--about-h), var(--about-s), 30%)`,
              }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider shadow-2xs transition-colors duration-200"
            >
              <Sparkles
                style={{ color: `hsl(var(--about-h), var(--about-s), 48%)` }}
                className="w-3.5 h-3.5 transition-colors duration-200"
              />
              <span>À propos de moi</span>
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#2D241E] tracking-tight leading-[1.15]">
                {portfolioProfile.name}
              </h2>
              <p
                style={{ color: `hsl(var(--about-h), var(--about-s), 40%)` }}
                className="mt-2 text-sm sm:text-base font-semibold flex items-center gap-2 transition-colors duration-200"
              >
                <span
                  style={{ backgroundColor: `hsl(var(--about-h), var(--about-s), 50%)` }}
                  className="w-2 h-2 rounded-full animate-pulse transition-colors duration-200"
                />
                <span>
                  {portfolioProfile.title} • {portfolioProfile.subtitle}
                </span>
              </p>
            </div>

            {/* Paragraphes de bio */}
            <div className="space-y-4">
              <p className="text-base sm:text-lg text-[#554537] leading-relaxed font-normal">
                {portfolioProfile.about.bioParagraph1}
              </p>

              <p className="text-sm sm:text-base text-[#615042] leading-relaxed">
                {portfolioProfile.about.bioParagraph2}
              </p>

              <p className="text-sm sm:text-base text-[#615042] leading-relaxed">
                {portfolioProfile.about.bioParagraph3}
              </p>
            </div>

            {/* 3 Repères concrets / Preuves de confiance en harmonie HSL UNIFORME */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                {
                  icon: Users,
                  value: "5 coachs",
                  label: "Gérés en agence",
                },
                {
                  icon: Clock,
                  value: "< 24h",
                  label: "Réponses soignées",
                },
                {
                  icon: ShieldCheck,
                  value: "100% Ordre",
                  label: "Rigueur & suivi",
                },
              ].map((metric, i) => {
                const IconComponent = metric.icon;
                return (
                  <div
                    key={i}
                    style={{
                      background: `linear-gradient(135deg, #ffffff 0%, hsla(var(--about-h), var(--about-s), 98%, 0.8) 100%)`,
                      borderColor: `hsla(var(--about-h), 35%, 88%, 0.9)`,
                    }}
                    className="p-3.5 rounded-2xl border shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-3 group"
                  >
                    <div
                      style={{
                        background: `linear-gradient(135deg, hsla(var(--about-h), var(--about-s), 93%, 1), hsla(var(--about-h), var(--about-s), 86%, 1))`,
                        borderColor: `hsla(var(--about-h), var(--about-s), 80%, 0.9)`,
                        color: `hsl(var(--about-h), var(--about-s), 40%)`,
                      }}
                      className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105"
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-extrabold text-[#2D241E]">
                        {metric.value}
                      </span>
                      <span className="block text-[11px] text-[#7A6858] leading-tight">
                        {metric.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bloc Mantra avec mise en valeur HSL uniforme */}
            <div
              style={{
                background: `linear-gradient(135deg, hsla(var(--about-h), var(--about-s), 97%, 0.9) 0%, #FFFDF9 50%, hsla(var(--about-h), var(--about-s), 96%, 0.7) 100%)`,
                borderColor: `hsla(var(--about-h), var(--about-s), 82%, 0.9)`,
                borderLeftColor: `hsl(var(--about-h), var(--about-s), 48%)`,
                boxShadow: `0 8px 24px -8px hsla(var(--about-h), var(--about-s), 45%, 0.14)`,
              }}
              className="relative p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-l-4 hover:shadow-md transition-all duration-200"
            >
              <Quote
                style={{ color: `hsla(var(--about-h), var(--about-s), 48%, 0.35)` }}
                className="w-7 h-7 mb-2.5 transition-colors duration-200"
              />
              <p className="italic text-sm sm:text-base text-[#473A2F] font-medium leading-relaxed">
                {portfolioProfile.about.mantra}
              </p>
            </div>

            {/* Bloc Note Personnelle avec touche HSL conviviale */}
            <div
              style={{
                background: `linear-gradient(135deg, #ffffff 0%, hsla(var(--about-h), var(--about-s), 98%, 0.85) 100%)`,
                borderColor: `hsla(var(--about-h), 30%, 88%, 0.9)`,
              }}
              className="p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-2xs hover:shadow-md transition-all duration-200 group"
            >
              <div
                style={{
                  background: `linear-gradient(135deg, hsla(var(--about-h), var(--about-s), 93%, 1), hsla(var(--about-h), var(--about-s), 86%, 1))`,
                  borderColor: `hsla(var(--about-h), var(--about-s), 80%, 0.9)`,
                }}
                className="w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 text-xl shadow-2xs select-none transition-transform duration-200 group-hover:scale-105"
              >
                ✈️
              </div>
              <div className="pt-0.5">
                <p className="text-xs sm:text-sm text-[#5C4C3E] leading-relaxed">
                  <strong className="text-[#2D241E] font-bold">Côté perso : </strong>
                  {portfolioProfile.about.personalNote}
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Colonne Valeurs & Finalité (Droite) : "Ce qui guide mon accompagnement" */}
          <ScrollReveal delayMs={120} className="lg:col-span-5 space-y-4 sm:space-y-5">
            {/* En-tête de la colonne avec HSL uniforme */}
            <div className="flex items-center gap-2.5 pb-1">
              <div
                style={{
                  background: `linear-gradient(135deg, hsl(var(--about-h), var(--about-s), 50%), hsl(var(--about-h), var(--about-s), 42%))`,
                  boxShadow: `0 4px 12px hsla(var(--about-h), var(--about-s), 45%, 0.25)`,
                }}
                className="w-6 h-6 rounded-lg text-white flex items-center justify-center shadow-2xs transition-all duration-200"
              >
                <Compass className="w-3.5 h-3.5" />
              </div>
              <h3
                style={{ color: `hsl(var(--about-h), var(--about-s), 30%)` }}
                className="text-xs font-extrabold uppercase tracking-wider transition-colors duration-200"
              >
                Ce qui guide mon accompagnement
              </h3>
            </div>

            {/* Cartes des valeurs : uniformité HSL parfaite (suppression des incohérences rose/vert/jaune) */}
            {coreValues.map((val, idx) => {
              const Icon = idx === 0 ? Heart : idx === 1 ? CheckCircle2 : Zap;
              const badgeLabel =
                idx === 0
                  ? "01 • Chaleur humaine"
                  : idx === 1
                    ? "02 • Précision & Ordre"
                    : "03 • Zéro attente";

              return (
                <div
                  key={val.title}
                  style={{
                    background: `linear-gradient(135deg, #ffffff 0%, hsla(var(--about-h), var(--about-s), 98%, 0.75) 100%)`,
                    borderColor: `hsla(var(--about-h), 35%, 88%, 0.9)`,
                  }}
                  className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl backdrop-blur-sm border transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-1 cursor-default group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3.5">
                      <div
                        style={{
                          background: `linear-gradient(135deg, hsla(var(--about-h), var(--about-s), 93%, 1), hsla(var(--about-h), var(--about-s), 86%, 1))`,
                          borderColor: `hsla(var(--about-h), var(--about-s), 80%, 0.9)`,
                          color: `hsl(var(--about-h), var(--about-s), 40%)`,
                          boxShadow: `0 4px 14px hsla(var(--about-h), var(--about-s), 45%, 0.12)`,
                        }}
                        className="w-11 h-11 rounded-2xl border flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0"
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-extrabold tracking-tight text-[#2D241E]">
                          {val.title}
                        </h4>
                      </div>
                    </div>

                    <span
                      style={{
                        backgroundColor: `hsla(var(--about-h), var(--about-s), 94%, 0.95)`,
                        borderColor: `hsla(var(--about-h), var(--about-s), 82%, 0.9)`,
                        color: `hsl(var(--about-h), var(--about-s), 30%)`,
                      }}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-2xs shrink-0 transition-colors duration-200"
                    >
                      {badgeLabel}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#5A4A3D] leading-relaxed sm:pl-14">
                    {val.description}
                  </p>
                </div>
              );
            })}

            {/* Carte Clé : "La finalité ultime" harmonisée dans un écrin sombre teinté HSL */}
            <div
              style={{
                background: `linear-gradient(135deg, hsl(var(--about-h), 22%, 14%) 0%, hsl(var(--about-h), 25%, 17%) 50%, hsl(var(--about-h), 20%, 11%) 100%)`,
                borderColor: `hsla(var(--about-h), 35%, 32%, 0.8)`,
                boxShadow: `0 20px 45px -12px hsla(var(--about-h), 40%, 15%, 0.4)`,
              }}
              className="relative p-6 sm:p-7 rounded-2xl sm:rounded-3xl text-white border transition-all duration-200 hover:-translate-y-1 mt-6 cursor-default overflow-hidden group"
            >
              {/* Éclat lumineux d'arrière-plan uniforme HSL */}
              <div
                aria-hidden="true"
                style={{
                  background: `radial-gradient(circle, hsla(var(--about-h), var(--about-s), 60%, 0.22) 0%, transparent 70%)`,
                }}
                className="absolute -top-10 -right-10 w-44 h-44 rounded-full blur-2xl pointer-events-none transition-all duration-300"
              />

              <div className="relative z-10">
                <div
                  style={{
                    backgroundColor: `hsla(var(--about-h), var(--about-s), 90%, 0.12)`,
                    borderColor: `hsla(var(--about-h), var(--about-s), 80%, 0.25)`,
                    color: `hsl(var(--about-h), var(--about-s), 82%)`,
                  }}
                  className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wider mb-3 backdrop-blur-md transition-colors duration-200"
                >
                  <Sparkles
                    style={{ color: `hsl(var(--about-h), var(--about-s), 70%)` }}
                    className="w-3 h-3 transition-colors duration-200"
                  />
                  <span>La finalité ultime</span>
                </div>

                <p className="text-xs sm:text-sm text-[#EFE7DE] leading-relaxed font-normal">
                  {portfolioProfile.about.ultimateOutcome}
                </p>

                <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#D0BEAA]">
                  <span className="font-semibold flex items-center gap-1.5">
                    <span
                      style={{ backgroundColor: `hsl(var(--about-h), var(--about-s), 68%)` }}
                      className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                    />
                    Sérénité d'esprit garantie
                  </span>
                  <span
                    style={{ color: `hsl(var(--about-h), var(--about-s), 75%)` }}
                    className="font-medium transition-colors duration-200"
                  >
                    Relation durable & humaine
                  </span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};
