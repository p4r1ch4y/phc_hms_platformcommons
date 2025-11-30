export const RiskLevel = {
    LOW: 'LOW',
    MODERATE: 'MODERATE',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL',
} as const;

export type RiskLevel = (typeof RiskLevel)[keyof typeof RiskLevel];

export interface VitalsInput {
    bloodPressure?: string; // e.g., "120/80"
    pulse?: number;
    temperature?: number; // Fahrenheit
    bloodSugar?: number; // mg/dL
    spo2?: number; // Percentage
}

export interface RiskAssessment {
    riskLevel: RiskLevel;
    triageNote: string;
}

export const calculateRisk = (vitals: VitalsInput): RiskAssessment => {
    let riskLevel: RiskLevel = RiskLevel.LOW;
    const notes: string[] = [];

    // Blood Pressure Check
    if (vitals.bloodPressure) {
        const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
        if (systolic >= 160 || diastolic >= 100) {
            riskLevel = RiskLevel.CRITICAL;
            notes.push('Critical BP');
        } else if (systolic >= 140 || diastolic >= 90) {
            riskLevel = updateRisk(riskLevel, RiskLevel.HIGH);
            notes.push('High BP');
        }
    }

    // SPO2 Check
    if (vitals.spo2 !== undefined && !isNaN(vitals.spo2)) {
        if (vitals.spo2 < 90) {
            riskLevel = RiskLevel.CRITICAL;
            notes.push('Critical Hypoxia');
        } else if (vitals.spo2 < 95) {
            riskLevel = updateRisk(riskLevel, RiskLevel.MODERATE);
            notes.push('Low SPO2');
        }
    }

    // Temperature Check
    if (vitals.temperature !== undefined && !isNaN(vitals.temperature)) {
        if (vitals.temperature > 103) {
            riskLevel = updateRisk(riskLevel, RiskLevel.CRITICAL);
            notes.push('High Fever');
        } else if (vitals.temperature > 100.4) {
            riskLevel = updateRisk(riskLevel, RiskLevel.MODERATE);
            notes.push('Fever');
        }
    }

    // Blood Sugar Check
    if (vitals.bloodSugar !== undefined && !isNaN(vitals.bloodSugar)) {
        if (vitals.bloodSugar > 200) {
            riskLevel = updateRisk(riskLevel, RiskLevel.CRITICAL);
            notes.push('Critical Hyperglycemia');
        } else if (vitals.bloodSugar > 140) {
            riskLevel = updateRisk(riskLevel, RiskLevel.HIGH);
            notes.push('High Blood Sugar');
        } else if (vitals.bloodSugar < 70) {
            riskLevel = updateRisk(riskLevel, RiskLevel.CRITICAL);
            notes.push('Hypoglycemia');
        }
    }

    return {
        riskLevel,
        triageNote: notes.length > 0 ? notes.join(', ') : 'Normal Vitals',
    };
};

// Helper to upgrade risk level only (never downgrade)
const updateRisk = (current: RiskLevel, proposed: RiskLevel): RiskLevel => {
    const levels = [RiskLevel.LOW, RiskLevel.MODERATE, RiskLevel.HIGH, RiskLevel.CRITICAL];
    const currentIndex = levels.indexOf(current);
    const proposedIndex = levels.indexOf(proposed);
    return proposedIndex > currentIndex ? proposed : current;
};
