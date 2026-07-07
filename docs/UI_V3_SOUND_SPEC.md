# DekatLokal V3 Sound Spec

## Events

- `ui-click`: primary button or compact nav action.
- `option-select`: recall, preference, quiz, checklist option.
- `answer-correct`: correct quiz or recall feedback.
- `answer-incorrect-soft`: incorrect quiz or partial recall.
- `module-unlock`: next module becomes available.
- `lesson-complete`: lesson completion.
- `reward-complete`: certificate/reward completion.

## Rules

- No autoplay before a trusted user gesture.
- Default starts muted until the user enables sound.
- Preference persists in browser storage under `dekatlokal:sound-enabled`.
- Volume stays low, approximately `0.15-0.35`.
- Debounce repeated events to avoid rapid stacking.
- Never play on scroll.
- Visual feedback remains complete without sound.
- Respect reduced motion and accessibility preferences; sound toggle is keyboard accessible.

## Storage

Sound files live under `public/sounds/` and are referenced through a central registry. V3 uses locally generated short tones to avoid remote hotlinks and license ambiguity.

## Implementation

- Client-only hook loads audio lazily after first gesture.
- Server Components never import browser sound code.
- Tests cover preference persistence, first-gesture gating, registry completeness, and event-name validation.
