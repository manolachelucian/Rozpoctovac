import React from 'react';

function Footer() {
    return (
        <footer className="w-full mt-12 border-t border-slate-200/80 bg-white/60 backdrop-blur-xs py-8">
            <div
                className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">

                {/* Vlevo: Branding + Copyright */}
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="font-semibold text-slate-700">Rozpočtovač</span>
                    <span className="text-slate-300">|</span>
                    <span>Copyright &copy; {new Date().getFullYear()} Lucian Manolache</span>
                </div>

                {/* Uprostřed: Informace o datech */}
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <svg className="w-3.5 h-3.5 text-emerald-500/80" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    <span>Data se ukládají lokálně ve vašem prohlížeči</span>
                </div>

                {/* Vpravo: Odkazy / Měna info */}
                <div className="flex items-center gap-4 text-slate-400">
                    <span className="hover:text-slate-600 transition-colors cursor-default">Osobní finance CZK</span>
                    <span className="text-slate-300">·</span>
                    <span  className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium text-[10px]"> v1.0.0</span>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
