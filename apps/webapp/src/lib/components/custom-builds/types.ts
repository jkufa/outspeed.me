import type {
  CustomBuildInput,
  CustomBuildModifierInput,
  CustomBuildStored,
  ShowdownParseIssue,
  ShowdownParsedBuild,
  UnsupportedSpeedModifier,
} from "$lib/custom-builds";
import type { Nature } from "$lib/speed-tiers";

export type CustomBuildSpeciesOption = CustomBuildInput["species"] & {
  disabled?: boolean;
};

export type CustomBuildModifierOption = CustomBuildModifierInput & {
  label: string;
  disabled?: boolean;
  description?: string;
};

export type CustomBuildFormValue = CustomBuildInput | CustomBuildStored;

export type CustomBuildDraftSubmit = CustomBuildInput;

export type CustomBuildImportPreview = {
  build: ShowdownParsedBuild;
  resolvedInput?: CustomBuildInput;
  strippedModifiers: UnsupportedSpeedModifier[];
};

export type CustomBuildImportState =
  | {
      status: "idle";
    }
  | {
      status: "parsed";
      preview: CustomBuildImportPreview;
      warnings: ShowdownParseIssue[];
    }
  | {
      status: "error";
      errors: ShowdownParseIssue[];
    };

export type CustomBuildDisplayBuild = CustomBuildStored & {
  finalSpeed?: number;
  rawSpeed?: number;
  strippedModifiers?: UnsupportedSpeedModifier[];
};

export type NatureOption = {
  value: Nature;
  label: string;
  description: string;
};
