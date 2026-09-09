export type ProgressState = {
  completedLessons: string[];
  xp: number;
  attempts: number;
  bestScore: number;
};

const KEY = "mis-egypt-progress";

const defaultState: ProgressState = {
  completedLessons: [],
  xp: 0,
  attempts: 0,
  bestScore: 0
};

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch { return defaultState; }
}

export function saveProgress(state: ProgressState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}