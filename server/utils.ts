import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const SALT_LENGTH = 16;
const KEY_LENGTH = 64;

/**
 * Hash a password using scrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePasswords(
  supplied: string,
  stored: string,
): Promise<boolean> {
  const [salt, key] = stored.split(":");
  const keyBuffer = Buffer.from(key, "hex");
  const derivedKey = (await scryptAsync(supplied, salt, KEY_LENGTH)) as Buffer;
  return timingSafeEqual(keyBuffer, derivedKey);
}

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: "male" | "female" | "other",
): number {
  if (gender === "male" || gender === "other") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

/**
 * Calculate TDEE from BMR and activity level
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: string,
  daysPerWeek?: number,
): number {
  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };

  // If we have training days, adjust activity based on that
  if (daysPerWeek) {
    if (daysPerWeek >= 5) return bmr * 1.725;
    if (daysPerWeek >= 3) return bmr * 1.55;
    if (daysPerWeek >= 1) return bmr * 1.375;
  }

  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

/**
 * Calculate target calories based on goal
 */
export function calculateTargetCalories(
  tdee: number,
  goal: string,
): number {
  switch (goal) {
    case "cut":
      return Math.round(tdee * 0.8); // 20% deficit
    case "bulk":
      return Math.round(tdee * 1.1); // 10% surplus
    case "recomp":
    case "strength":
    case "hypertrophy":
    default:
      return Math.round(tdee);
  }
}

/**
 * Calculate macros based on calories and goal
 */
export function calculateMacros(
  calories: number,
  weight: number,
  goal: string,
): { protein: number; carbs: number; fats: number } {
  let proteinGrams: number;
  let fatGrams: number;

  // Protein: 1.6-2.2g per kg bodyweight depending on goal
  if (goal === "cut") {
    proteinGrams = Math.round(weight * 2.2);
  } else if (goal === "bulk") {
    proteinGrams = Math.round(weight * 1.8);
  } else {
    proteinGrams = Math.round(weight * 2.0);
  }

  // Fat: 0.8-1g per kg bodyweight
  fatGrams = Math.round(weight * 0.9);

  // Remaining calories go to carbs
  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const carbCals = calories - proteinCals - fatCals;
  const carbGrams = Math.max(0, Math.round(carbCals / 4));

  return {
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
  };
}
