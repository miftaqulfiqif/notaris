'use client';

import Link from 'next/link';
import { File, Mail, Phone } from 'lucide-react';

const footerColumns = [
    {
        title: 'Solusi',
        links: [
            { label: 'Kenapa Notarix', href: '/#solusi' },
            { label: 'Fitur', href: '/#fitur' },
        ],
    },
    {
        title: 'Customer',
        links: [
            { label: 'Support', href: '#support' },
            { label: 'Ajukan Demo', href: '/#demo' },
        ],
    },
    {
        title: 'Resources',
        links: [
            { label: 'Harga', href: '/harga' },
            { label: 'Hubungi sales', href: '/#kontak' },
        ],
    },
];

function SocialIcon({ d, label }: { d: string; label: string }) {
    return (
        <a
            href="#"
            aria-label={label}
            className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
            <svg className="h-3.5 w-3.5 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                <path d={d} />
            </svg>
        </a>
    );
}

export function LandingFooter() {
    return (
        <footer id="kontak" className="mt-4 bg-[#625646] px-4 py-3 text-white/80">
            <div className="mx-auto max-w-[1240px] border-b border-[#86745C] px-2 py-8 sm:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 text-white mb-4">
                            <File className="h-5 w-5" />
                            <span className="text-sm font-semibold tracking-wide">Notarix<sup className="text-[7px] ml-0.5">®</sup></span>
                        </div>
                        <div className="space-y-3 text-base font-medium text-white">
                            <p className="flex items-center gap-2">
                                <Mail className="h-5 w-5 shrink-0 stroke-[1.8]" />
                                gandaranetwork@gmail.com
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="h-5 w-5 shrink-0 stroke-[1.8]" />
                                +62 821 5089 5374
                            </p>
                        </div>

                        <div className="flex gap-3 mt-7">
                            <SocialIcon
                                label="LinkedIn"
                                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
                            />
                            <SocialIcon
                                label="Twitter"
                                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                            />
                            <SocialIcon
                                label="Instagram"
                                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"
                            />
                        </div>
                    </div>

                    {footerColumns.map((col) => (
                        <div key={col.title}>
                            <h4 className="text-xl font-semibold text-white mb-4">{col.title}</h4>
                            <ul className="space-y-4">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-base font-medium text-white transition-colors hover:text-white/75"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </footer>
    );
}
