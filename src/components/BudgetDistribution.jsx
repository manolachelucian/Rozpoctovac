import React from "react";

export default function BudgetDistribution({
                                               totalInCzk,
                                               percentages,
                                               setPercentages,
                                           }) {
    const formatMoney = (val) => new Intl.NumberFormat("cs-CZ").format(Math.round(val));

    const { investments, mandatory, pocket } = percentages;
    const totalPercent = investments + mandatory + pocket;
    const isExact100 = totalPercent === 100;
    const isOver100 = totalPercent > 100;

    // Rozpočet v Kč podle aktuálních procent
    const invAmt = (totalInCzk * investments) / 100;
    const mandAmt = (totalInCzk * mandatory) / 100;
    const pockAmt = (totalInCzk * pocket) / 100;

    // Odchylka od 100 %
    const totalAllocatedAmount = (totalInCzk * totalPercent) / 100;
    const diffAmount = Math.abs(totalAllocatedAmount - totalInCzk);
    const diffPercent = Math.abs(totalPercent - 100);

    // Změna posuvníku
    const handleSliderChange = (field, value) => {
        setPercentages((prev) => ({
            ...prev,
            [field]: Number(value),
        }));
    };

    // Presety pravidel (vždy dávají 100 %)
    const applyPreset = (inv, mand, pock) => {
        setPercentages({ investments: inv, mandatory: mand, pocket: pock });
    };

    // Výpočty pro SVG Donut graf (normalizováno vůči reálnému součtu)
    const safeTotal = totalPercent > 0 ? totalPercent : 1;
    const invNorm = (investments / safeTotal) * 100;
    const mandNorm = (mandatory / safeTotal) * 100;
    const pockNorm = (pocket / safeTotal) * 100;

    const radius = 58;
    const circumference = 2 * Math.PI * radius; // cca 364.4

    const strokeInv = (invNorm / 100) * circumference;
    const strokeMand = (mandNorm / 100) * circumference;
    const strokePock = (pockNorm / 100) * circumference;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* LEVÝ PANEL: NASTAVENÍ A SLIDERY */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-5">
                <div>
                    <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
              ⚙️ Rozdělení rozpočtu
            </span>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Režim výpočtu:</span>
                            <span className="text-slate-800 font-semibold">Procenta</span>
                            <div className="w-8 h-4 bg-slate-200 rounded-full p-0.5 flex items-center cursor-pointer">
                                <div className="w-3 h-3 bg-white rounded-full shadow-xs"></div>
                            </div>
                            <span>Výdaje</span>
                        </div>
                    </div>

                    {/* Validační blok */}
                    {isExact100 ? (
                        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2 mb-4">
                            <span>✓</span> Rozpočet je rozdělen přesně na 100 %.
                        </div>
                    ) : isOver100 ? (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2 mb-4">
                            <span>⚠️</span>
                            <span>Překročeno o <b>{formatMoney(diffAmount)} Kč</b> ({diffPercent} %) nad 100 % příjmu.</span>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2 mb-4">
                            <span>ℹ️</span>
                            <span>Nerozděleno zbývá <b>{formatMoney(diffAmount)} Kč</b> ({diffPercent} %) do 100 % příjmu.</span>
                        </div>
                    )}

                    {/* Posuvníky */}
                    <div className="flex flex-col gap-4 text-xs font-semibold text-slate-700">
                        {/* Investice */}
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <span className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Investice
                                </span>
                                <span className="font-bold text-slate-900">{investments} %</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={investments}
                                onChange={(e) => handleSliderChange("investments", e.target.value)}
                                style={{
                                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${investments}%, #e2e8f0 ${investments}%, #e2e8f0 100%)`
                                }}
                                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>

                        {/* Mandatorní výdaje */}
                        <div>
                            <div className="flex justify-between mb-1.5">
                                <span className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Mandatorní výdaje
                                </span>
                                <span className="font-bold text-slate-900">{mandatory} %</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={mandatory}
                                onChange={(e) => handleSliderChange("mandatory", e.target.value)}
                                style={{
                                    background: `linear-gradient(to right, #0f172a 0%, #0f172a ${mandatory}%, #e2e8f0 ${mandatory}%, #e2e8f0 100%)`
                                }}
                                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-slate-900"
                            />
                        </div>

                        {/* Kapesné */}
                        <div>
                            <div className="flex justify-between mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Kapesné a volný čas
                </span>
                                <span className="font-bold text-slate-900">{pocket} %</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={pocket}
                                onChange={(e) => handleSliderChange("pocket", e.target.value)}
                                style={{
                                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pocket}%, #e2e8f0 ${pocket}%, #e2e8f0 100%)`
                                }}
                                className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Tlačítka předvoleb */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex gap-2">
                        <button
                            onClick={() => applyPreset(20, 50, 30)}
                            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                                mandatory === 50 && pocket === 30 && investments === 20
                                    ? "bg-slate-900 text-white"
                                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            Pravidlo 50/30/20
                        </button>
                        <button
                            onClick={() => applyPreset(40, 40, 20)}
                            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                                mandatory === 40 && investments === 40 && pocket === 20
                                    ? "bg-slate-900 text-white"
                                    : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                        >
                            Agresivní investor 40/40/20
                        </button>
                    </div>
                    <button
                        onClick={() => applyPreset(20, 50, 30)}
                        className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                    >
                        ↺ Reset do výchozího stavu
                    </button>
                </div>
            </div>

            {/* PRAVÝ PANEL: DONUT GRAF A SOUHRN */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4">
                <span className="font-bold text-slate-800 text-sm">Rozdělení příjmu</span>

                {/* Donut Graf */}
                <div className="flex justify-center items-center py-2">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                            <circle cx="80" cy="80" r={radius} className="stroke-slate-100" strokeWidth="22" fill="none" />
                            {/* Investice */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                className="stroke-emerald-500 transition-all duration-300"
                                strokeWidth="22"
                                strokeDasharray={`${strokeInv} ${circumference}`}
                                strokeDashoffset="0"
                                fill="none"
                            />
                            {/* Mandatorní výdaje */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                className="stroke-rose-500 transition-all duration-300"
                                strokeWidth="22"
                                strokeDasharray={`${strokeMand} ${circumference}`}
                                strokeDashoffset={-strokeInv}
                                fill="none"
                            />
                            {/* Kapesné */}
                            <circle
                                cx="80"
                                cy="80"
                                r={radius}
                                className="stroke-amber-500 transition-all duration-300"
                                strokeWidth="22"
                                strokeDasharray={`${strokePock} ${circumference}`}
                                strokeDashoffset={-(strokeInv + strokeMand)}
                                fill="none"
                            />
                        </svg>

                        <div className="absolute flex flex-col items-center">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Příjem</span>
                            <span className="text-sm font-black text-slate-900">{formatMoney(totalInCzk)} Kč</span>
                        </div>
                    </div>
                </div>

                {/* Legenda */}
                <div className="flex flex-col gap-2 text-xs border-t border-slate-100 pt-3">
                    <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Investice
            </span>
                        <span className="text-slate-400">
              {investments} % <b className="text-slate-900 ml-1.5">{formatMoney(invAmt)} Kč</b>
            </span>
                    </div>

                    <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Mandatorní výdaje
            </span>
                        <span className="text-slate-400">
              {mandatory} % <b className="text-slate-900 ml-1.5">{formatMoney(mandAmt)} Kč</b>
            </span>
                    </div>

                    <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Kapesné a volný čas
            </span>
                        <span className="text-slate-400">
              {pocket} % <b className="text-slate-900 ml-1.5">{formatMoney(pockAmt)} Kč</b>
            </span>
                    </div>
                </div>

                {/* Upozornění pod grafem, pokud není 100 % */}
                {!isExact100 && (
                    <div className={`text-xs px-3 py-2 rounded-xl text-center font-medium ${
                        isOver100 ? "bg-rose-50 border border-rose-200 text-rose-700" : "bg-amber-50 border border-amber-200 text-amber-800"
                    }`}>
                        {isOver100
                            ? `Překročeno o ${formatMoney(diffAmount)} Kč (${diffPercent} %) nad příjem.`
                            : `Zbývá rozdělit ${formatMoney(diffAmount)} Kč (${diffPercent} %) do celkového příjmu.`}
                    </div>
                )}
            </div>
        </div>
    );
}