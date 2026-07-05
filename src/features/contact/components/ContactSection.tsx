"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import ContactVisual3D from "@/features/contact/components/ContactVisual3D";

const contactEmail = "devjenny19@gmail.com";
const githubLabel = "github.com/dabin9";
const githubUrl = "https://github.com/dabin9";

const contactGroup: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08
    }
  }
};

const contactText: Variants = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(6px)"
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.68,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

export default function ContactSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="contact"
      className="scroll-mt-24"
      style={{
        background:
          "linear-gradient(180deg,rgba(250, 250, 246, 1) 0%, rgba(243, 247, 251, 1) 50%, rgba(243, 247, 251, 1) 100%)"
      }}
    >
      <div className="wrap py-20 md:py-28">
        <motion.div
          data-no-gsap
          initial={reduce ? false : "hidden"}
          whileInView={reduce ? undefined : "show"}
          viewport={{ once: true, amount: 0.32, margin: "-80px" }}
          variants={contactGroup}
          className="mx-auto max-w-[1040px]"
        >
          <div className="grid gap-8 md:grid-cols-[1.25fr_0.75fr] md:items-center">
            <div>
              <motion.h2
                variants={contactText}
                className="max-w-[12ch] font-display text-[34px] font-semibold leading-[1.16] text-[#25292d] md:text-[52px]"
              >
                같이 일할 준비가 되어 있습니다.
              </motion.h2>
              <motion.p
                variants={contactText}
                className="mt-7 max-w-[66ch] text-[15px] leading-8 text-[#53606b] md:text-[17px]"
              >
                프론트엔드/UI 개발 포지션 관련 문의는 이메일로 연락 주세요.
                <br className="hidden sm:block" />
                운영 대시보드와 CMS의 데이터 흐름을 꼼꼼히 설계하고, 오래 유지되는 UI 구조를 만드는 3년차 프론트엔드 개발자 박다빈입니다.
              </motion.p>
            </div>

            <motion.div variants={contactText}>
              <ContactVisual3D />
            </motion.div>
          </div>

          <motion.dl
            variants={contactGroup}
            className="mt-9 grid gap-6 md:grid-cols-2"
          >
            <ContactItem
              label="Email"
              value={contactEmail}
              href={`mailto:${contactEmail}`}
            />
            <ContactItem
              label="GitHub"
              value={githubLabel}
              href={githubUrl}
              external
            />
          </motion.dl>
        </motion.div>
      </div>
    </section>
  );
}

function ContactItem({
  label,
  value,
  href,
  external = false
}: {
  label: string;
  value: string;
  href: string;
  external?: boolean;
}) {
  return (
    <motion.div variants={contactText} className="min-w-0">
      <dt className="text-[13px] font-medium text-[#66717c]">{label}</dt>
      <dd className="mt-1 break-all">
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          data-cursor="link"
          className="group inline-flex items-center gap-2 text-[17px] font-semibold leading-7 text-[#25292d] underline-offset-4 hover:underline md:text-[18px]"
        >
          {value}
        </a>
      </dd>
    </motion.div>
  );
}
