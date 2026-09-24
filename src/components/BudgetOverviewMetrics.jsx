import React from "react";

export default function BudgetOverviewMetrics({
                                                  income,
                                                  currency,
                                                  totalInCzk,
                                                  percentages,
                                                  budgetItems = { investments: [], mandatory: [], pocket: [] },
                                              }) {
    const formatMoney = (val) => new Intl.NumberFormat("cs-CZ").format(Math.round(val));
    const currencySymbol = currency === "CZK" ? "Kč" : currency === "EUR" ? "€" : "$";

    // 1. Teoretické stropy / alokace z procent
    const allocatedInvestments = (totalInCzk * percentages.investments) / 100;
    const allocatedMandatory = (totalInCzk * percentages.mandatory) / 100;
    const allocatedPocket = (totalInCzk * percentages.pocket) / 100;

    // 2. Skutečné součty položek zadaných uživatelem (žádné statické hodnoty!)
    const actualInvestmentsTotal = budgetItems.investments.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const actualMandatoryTotal = budgetItems.mandatory.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const actualPocketTotal = budgetItems.pocket.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    // 3. Zaškrtnuté (již zaplacené / odeslané) položky
    const paidInvestments = budgetItems.investments
        .filter((i) => i.isPaid)
        .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const paidMandatory = budgetItems.mandatory
        .filter((i) => i.isPaid)
        .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    const paidPocket = budgetItems.pocket
        .filter((i) => i.isPaid)
        .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

    // 4. Zbývající částky k úhradě / odeslání
    // - Mandatorní: kolik ze zadaných položek ještě není zaškrtnuto
    const remainingMandatory = actualMandatoryTotal - paidMandatory;

    // - Investice: cíl dle procent mínus to, co už bylo odesláno (nebo zadané položky mínus odeslané, pokud cíl překračují)
    const targetInvestments = Math.max(allocatedInvestments, actualInvestmentsTotal);
    const remainingInvestments = Math.max(0, targetInvestments - paidInvestments);

    // - Kapesné: alokovaný limit z procent mínus celkově zadané výdaje na kapesné
    const remainingPocket = Math.max(0, allocatedPocket - actualPocketTotal);

    // 5. Variance mandatorních výdajů
    const mandatoryDiff = allocatedMandatory - actualMandatoryTotal;
    const weeklyPocket = Math.round(allocatedPocket / 4.33);

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* 4 HLAVNÍ METRIKY VEDLE SEBE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Celkový příjem */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-slate-500">Celkový příjem</span>
                        <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400 text-xs">👛</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900">{formatMoney(totalInCzk)} Kč</div>
                        {currency !== "CZK" && (
                            <span className="text-xs text-slate-400 mt-0.5 block">
                {formatMoney(income)} {currencySymbol} (~{formatMoney(totalInCzk)} Kč)
              </span>
                        )}
                    </div>
                </div>

                {/* Celkem investováno (součet položek v investicích) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-slate-500">Celková Investice</span>
                        <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500 text-xs">📈</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-emerald-600">
                            {formatMoney(actualInvestmentsTotal)} Kč
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
              cíl {percentages.investments} % ({formatMoney(allocatedInvestments)} Kč)
            </span>
                    </div>
                </div>

                {/* Mandatorní výdaje (zadané vs. alokovaný strop) */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-slate-500">Mandatorní výdaje</span>
                        <span className="p-1.5 bg-rose-50 rounded-lg text-rose-500 text-xs">🧾</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-slate-900">
                            {formatMoney(actualMandatoryTotal)} Kč{" "}
                            <span className="text-sm font-normal text-slate-400">/ {formatMoney(allocatedMandatory)} Kč</span>
                        </div>
                        <div className="mt-2">
              <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  mandatoryDiff >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              }`}>
                {mandatoryDiff >= 0
                    ? `+${formatMoney(mandatoryDiff)} Kč k dobru`
                    : `${formatMoney(Math.abs(mandatoryDiff))} Kč překročeno`}
              </span>
                        </div>
                    </div>
                </div>

                {/* Kapesné k dispozici */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-slate-500">Kapesné k dispozici</span>
                        <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500 text-xs">✨</span>
                    </div>
                    <div className="mt-3">
                        <div className="text-2xl font-black text-amber-500">{formatMoney(allocatedPocket)} Kč</div>
                        <span className="text-xs text-slate-400 mt-1 block">cca {formatMoney(weeklyPocket)} Kč / týden</span>
                    </div>
                </div>
            </div>

            {/* 3 STATUSOVÉ KARTY ZBYTKŮ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Zbývá zaplatit na mandatorních */}
                <div className="bg-rose-50/20 border border-rose-200 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 border border-rose-100">
                        🧾
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Zbývá zaplatit na mandatorních</div>
                        <div className="text-lg font-bold text-rose-600">{formatMoney(remainingMandatory)} Kč</div>
                    </div>
                </div>

                {/* Zbývá odeslat na investice */}
                <div className="bg-emerald-50/20 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                        📈
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Zbývá odeslat na investice</div>
                        <div className="text-lg font-bold text-emerald-600">{formatMoney(remainingInvestments)} Kč</div>
                    </div>
                </div>

                {/* Zbývající volné kapesné */}
                <div className="bg-amber-50/20 border border-amber-200 rounded-2xl p-4 flex items-center gap-3.5">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-amber-500 border border-amber-100">
                        ✨
                    </div>
                    <div>
                        <div className="text-xs text-slate-500">Zbývající volné kapesné</div>
                        <div className="text-lg font-bold text-amber-600">{formatMoney(remainingPocket)} Kč</div>
                    </div>
                </div>
            </div>
        </div>
    );
}