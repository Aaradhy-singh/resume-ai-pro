export const ATS_CONSTANTS = {
    SKILL_DENSITY: {
        MIN_IDEAL: 2,
        MAX_IDEAL: 6,
        PENALTY_MULTIPLIER: 3,
    },
    REQUIRED_SECTIONS: ["experience", "education", "skill", "summary", "project"],
    IDEAL_METRICS: {
        UNIQUE_ACTION_VERBS: 8,
        QUANTIFIED_METRICS: 10,
    },
};

export const CORE_SKILL_WEIGHT = 3;
export const SUPPORTING_SKILL_WEIGHT = 1.5;
export const ADJACENCY_SKILL_WEIGHT = 1;

export const FUZZY_MATCH_THRESHOLD = 0.4;
export const FUZZY_MATCH_MAX_DISTANCE = 2;
export const FUZZY_MATCH_MIN_LENGTH = 3;

export const MATCH_THRESHOLDS = {
    BEST_FIT_WEIGHTED_SCORE: 65,
    BEST_FIT_CORE_MATCH: 50,
    NEAR_FIT_WEIGHTED_SCORE: 40,
    NEAR_FIT_CORE_MATCH: 25,
    MIN_ADJACENCY_SCORE: 30,
};
