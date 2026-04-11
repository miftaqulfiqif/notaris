
export const Footer = () => {
    return (
        <div className="px-8 py-3 text-[15px] bg-secondary sticky bottom-0 text-white border-t border-gray-100 flex items-center gap-5 mt-auto">
            <span>© {new Date().getFullYear()}</span>
            <a href="#" className="hover:text-white/90 flex items-center gap-1">
                CLOUD NUSANTARA AURA
                <span className="">↗</span>
            </a>
        </div>
    );
};
