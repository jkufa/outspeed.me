import type { Nature } from "../speed-tiers";
import { getSupportedSpeedModifiers } from "./speed-calculator";
import { CUSTOM_BUILD_STORAGE_SCHEMA_VERSION } from "./types";
import type {
  CustomBuildInput,
  CustomBuildModifierInput,
  CustomBuildSpeciesRef,
  CustomBuildStored,
  CustomBuildValidationIssue,
  CustomBuildValidationResult,
} from "./types";

const natures = new Set<Nature>(["neutral", "positive", "negative"]);
const origins = new Set<CustomBuildInput["origin"]>(["manual", "showdown"]);

export type CustomBuildValidationOptions = {
  hasSpecies?: (species: CustomBuildSpeciesRef) => boolean;
};

export function validateCustomBuildInput(
  input: CustomBuildInput,
  options: CustomBuildValidationOptions = {},
): CustomBuildValidationResult {
  const issues: CustomBuildValidationIssue[] = [];

  validateSpecies(input.species, issues, options.hasSpecies);
  validateNature(input.nature, issues);
  validateSpeedStatPoints(input.speedStatPoints, issues);
  validateOrigin(input.origin, issues);
  validateModifier(input.ability, "ability", issues);
  validateModifier(input.item, "item", issues);

  return toValidationResult(issues);
}

export function validateCustomBuildStored(
  build: CustomBuildStored,
  options: CustomBuildValidationOptions = {},
): CustomBuildValidationResult {
  const issues: CustomBuildValidationIssue[] = [];

  if (build.schemaVersion !== CUSTOM_BUILD_STORAGE_SCHEMA_VERSION) {
    issues.push({
      code: "invalid-storage-schema",
      message: `Custom build uses unsupported storage schema ${String(build.schemaVersion)}`,
      path: "schemaVersion",
    });
  }

  if (typeof build.id !== "string" || build.id.trim() === "") {
    issues.push({
      code: "invalid-storage-schema",
      message: "Custom build id is missing",
      path: "id",
    });
  }

  if (!isIsoDateTimeString(build.createdAt)) {
    issues.push({
      code: "invalid-storage-schema",
      message: "Custom build createdAt timestamp is invalid",
      path: "createdAt",
    });
  }

  if (!isIsoDateTimeString(build.updatedAt)) {
    issues.push({
      code: "invalid-storage-schema",
      message: "Custom build updatedAt timestamp is invalid",
      path: "updatedAt",
    });
  }

  const inputResult = validateCustomBuildInput(build, options);
  if (!inputResult.ok) {
    issues.push(...inputResult.issues);
  }

  return toValidationResult(issues);
}

export function isSupportedCustomBuildModifier(
  modifier: CustomBuildModifierInput | null,
  kind: CustomBuildModifierInput["kind"],
) {
  if (modifier === null) {
    return true;
  }

  return getSupportedSpeedModifiers().some(
    (supported) =>
      supported.kind === kind && supported.source === normalizeModifierSource(modifier.source),
  );
}

export function normalizeModifierSource(source: string) {
  return source
    .trim()
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateSpecies(
  species: CustomBuildSpeciesRef,
  issues: CustomBuildValidationIssue[],
  hasSpecies: CustomBuildValidationOptions["hasSpecies"],
) {
  if (
    species === null ||
    typeof species !== "object" ||
    !Number.isInteger(species.id) ||
    species.id <= 0 ||
    !Number.isInteger(species.pokedexNo) ||
    species.pokedexNo <= 0 ||
    typeof species.slug !== "string" ||
    species.slug.trim() === "" ||
    typeof species.name !== "string" ||
    species.name.trim() === ""
  ) {
    issues.push({
      code: "missing-species",
      message: "Choose a Pokemon before saving",
      path: "species",
    });
    return;
  }

  if (hasSpecies && !hasSpecies(species)) {
    issues.push({
      code: "invalid-species",
      message: `${species.name} is not available in the current Champions speed tier data`,
      path: "species",
    });
  }
}

function validateNature(nature: Nature, issues: CustomBuildValidationIssue[]) {
  if (!natures.has(nature)) {
    issues.push({
      code: "invalid-nature",
      message: "Choose a valid speed nature",
      path: "nature",
    });
  }
}

function validateSpeedStatPoints(speedStatPoints: number, issues: CustomBuildValidationIssue[]) {
  if (!Number.isInteger(speedStatPoints) || speedStatPoints < 0 || speedStatPoints > 32) {
    issues.push({
      code: "invalid-speed-stat-points",
      message: "Speed SP must be a whole number from 0 to 32",
      path: "speedStatPoints",
    });
  }
}

function validateOrigin(origin: CustomBuildInput["origin"], issues: CustomBuildValidationIssue[]) {
  if (!origins.has(origin)) {
    issues.push({
      code: "invalid-origin",
      message: "Custom build origin is invalid",
      path: "origin",
    });
  }
}

function validateModifier(
  modifier: CustomBuildModifierInput | null,
  kind: CustomBuildModifierInput["kind"],
  issues: CustomBuildValidationIssue[],
) {
  if (modifier === null) {
    return;
  }

  if (modifier.kind !== kind || !isSupportedCustomBuildModifier(modifier, kind)) {
    issues.push({
      code: kind === "ability" ? "invalid-ability" : "invalid-item",
      message: `Unsupported speed ${kind}: ${modifier.label ?? modifier.source}`,
      path: kind,
    });
  }
}

function isIsoDateTimeString(value: string) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function toValidationResult(issues: CustomBuildValidationIssue[]): CustomBuildValidationResult {
  if (issues.length === 0) {
    return { ok: true };
  }

  return { ok: false, issues };
}
