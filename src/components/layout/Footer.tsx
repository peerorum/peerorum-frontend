import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Mail } from "lucide-react";
import Logo from "../ui/Logo";
import LegalTermsModal from "./LegalTermsModal";
import { LEGAL_TERMS } from "../../data/legalTerms";

function InstagramIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

const SERVICE_LINKS = [
  { label: "스펙 비교", href: "/compare" },
  { label: "서비스 소개", href: "/#service-intro" },
  { label: "이용 방법", href: "/#how-to-use" },
  { label: "고객지원", href: "/#support" },
];
const LEGAL_LINKS = [
  "개인정보처리방침",
  "이용약관",
  "스펙 인증 운영정책",
  "익명 정보 제공 및 활용 동의",
];

export default function Footer() {
  const [activeTerm, setActiveTerm] = useState<string | null>(null);

  return (
    <footer className="bg-ink-900 px-6 pt-16 text-gray-400">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 pb-14 sm:grid-cols-2 md:grid-cols-3">
          <div className="md:col-span-1">
            <Logo variant="white" className="h-6" />
            <p className="mt-4 text-[13px] leading-relaxed">
              대학생 스펙 비교 및 성장 플랫폼을 함께 비교하고 함께 성장합니다.
            </p>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-white">서비스</h4>
            <ul className="mt-4 flex flex-col gap-3">
              {SERVICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} className="text-[13px] hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-white">연락처</h4>
            <ul className="mt-4 flex flex-col gap-3 text-[13px]">
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" />
                <a href="mailto:contact@peeroreum.com">
                  peeroreum1001@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <InstagramIcon />
                <a
                  href="https://www.instagram.com/peer_oreum"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  @peer_oreum
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  평일 10:00 - 18:00
                  <br />
                  (주말 및 공휴일 휴무)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 border-t border-ink-700 py-6 text-[12.5px] sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-4">
            {LEGAL_LINKS.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => setActiveTerm(link)}
                className="hover:text-white"
              >
                {link}
              </button>
            ))}
            <span>© 2026 Peer Oreum. All rights reserved.</span>
          </div>
        </div>
      </div>

      <LegalTermsModal
        term={activeTerm ? LEGAL_TERMS[activeTerm] : null}
        onClose={() => setActiveTerm(null)}
      />
    </footer>
  );
}
