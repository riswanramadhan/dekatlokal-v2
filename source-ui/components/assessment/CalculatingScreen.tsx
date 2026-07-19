import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Answers, AssessmentResponse } from "./types";

const STEPS = [
  "Menganalisis profil bisnis...",
  "Mengevaluasi kehadiran digital...",
  "Mengukur operasional digital...",
  "Menghitung skor kesiapan...",
  "Menyiapkan rekomendasi...",
] as const;

/** Minimum time (ms) the loading animation should be visible */
const MIN_ANIMATION_MS = 4000;
/** Maximum time (ms) to wait for API before showing timeout error.
 *  Increased to 120s because Apify actor runs can take up to 60s. */
const API_TIMEOUT_MS = 120_000;
/** Progress increment interval (ms) */
const PROGRESS_INTERVAL_MS = 80;
/** Step text rotation interval (ms) */
const STEP_INTERVAL_MS = 800;

interface CalculatingScreenProps {
  answers: Answers;
  onResponseReceived: (response: AssessmentResponse) => void;
  onComplete: (response: AssessmentResponse) => void;
}

export function CalculatingScreen({
  answers,
  onResponseReceived,
  onComplete,
}: CalculatingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs to coordinate between API call and animation
  const responseRef = useRef<AssessmentResponse | null>(null);
  const animationDoneRef = useRef(false);
  const didCompleteRef = useRef(false);
  const didSubmitRef = useRef(false);

  // Stable callback ref to avoid stale closures and dependency issues
  const onCompleteRef = useRef(onComplete);
  const onResponseReceivedRef = useRef(onResponseReceived);
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onResponseReceivedRef.current = onResponseReceived;
  }, [onComplete, onResponseReceived]);

  /**
   * Try to finish: only calls onComplete when BOTH conditions are met:
   * 1. API response has been received
   * 2. Minimum animation time has elapsed
   * Guarantees onComplete is called exactly once.
   */
  const tryFinish = useCallback(() => {
    if (didCompleteRef.current) return;
    if (!responseRef.current || !animationDoneRef.current) return;

    didCompleteRef.current = true;
    onCompleteRef.current(responseRef.current);
  }, []);

  // Effect 1: Submit answers to API (runs exactly once via didSubmitRef)
  // IMPORTANT: Do NOT use AbortController here. In React 18 StrictMode (dev),
  // effects run mount → cleanup → remount. AbortController.abort() during cleanup
  // kills the in-flight request, causing either:
  //   - Server receives empty body (abort before body sent)
  //   - Client never reads the response (abort after server processed)
  // Instead, we use an `active` flag that only guards state updates but still
  // allows the fetch to complete and store its result in the ref.
  useEffect(() => {
    if (didSubmitRef.current) return;
    didSubmitRef.current = true;

    let active = true;

    const submitAnswers = async () => {
      try {
        if (!answers || Object.keys(answers).length === 0) {
          if (active) setError("Tidak ada jawaban untuk dikirim");
          return;
        }

        const response = await fetch("/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `HTTP ${response.status}: ${response.statusText}`,
          }));
          if (active) {
            setError(
              typeof errorData === "object" && "message" in errorData
                ? (errorData as { message: string }).message
                : "Gagal menyimpan checkup"
            );
          }
          return;
        }

        const data = (await response.json()) as AssessmentResponse;

        if (!data?.id) {
          if (active) setError("Response tidak valid dari server");
          return;
        }

        // Always store response in ref regardless of active flag.
        // In StrictMode, mount 2's animation effect will pick this up via tryFinish().
        responseRef.current = data;
        // Persist the successful response before the minimum animation finishes,
        // so a refresh cannot lose an already-created Neon result.
        onResponseReceivedRef.current(data);
        tryFinish();
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Terjadi kesalahan tidak diketahui"
        );
      }
    };

    submitAnswers();

    return () => {
      active = false;
    };
  }, [answers, tryFinish]);

  // Effect 2: Animation (progress bar, step text, min-duration timer, API timeout)
  useEffect(() => {
    if (error) return;

    // Progress bar: 0 → 90% over ~3.6s, then holds until finish
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return Math.min(prev + 2, 90);
      });
    }, PROGRESS_INTERVAL_MS);

    // Rotate step messages
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) =>
        prev >= STEPS.length - 1 ? prev : prev + 1
      );
    }, STEP_INTERVAL_MS);

    // Minimum animation duration before allowing completion
    const minTimer = setTimeout(() => {
      animationDoneRef.current = true;
      setProgress(100);
      tryFinish();
    }, MIN_ANIMATION_MS);

    // Hard timeout: show error if API never responded
    const timeoutTimer = setTimeout(() => {
      if (!responseRef.current && !didCompleteRef.current) {
        setError("Timeout: Server tidak merespons. Silakan coba lagi.");
      }
    }, API_TIMEOUT_MS);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
      clearTimeout(minTimer);
      clearTimeout(timeoutTimer);
    };
  }, [error, tryFinish]);

  // Derive display values from answers
  const businessName = (answers["umkm-name"] as string) || "Bisnis Anda";
  const ownerName = (answers["owner-name"] as string) || "-";

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h2>
          <p className="text-neutral-600 mb-6 whitespace-pre-wrap">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary-600"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Animated Loader */}
      <div className="relative w-32 h-32 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
        <div 
          className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
          style={{ animationDuration: "1s" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon icon="mdi:chart-line" className="w-12 h-12 text-primary" />
        </div>
      </div>

      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
        Sedang Menganalisis...
      </h2>
      
      <p className="text-neutral-600 mb-6 h-6">
        {STEPS[currentStep]}
      </p>

      {/* Progress Bar */}
      <div className="w-full max-w-md mb-8">
        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-primary to-primary-400 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-neutral-500 mt-2">{progress}%</p>
      </div>

      {/* Business Profile Summary */}
      <div className="bg-neutral-50 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
          Profil Bisnis
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Nama UMKM</span>
            <span className="font-semibold text-neutral-900">{businessName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-600">Nama Pemilik</span>
            <span className="font-semibold text-neutral-900">{ownerName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
