import React, { useState } from "react";

export default function MonthlyActionPlan({
                                              totalInCzk,
                                              percentages,
                                              budgetItems,
                                              setBudgetItems,
                                              onTransferSurplusToInvestments,
                                          }) {
    const formatMoney = (val) => new Intl.NumberFormat("cs-CZ").format(Math.round(val));

    // Alokované stropy podle %
    const allocatedInvestments = (totalInCzk * percentages.investments) / 100;
    const allocatedMandatory = (totalInCzk * percentages.mandatory) / 100;
    const allocatedPocket = (totalInCzk * percentages.pocket) / 100;

    // Stavy pro inline formulář přidání nové položky (v které kategorii je otevřený)
    const [activeFormCategory, setActiveFormCategory] = useState(null);
    const [newItemName, setNewItemName] = useState("");
    const [newItemValue, setNewItemValue] = useState("");
    const [inputType, setInputType] = useState("CZK"); // "CZK" nebo "PERCENT"

    // Součty pro mandatorní výdaje
    const mandatoryTotal = budgetItems.mandatory.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const mandatoryPaid = budgetItems.mandatory
        .filter((i) => i.isPaid)
        .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const mandatoryRemaining = mandatoryTotal - mandatoryPaid;
    const mandatoryVariance = mandatoryTotal - allocatedMandatory;

    // Součty pro investice
    const investmentsTotal = budgetItems.investments.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const investmentsPaid = budgetItems.investments
        .filter((i) => i.isPaid)
        .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const investmentsRemaining = Math.max(0, allocatedInvestments - investmentsPaid);

    // Součty pro kapesné
    const pocketTotal = budgetItems.pocket.reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const pocketPaid = budgetItems.pocket
        .filter((i) => i.isPaid)
        .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    const pocketRemaining = pocketTotal - pocketPaid;

    // 1. Zaškrtnutí zaplaceno
    const togglePaid = (category, id) => {
        setBudgetItems((prev) => ({
            ...prev,
            [category]: prev[category].map((item) =>
                item.id === id ? { ...item, isPaid: !item.isPaid } : item
            ),
        }));
    };

    // 2. Smazání položky
    const handleDeleteItem = (category, id) => {
        setBudgetItems((prev) => ({
            ...prev,
            [category]: prev[category].filter((item) => item.id !== id),
        }));
    };

    // 3. Otevření formuláře pro novou položku
    const handleOpenForm = (category) => {
        setActiveFormCategory(category);
        setNewItemName("");
        setNewItemValue("");
        setInputType("CZK");
    };

    // 4. Uložení nové položky (s podporou Kč i %)
    const handleSaveItem = (category) => {
        if (!newItemName.trim()) return;

        let finalAmount = Number(newItemValue) || 0;
        let displayName = newItemName.trim();

        // Výpočet z procent příslušného balíku
        if (inputType === "PERCENT") {
            const baseBudget =
                category === "investments"
                    ? allocatedInvestments
                    : category === "mandatory"
                        ? allocatedMandatory
                        : allocatedPocket;

            finalAmount = Math.round((baseBudget * finalAmount) / 100);
            displayName = `${displayName} (${newItemValue} % z balíku)`;
        }

        const newItem = {
            id: Date.now(),
            name: displayName,
            amount: finalAmount,
            isPaid: false,
        };

        setBudgetItems((prev) => ({
            ...prev,
            [category]: [...prev[category], newItem],
        }));

        setActiveFormCategory(null);
        setNewItemName("");
        setNewItemValue("");
    };

    return (
        <div className="flex flex-col gap-6 w-full">
            {/* HORNÍ SOUHRNNÁ KARTA: MĚSÍČNÍ PLÁN · DALŠÍ KROKY */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center pb-2">
                    <h2 className="font-bold text-slate-800 text-base">Měsíční plán · Další kroky</h2>
                    <span className="text-xs text-slate-400 font-medium">Akční shrnutí</span>
                </div>

                {/* 1. Trvalý příkaz na investice */}
                <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50/60 rounded-xl gap-3">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600 font-bold text-sm">📈</span>
                        <div>
                            <div className="text-sm font-bold text-slate-800">Trvalý příkaz na investice</div>
                            <div className="text-xs text-slate-400">Nastavte SIPO / trvalý příkaz na začátek měsíce</div>
                        </div>
                    </div>
                    <div className="text-base font-black text-slate-900">{formatMoney(allocatedInvestments)} Kč</div>
                </div>

                {/* 2. Rezerva na mandatorní výdaje */}
                <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50/60 rounded-xl gap-3">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-rose-50 rounded-lg text-rose-500 font-bold text-sm">🧾</span>
                        <div>
                            <div className="text-sm font-bold text-slate-800">Rezerva na mandatorní výdaje</div>
                            <div className="text-xs text-slate-400">Aktuálně zadáno: {formatMoney(mandatoryTotal)} Kč</div>

                            <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    mandatoryVariance <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                }`}>
                  {mandatoryVariance <= 0
                      ? `✓ +${formatMoney(Math.abs(mandatoryVariance))} Kč k dobru (pod rozpočtem)`
                      : `⚠️ +${formatMoney(mandatoryVariance)} Kč nad rozpočet`}
                </span>

                                {mandatoryVariance < 0 && (
                                    <button
                                        onClick={() => onTransferSurplusToInvestments(Math.abs(mandatoryVariance))}
                                        className="border border-slate-300 hover:bg-white text-slate-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-medium transition-colors cursor-pointer"
                                    >
                                        <span>→</span> Převést přebytek ({formatMoney(Math.abs(mandatoryVariance))} Kč) do investic
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-base font-black text-slate-900">{formatMoney(allocatedMandatory)} Kč</div>
                </div>

                {/* 3. Volné kapesné */}
                <div className="flex flex-wrap items-center justify-between p-4 bg-slate-50/60 rounded-xl gap-3">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-amber-50 rounded-lg text-amber-500 font-bold text-sm">✨</span>
                        <div>
                            <div className="text-sm font-bold text-slate-800">Volné kapesné</div>
                            <div className="text-xs text-slate-400">Týdně cca {formatMoney(allocatedPocket / 4.33)} Kč</div>
                        </div>
                    </div>
                    <div className="text-base font-black text-slate-900">{formatMoney(allocatedPocket)} Kč</div>
                </div>
            </div>

            {/* 3 DETAILNÍ KARTY: INVESTICE, MANDATORNÍ, KAPESNÉ */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-start">

                {/* 1. INVESTICE */}
                <div className="bg-white border-2 border-emerald-300 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold text-sm">📈</span>
                            <h3 className="font-bold text-slate-800 text-sm">Investice a budování majetku</h3>
                        </div>
                        <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
              {percentages.investments} %
            </span>
                    </div>

                    <div className="text-xs text-slate-400">Rozdělení investičního balíku</div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Rozpočet (Kč)</span>
                            <span className="font-bold text-slate-800">{formatMoney(allocatedInvestments)}</span>
                        </div>
                        <div className="bg-emerald-50/60 p-2 rounded-xl">
                            <span className="text-[10px] text-emerald-600 block">Zaplaceno</span>
                            <span className="font-bold text-emerald-700">{formatMoney(investmentsPaid)} Kč</span>
                        </div>
                        <div className="bg-amber-50/60 p-2 rounded-xl">
                            <span className="text-[10px] text-amber-600 block">Zbývá doplatit</span>
                            <span className="font-bold text-amber-700">{formatMoney(investmentsRemaining)} Kč</span>
                        </div>
                    </div>

                    {/* Seznam položek s tlačítkem mazání */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        {budgetItems.investments.length === 0 ? (
                            <span className="text-xs text-slate-400 italic text-center py-2">Žádné investiční položky</span>
                        ) : (
                            budgetItems.investments.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs group hover:bg-slate-50 p-1 rounded-lg transition-colors">
                                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                                        <input
                                            type="checkbox"
                                            checked={item.isPaid}
                                            onChange={() => togglePaid("investments", item.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                        />
                                        <span className={item.isPaid ? "line-through text-slate-400" : "font-medium text-slate-700"}>
                      {item.name}
                    </span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{formatMoney(item.amount)} Kč</span>
                                        <button
                                            onClick={() => handleDeleteItem("investments", item.id)}
                                            title="Smazat položku"
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 px-1 font-bold transition-opacity cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Inline formulář pro přidání položky */}
                    {activeFormCategory === "investments" ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5 text-xs">
                            <input
                                type="text"
                                placeholder="Název položky (např. Akcie S&P)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={inputType === "CZK" ? "Částka v Kč" : "Procento %"}
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500 font-medium"
                                />
                                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setInputType("CZK")}
                                        className={`px-2 py-1 font-bold ${inputType === "CZK" ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        Kč
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputType("PERCENT")}
                                        className={`px-2 py-1 font-bold ${inputType === "PERCENT" ? "bg-emerald-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        %
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSaveItem("investments")}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1.5 rounded-lg cursor-pointer"
                                >
                                    Uložit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFormCategory(null)}
                                    className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 rounded-lg cursor-pointer font-medium"
                                >
                                    Zrušit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleOpenForm("investments")}
                            className="mt-1 w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-500 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            + Přidat položku
                        </button>
                    )}
                </div>

                {/* 2. MANDATORNÍ VÝDAJE */}
                <div className="bg-white border-2 border-rose-300 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-rose-500 font-bold text-sm">🧾</span>
                            <h3 className="font-bold text-slate-800 text-sm">Mandatorní výdaje</h3>
                        </div>
                        <span className="text-xs bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-md">
              {percentages.mandatory} %
            </span>
                    </div>

                    <div className="text-xs text-slate-400">Pevné měsíční náklady</div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Rozpočet (Kč)</span>
                            <span className="font-bold text-slate-800">{formatMoney(allocatedMandatory)}</span>
                        </div>
                        <div className="bg-emerald-50/60 p-2 rounded-xl">
                            <span className="text-[10px] text-emerald-600 block">Zaplaceno</span>
                            <span className="font-bold text-emerald-700">{formatMoney(mandatoryPaid)} Kč</span>
                        </div>
                        <div className="bg-amber-50/60 p-2 rounded-xl">
                            <span className="text-[10px] text-amber-600 block">Zbývá doplatit</span>
                            <span className="font-bold text-amber-700">{formatMoney(mandatoryRemaining)} Kč</span>
                        </div>
                    </div>

                    {/* Seznam položek s tlačítkem mazání */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        {budgetItems.mandatory.length === 0 ? (
                            <span className="text-xs text-slate-400 italic text-center py-2">Žádné zadané výdaje</span>
                        ) : (
                            budgetItems.mandatory.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs group hover:bg-slate-50 p-1 rounded-lg transition-colors">
                                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                                        <input
                                            type="checkbox"
                                            checked={item.isPaid}
                                            onChange={() => togglePaid("mandatory", item.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-rose-500 focus:ring-rose-400 cursor-pointer"
                                        />
                                        <span className={item.isPaid ? "line-through text-slate-400" : "font-medium text-slate-700"}>
                      {item.name}
                    </span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{formatMoney(item.amount)} Kč</span>
                                        <button
                                            onClick={() => handleDeleteItem("mandatory", item.id)}
                                            title="Smazat položku"
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 px-1 font-bold transition-opacity cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 text-xs font-semibold">
                        <span className="text-slate-500">Variance (skutečnost vs. alokace)</span>
                        <span className={mandatoryVariance <= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
              {mandatoryVariance <= 0 ? `-${formatMoney(Math.abs(mandatoryVariance))} Kč` : `+${formatMoney(mandatoryVariance)} Kč`}
            </span>
                    </div>

                    {/* Inline formulář pro přidání položky */}
                    {activeFormCategory === "mandatory" ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5 text-xs">
                            <input
                                type="text"
                                placeholder="Název výdaje (např. Nájem)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-400"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={inputType === "CZK" ? "Částka v Kč" : "Procento %"}
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-rose-400 font-medium"
                                />
                                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setInputType("CZK")}
                                        className={`px-2 py-1 font-bold ${inputType === "CZK" ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        Kč
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputType("PERCENT")}
                                        className={`px-2 py-1 font-bold ${inputType === "PERCENT" ? "bg-rose-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        %
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSaveItem("mandatory")}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1.5 rounded-lg cursor-pointer"
                                >
                                    Uložit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFormCategory(null)}
                                    className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 rounded-lg cursor-pointer font-medium"
                                >
                                    Zrušit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleOpenForm("mandatory")}
                            className="mt-1 w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-500 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            + Přidat položku
                        </button>
                    )}
                </div>

                {/* 3. KAPESNÉ A VOLNÝ ČAS */}
                <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-bold text-sm">✨</span>
                            <h3 className="font-bold text-slate-800 text-sm">Kapesné a volný čas</h3>
                        </div>
                        <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md">
              {percentages.pocket} %
            </span>
                    </div>

                    <div className="text-xs text-slate-400">
                        Volně utratitelné prostředky · To odpovídá cca {formatMoney(allocatedPocket / 4.33)} Kč na týden
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Rozpočet (Kč)</span>
                            <span className="font-bold text-slate-800">{formatMoney(allocatedPocket)}</span>
                        </div>
                        <div className="bg-emerald-50/60 p-2 rounded-xl">
                            <span className="text-[10px] text-emerald-600 block">Zaplaceno</span>
                            <span className="font-bold text-emerald-700">{formatMoney(pocketPaid)} Kč</span>
                        </div>
                        <div className="bg-amber-50/60 p-2 rounded-xl">
                            <span className="text-[10px] text-amber-600 block">Zbývá doplatit</span>
                            <span className="font-bold text-amber-700">{formatMoney(pocketRemaining)} Kč</span>
                        </div>
                    </div>

                    {/* Seznam položek s tlačítkem mazání */}
                    <div className="flex flex-col gap-2.5 pt-2">
                        {budgetItems.pocket.length === 0 ? (
                            <span className="text-xs text-slate-400 italic text-center py-2">
                Žádné položky. Částka je k dispozici jako volné kapesné.
              </span>
                        ) : (
                            budgetItems.pocket.map((item) => (
                                <div key={item.id} className="flex justify-between items-center text-xs group hover:bg-slate-50 p-1 rounded-lg transition-colors">
                                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                                        <input
                                            type="checkbox"
                                            checked={item.isPaid}
                                            onChange={() => togglePaid("pocket", item.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                                        />
                                        <span className={item.isPaid ? "line-through text-slate-400" : "font-medium text-slate-700"}>
                      {item.name}
                    </span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900">{formatMoney(item.amount)} Kč</span>
                                        <button
                                            onClick={() => handleDeleteItem("pocket", item.id)}
                                            title="Smazat položku"
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 px-1 font-bold transition-opacity cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Inline formulář pro přidání položky */}
                    {activeFormCategory === "pocket" ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-2.5 text-xs">
                            <input
                                type="text"
                                placeholder="Název položky (např. Restaurace, Káva)"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-400"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder={inputType === "CZK" ? "Částka v Kč" : "Procento %"}
                                    value={newItemValue}
                                    onChange={(e) => setNewItemValue(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-amber-400 font-medium"
                                />
                                <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setInputType("CZK")}
                                        className={`px-2 py-1 font-bold ${inputType === "CZK" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        Kč
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setInputType("PERCENT")}
                                        className={`px-2 py-1 font-bold ${inputType === "PERCENT" ? "bg-amber-500 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                                    >
                                        %
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={() => handleSaveItem("pocket")}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-1.5 rounded-lg cursor-pointer"
                                >
                                    Uložit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFormCategory(null)}
                                    className="px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 rounded-lg cursor-pointer font-medium"
                                >
                                    Zrušit
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => handleOpenForm("pocket")}
                            className="mt-1 w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 rounded-xl text-xs text-slate-500 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            + Přidat položku
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}