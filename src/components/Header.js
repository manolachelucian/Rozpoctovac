import React from 'react';

function Header()
{
    return(
        <header className="w-full bg-white/70 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-40">
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Titulek a podtitulek */}
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></span>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            Rozpočtovač
                        </h1>
                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/60">CZK</span>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5 sm:pl-5">
                        Automatické rozdělení peněžního toku podle vašich pravidel
                    </p>
                </div>

                {/* Pravý stavový odznak */}
                <div
                    className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-medium text-slate-600">Aktivní rozpočet</span>
                </div>
            </div>
        </header>
    );
}

export default Header;