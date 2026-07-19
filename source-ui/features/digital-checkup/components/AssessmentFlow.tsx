"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Sidebar,
  WelcomeScreen,
  QuestionGroupScreen,
  CalculatingScreen,
  ResultsScreen,
  MobileProgressHeader,
  ProgressBar,
  questionGroups,
  type AssessmentStep,
  type Answers,
  type Answer,
  type AssessmentResponse,
  getAssessmentProgressMetrics,
  scrollToTop,
} from "@/components/assessment";
import {
  DIGITAL_CHECKUP_RECOMMENDATION_PATH,
  DIGITAL_CHECKUP_RESULT_PATH,
  isDigitalCheckupHostname,
} from "@/lib/host-routing";
import { siteConfig } from "@/lib/site-config";
import {
  ASSESSMENT_SESSION_KEY,
  ASSESSMENT_SESSION_TTL_MS,
  createAssessmentSessionSnapshot,
  parseAssessmentSessionSnapshot,
} from "@/features/digital-checkup/session";


/**
 * Digital Checkup Page Component
 * 
 * Main page for Digital Checkup UMKM with:
 * - Multi-step form with validation
 * - Progress tracking
 * - Restricted navigation (can't skip ahead)
 * - Results calculation and display
 */
export function AssessmentFlow() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<AssessmentStep>("welcome");
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [consentChecked, setConsentChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [responseData, setResponseData] = useState<AssessmentResponse | null>(null);
  
  // Track which groups can be navigated to (unlocked after visiting)
  const [unlockedGroups, setUnlockedGroups] = useState<Set<number>>(new Set([0]));
  
  // Track which questions have been touched/interacted with
  const [touchedQuestions, setTouchedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const restored = parseAssessmentSessionSnapshot(
        window.sessionStorage.getItem(ASSESSMENT_SESSION_KEY),
      );

      if (restored) {
        setCurrentStep(restored.currentStep);
        setCurrentGroupIndex(
          Math.min(restored.currentGroupIndex, questionGroups.length - 1),
        );
        setAnswers(restored.answers);
        setConsentChecked(restored.consentChecked);
        setTermsChecked(restored.termsChecked);
        setResponseData(restored.responseData);
        setUnlockedGroups(new Set(restored.unlockedGroups));
        setTouchedQuestions(new Set(restored.touchedQuestions));
        setSessionExpiresAt(
          restored.savedAt + ASSESSMENT_SESSION_TTL_MS,
        );
      } else {
        window.sessionStorage.removeItem(ASSESSMENT_SESSION_KEY);
        setSessionExpiresAt(Date.now() + ASSESSMENT_SESSION_TTL_MS);
      }
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    try {
      const snapshot = createAssessmentSessionSnapshot({
        currentStep,
        currentGroupIndex,
        answers,
        consentChecked,
        termsChecked,
        responseData,
        unlockedGroups: Array.from(unlockedGroups),
        touchedQuestions: Array.from(touchedQuestions),
      });

      window.sessionStorage.setItem(
        ASSESSMENT_SESSION_KEY,
        JSON.stringify(snapshot),
      );
      setSessionExpiresAt(
        snapshot.savedAt + ASSESSMENT_SESSION_TTL_MS,
      );
    } catch {
      // The assessment remains usable even when session persistence is blocked.
    }
  }, [
    answers,
    consentChecked,
    currentGroupIndex,
    currentStep,
    hasHydrated,
    responseData,
    termsChecked,
    touchedQuestions,
    unlockedGroups,
  ]);

  useEffect(() => {
    if (!hasHydrated || sessionExpiresAt === null) return;

    const timeout = window.setTimeout(() => {
      try {
        window.sessionStorage.removeItem(ASSESSMENT_SESSION_KEY);
      } catch {
        // Continue clearing in-memory PII when storage is unavailable.
      }

      setCurrentStep("welcome");
      setCurrentGroupIndex(0);
      setAnswers({});
      setConsentChecked(false);
      setTermsChecked(false);
      setResponseData(null);
      setUnlockedGroups(new Set([0]));
      setTouchedQuestions(new Set());

      if (
        isDigitalCheckupHostname(window.location.hostname) &&
        (window.location.pathname === DIGITAL_CHECKUP_RESULT_PATH ||
          window.location.pathname === DIGITAL_CHECKUP_RECOMMENDATION_PATH)
      ) {
        window.history.replaceState(window.history.state, "", "/");
      }

      scrollToTop();
    }, Math.max(0, sessionExpiresAt - Date.now()));

    return () => window.clearTimeout(timeout);
  }, [hasHydrated, sessionExpiresAt]);

  useEffect(() => {
    if (
      !hasHydrated ||
      !isDigitalCheckupHostname(window.location.hostname)
    ) {
      return;
    }

    const currentPath = window.location.pathname;
    const isResultPath =
      currentPath === DIGITAL_CHECKUP_RESULT_PATH ||
      currentPath === DIGITAL_CHECKUP_RECOMMENDATION_PATH;
    let targetPath = currentPath;

    if (currentStep === "results") {
      targetPath = isResultPath
        ? currentPath
        : DIGITAL_CHECKUP_RESULT_PATH;
    } else if (isResultPath) {
      targetPath = "/";
    }

    if (targetPath !== currentPath) {
      window.history.replaceState(
        window.history.state,
        "",
        `${targetPath}${window.location.search}${window.location.hash}`,
      );
    }
  }, [currentStep, hasHydrated]);

  // Total steps = welcome (1) + question groups
  const totalSteps = 1 + questionGroups.length;

  const handleStart = () => {
    setCurrentStep("questions");
    setCurrentGroupIndex(0);
    // Ensure first group is unlocked
    setUnlockedGroups((prev) => new Set(prev).add(0));
    scrollToTop();
  };

  const handleAnswerChange = (questionId: string, value: Answer) => {
    // Mark question as touched
    setTouchedQuestions((prev) => new Set(prev).add(questionId));
    
    setAnswers((prev) => {
      const nextAnswers: Answers = {
        ...prev,
        [questionId]: value,
      };

      if (questionId === "e-commerce-platform") {
        const selectedValues = Array.isArray(value) ? value : [];
        if (!selectedValues.includes("e-commerce-lainnya")) {
          delete nextAnswers["e-commerce-platform-other"];
        }
      }

      return nextAnswers;
    });
  };

  const handleNext = () => {
    // Unlock current group and next group (if exists)
    setUnlockedGroups((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentGroupIndex); // Current group
      if (currentGroupIndex < questionGroups.length - 1) {
        newSet.add(currentGroupIndex + 1); // Next group
      }
      return newSet;
    });
    
    if (currentGroupIndex < questionGroups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
    } else {
      // Last group - submit
      setCurrentStep("calculating");
    }
  };

  const handlePrevious = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex((prev) => prev - 1);
    } else {
      setCurrentStep("welcome");
      scrollToTop();
    }
  };

  const handleCalculationComplete = useCallback((response: AssessmentResponse) => {
    setResponseData(response);
    setCurrentStep("results");
    scrollToTop();
  }, []);

  const handleCalculationResponseReceived = useCallback(
    (response: AssessmentResponse) => {
      setResponseData(response);

      try {
        const snapshot = createAssessmentSessionSnapshot({
          currentStep: "results",
          currentGroupIndex,
          answers,
          consentChecked,
          termsChecked,
          responseData: response,
          unlockedGroups: Array.from(unlockedGroups),
          touchedQuestions: Array.from(touchedQuestions),
        });

        window.sessionStorage.setItem(
          ASSESSMENT_SESSION_KEY,
          JSON.stringify(snapshot),
        );
      } catch {
        // The successful response remains in memory when storage is unavailable.
      }
    },
    [
      answers,
      consentChecked,
      currentGroupIndex,
      termsChecked,
      touchedQuestions,
      unlockedGroups,
    ],
  );

  const handleNavigate = (step: AssessmentStep, groupIndex?: number) => {
    if (step === "welcome") {
      setCurrentStep("welcome");
      scrollToTop();
    } else if (step === "questions" && groupIndex !== undefined) {
      setCurrentStep("questions");
      setCurrentGroupIndex(groupIndex);
      scrollToTop();
    }
  };

  const progress = getAssessmentProgressMetrics(currentStep, currentGroupIndex, totalSteps);

  const handleBackToHome = useCallback(() => {
    window.location.assign(siteConfig.mainUrl);
  }, []);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
        <p className="text-sm font-medium text-neutral-500" role="status">
          Memuat sesi Digital Checkup…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop Only */}
      {currentStep !== "results" && (
        <Sidebar
          currentStep={currentStep}
          currentGroupIndex={currentGroupIndex}
          questionGroups={questionGroups}
          answers={answers}
          unlockedGroups={unlockedGroups}
          touchedQuestions={touchedQuestions}
          onNavigate={handleNavigate}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 ${currentStep === "results" ? "" : "lg:ml-0"}`}>
        {/* Mobile Progress Header */}
        <MobileProgressHeader
          currentStep={currentStep}
          currentGroupIndex={currentGroupIndex}
          totalSteps={totalSteps}
        />

        {/* Desktop Progress Bar */}
        {currentStep !== "results" && (
          <div className="hidden lg:block sticky top-0 z-10 bg-white border-b border-neutral-200 px-8 py-4">
            <ProgressBar 
              current={progress.current}
              total={progress.total}
            />
          </div>
        )}

        {/* Content Area */}
        <div className={`p-4 md:p-8 ${currentStep === "results" ? "bg-neutral-50" : ""}`}>
          <AnimatePresence mode="wait">
            {currentStep === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <WelcomeScreen 
                  onStart={handleStart}
                  onBackHome={handleBackToHome}
                />
              </motion.div>
            )}

            {currentStep === "questions" && (
              <motion.div
                key={`questions-${currentGroupIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <QuestionGroupScreen
                  group={questionGroups[currentGroupIndex]}
                  groupIndex={currentGroupIndex}
                  allGroups={questionGroups}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  onBackHome={handleBackToHome}
                  isFirst={currentGroupIndex === 0}
                  isLast={currentGroupIndex === questionGroups.length - 1}
                  consentChecked={consentChecked}
                  onConsentChange={setConsentChecked}
                  termsChecked={termsChecked}
                  onTermsChange={setTermsChecked}
                />
              </motion.div>
            )}

            {currentStep === "calculating" && (
              <motion.div
                key="calculating"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CalculatingScreen 
                  answers={answers}
                  onResponseReceived={handleCalculationResponseReceived}
                  onComplete={handleCalculationComplete}
                />
              </motion.div>
            )}

            {currentStep === "results" && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <ResultsScreen 
                  answers={answers}
                  questionGroups={questionGroups}
                  responseData={responseData}
                  onBackHome={handleBackToHome}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
