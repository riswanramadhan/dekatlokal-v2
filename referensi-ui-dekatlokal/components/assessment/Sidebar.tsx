import { Icon } from "@iconify/react";
import { AssessmentStep, QuestionGroup } from "./types";
import { canNavigateToGroup, isGroupValid, isGroupInvalid } from "./utils";
import { Answers } from "./types";
import Image from "next/image";

interface SidebarProps {
  currentStep: AssessmentStep;
  currentGroupIndex: number;
  questionGroups: QuestionGroup[];
  answers: Answers;
  unlockedGroups: Set<number>;
  touchedQuestions: Set<string>;
  onNavigate: (step: AssessmentStep, groupIndex?: number) => void;
}

export function Sidebar({ 
  currentStep, 
  currentGroupIndex,
  questionGroups,
  answers,
  unlockedGroups,
  touchedQuestions,
  onNavigate 
}: SidebarProps) {
  const isWelcomeActive = currentStep === "welcome";
  const isQuestionsActive = currentStep === "questions";
  
  const handleGroupClick = (index: number) => {
    // Check if navigation is allowed
    if (!canNavigateToGroup(questionGroups, index, answers, unlockedGroups)) {
      return; // Don't allow navigation
    }
    onNavigate("questions", index);
  };
  
  return (
    <aside className="hidden lg:flex flex-col w-80 bg-primary h-screen sticky top-0">
      <div className="pt-10 pl-10 mb-10">
          <Image
            src="/image/brand/dekat-lokal-2.png"
            alt="DekatLokal"
            width={207}
            height={64}
            priority
            className="h-12 w-auto lg:h-14"
          />
      </div>
      
      <nav className="flex-1 pl-10 pb-10 overflow-y-auto no-scrollbar">
        <ul className="space-y-2">
          {/* Welcome Step */}
          <li>
            <button
              type="button"
              onClick={() => onNavigate("welcome")}
              className="w-full grid grid-cols-[32px_1fr] gap-x-4 gap-y-4 items-center text-left cursor-pointer"
            >
              <div className="relative flex items-center justify-center w-8 h-8">
                {/* Arc left and right: isActive */}
                <svg
                  className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 overflow-visible ${
                    isWelcomeActive ? "opacity-100" : "opacity-0"
                  }`}
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Left arc */}
                  <path
                    d="M -2 8 A 14 14 0 0 0 -2 24"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Right arc */}
                  <path
                    d="M 34 8 A 14 14 0 0 1 34 24"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>

                {/* Circle */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white">
                  <Icon icon="mdi:check" className="w-5 h-5 text-primary" />
                </div>
              </div>
              <span className="text-white text-lg font-bold">Welcome</span>
            </button>
          </li>
          
          {/* Question Groups */}
          {questionGroups.map((group, index) => {
            const isActive = isQuestionsActive && currentGroupIndex === index;
            const isCompleted = isGroupValid(group, answers);
            const isInvalid = isGroupInvalid(group, answers, touchedQuestions);
            const canNavigate = canNavigateToGroup(questionGroups, index, answers, unlockedGroups);
            const isDisabled = !canNavigate && !isActive;
            
            return (
              <li key={group.id}>
                <button
                  type="button"
                  onClick={() => handleGroupClick(index)}
                  disabled={isDisabled}
                  className={`w-full grid grid-cols-[32px_1fr] gap-x-4 gap-y-4 items-center text-left transition-all duration-200 ${
                    isDisabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="flex justify-center">
                    <div className={`w-0.5 h-6 ${isActive || isInvalid || canNavigate ? "bg-white" : "bg-white/30"}`}></div>
                  </div>
                  <div></div>

                  {/* ✅ Wrapper arc + circle 32px */}
                  <div className="relative flex items-center justify-center w-8 h-8">
                    
                    {/* Arc left and right: isActive */}
                    <svg
                      className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 overflow-visible ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      {/* Left arc */}
                      <path
                        d="M -2 8 A 14 14 0 0 0 -2 24"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      {/* Right arc */}
                      <path
                        d="M 34 8 A 14 14 0 0 1 34 24"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>

                    {/* Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-white ${ 
                      isCompleted && canNavigate && !isInvalid
                        ? "bg-white" 
                        : isInvalid
                        ? "bg-neutral"
                        : isDisabled
                        ? "border-2 border-white/30"
                        : "bg-neutral"
                    }`}>
                      {isCompleted && canNavigate ? (
                        <Icon icon="mdi:check" className="w-5 h-5 text-primary" />
                      ) : isInvalid ? (
                        <Icon icon="mdi:exclamation" className="w-5 h-5 text-white" />
                      ) : (
                        <div />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className={`text-white text-lg ${
                      isCompleted && canNavigate 
                        ? "font-bold"
                        : "font-medium"
                    }`}>{group.sidebarTitle}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
