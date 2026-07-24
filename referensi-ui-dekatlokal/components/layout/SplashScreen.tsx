"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_DURATION = 8_000;

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const content = document.getElementById("site-content");

    if (root.dataset.showSplash !== "true") {
      const skipTimer = window.setTimeout(() => setIsVisible(false), 0);
      return () => window.clearTimeout(skipTimer);
    }

    root.classList.add("splash-active");
    document.body.classList.add("splash-active");
    content?.setAttribute("inert", "");
    content?.setAttribute("aria-hidden", "true");

    const timer = window.setTimeout(() => setIsVisible(false), SPLASH_DURATION);

    return () => {
      window.clearTimeout(timer);
      root.classList.remove("splash-active");
      document.body.classList.remove("splash-active");
      content?.removeAttribute("inert");
      content?.removeAttribute("aria-hidden");
    };
  }, []);

  const unlockWebsite = () => {
    const content = document.getElementById("site-content");

    document.documentElement.classList.remove("splash-active");
    document.body.classList.remove("splash-active");
    delete document.documentElement.dataset.showSplash;
    content?.removeAttribute("inert");
    content?.removeAttribute("aria-hidden");
  };

  return (
    <AnimatePresence onExitComplete={unlockWebsite}>
      {isVisible && (
        <motion.div
          key="dekatlokal-splash"
          className="splash-screen"
          data-nosnippet=""
          initial={{ y: 0 }}
          exit={{ y: "-105%" }}
          transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
          role="dialog"
          aria-modal="true"
          aria-label="DekatLokal sedang dimuat"
        >
          <motion.div
            className="splash-screen__content"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Image
              className="splash-screen__image"
              src="/image/system/splashscreen-dekatlokal.gif"
              alt=""
              width={400}
              height={400}
              unoptimized
            />

            <div className="splash-screen__loading" aria-hidden="true">
              <div className="splash-screen__track">
                <span className="splash-screen__progress" />
              </div>
              <span className="splash-screen__label">Loading</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
