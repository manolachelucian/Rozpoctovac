import React from "react";

export default function MonthlyIncomeCard({ income, setIncome, currency, setCurrency, totalInCzk }) {
    const CURRENCY_SYMBOLS = {
        CZK: "Kč",
        USD: "$",
        EUR: "€",
    };
    const handleQuickAdjust = (amount) => {
        setIncome((prev) => Math.max(0, prev + amount));
    };

    const formattedCzk = new Intl.NumberFormat("cs-CZ").format(totalInCzk);
    const formattedIncome = new Intl.NumberFormat("cs-CZ").format(income);
    const currencySymbol = CURRENCY_SYMBOLS[currency];

    return (
        <div className="w-full bg-white border border-emerald-100 rounded-2xl p-8 shadow-sm flex flex-col gap-6 bg-gradient-to-br from-emerald-50/70 via-white to-white">
            <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-md font-semibold text-emerald-600 tracking-wider">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg >MĚSÍČNÍ ČISTÝ PŘÍJEM
                </span>

                <div className="relative">
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="appearance-none bg-slate-25 border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-700 font-medium outline-none cursor-pointer hover:bg-slate-100">
                        <option value="CZK">CZK</option>
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                    </select>
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] pointer-events-none">▼</span>
                </div>
            </div>


            <div className="relative flex items-center gap-4">
                <input
                    type="number"
                    placeholder="50000"
                    min="0"
                    value={income === 0 ? "" : income}
                    onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                    className="w-full border-1 border-slate-200 rounded-xl px-4 py-4 text-md text-slate-900 outline-none focus:border-emerald-400 transition-colors "/>
                <span className="text-slate-400 font-medium text-md"> {currencySymbol} </span>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4 pt-1">
                <div className="flex items-center gap-4 text-xs  text-slate-500">
                    <span> Rychlé úpravy: </span>
                    <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300">
                        <button
                            onClick={() => handleQuickAdjust(1000)}
                            className="px-4 py-2 text-emerald-600 font-semibold hover:bg-emerald-50 active:bg-emerald-100 transition-colors cursor-pointer">
                            + 1 000 </button>
                        <button
                            onClick={() => handleQuickAdjust(-1000)}
                            className="px-4 py-2 text-rose-500 font-semibold hover:bg-rose-50 active:bg-rose-100 transition-colors hover:rounded-lg cursor-pointer"
                        > — </button>
                    </div>


                    <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300 ">
                        <button
                            onClick={() => handleQuickAdjust(5000)}
                            className="px-4 py-2 text-emerald-600 font-semibold hover:bg-emerald-50 active:bg-emerald-100 transition-colors cursor-pointer"
                        > + 5 000 </button>

                        <button
                            onClick={() => handleQuickAdjust(-5000)}
                            className="px-4 py-2 text-rose-500 font-semibold hover:bg-rose-50 active:bg-rose-100 transition-colors hover:rounded-lg cursor-pointer"
                        > — </button>
                    </div>


                    <div className="inline-flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-slate-300">
                        <button
                            onClick={() => handleQuickAdjust(10000)}
                            className="px-4 py-2 text-emerald-600 font-semibold hover:bg-emerald-50 active:bg-emerald-100 transition-colors cursor-pointer"
                        > + 10 000 </button>
                        <button
                            onClick={() => handleQuickAdjust(-10000)}
                            className="px-4 py-2 text-rose-500 font-semibold hover:bg-rose-50 active:bg-rose-100 transition-colors hover:rounded-lg cursor-pointer"
                        > — </button>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                        Celkem k rozdělení
                    </span>
                    <span className="text-2xl font-black text-slate-900">
                        {formattedCzk} Kč
                    </span>
                    {currency !== "CZK" && (
                        <span className="text-xs text-slate-400 block mt-0.5">
                            {currencySymbol}{formattedIncome} (~{formattedCzk} Kč)
                        </span>
                    )}
                </div>

            </div>
        </div>
    );
}