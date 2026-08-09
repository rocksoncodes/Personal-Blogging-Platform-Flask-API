import {
  defaultLogger,
  logBootstrapError,
  logBootstrapStep,
  logProcess,
} from "../app/logger/logger.utils.js";
import { GatewayControllers, SharedDependencies } from "./bootstrap.types.js";
import { registerGatewayControllers } from "../modules/controllers.registry.js";

/**
 * Boots and registers all gateway controllers.
 *
 * @param deps - Shared dependencies required to initialize the controllers.
 * @returns The registered gateway controllers.
 * @throws {Error} If handlers initialization fails.
 */
export function bootGatewayControllers(
  deps: SharedDependencies,
): GatewayControllers {
  try {
    return registerGatewayControllers(deps);
  } catch (error) {
    logBootstrapError(
      deps.logger,
      "Booting module clients & controllers",
      error,
    );
    throw new Error();
  }
}

/**
 * Retrieves a string secrets variable, optionally falling back to a default value.
 *
 * @param key - The name of the secrets variable to read.
 * @param fallback - A default value to use if the secrets variable is not set.
 * @returns The secrets variable's value, or the fallback if provided.
 * @throws {Error} If the secrets variable is not set and no fallback is provided.
 */
export function getEnvVar(key: string, fallback?: string): string {
  const value: string | undefined = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Retrieves a numeric secrets variable, optionally falling back to a default value.
 *
 * @param key - The name of the secrets variable to read.
 * @param fallback - A default numeric value to use if the secrets variable is not set.
 * @returns The parsed numeric value, or the fallback if provided.
 * @throws {Error} If the secrets variable is not set and no fallback is provided,
 * or if the value cannot be parsed as a number.
 */
export function getEnvNumber(key: string, fallback?: number): number {
  const raw: string | undefined = process.env[key];
  if (raw === undefined) {
    if (fallback === undefined) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return fallback;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(
      `Environment variable ${key} must be a number, got: ${raw}`,
    );
  }
  return parsed;
}

/**
 * Validates that all provided secrets variables are set.
 *
 * @param secrets - A map of secrets variable names to their resolved values.
 * @throws {Error} If one or more values are `undefined`, `null`, or an empty string.
 */
export function validateEnvs(secrets: Record<string, unknown>) {
  let missingEnvs: string[] = [];

  for (const [key, value] of Object.entries(secrets)) {
    if (value === undefined || value === null || value === "") {
      missingEnvs.push(key);
    }
  }

  if (missingEnvs.length > 0) {
    throw new Error(
      `${missingEnvs.length} missing environment variable(s): 
      ${missingEnvs.join(", ")}`,
    );
  }
}

/**
 * Validates secrets fetched from Infisical, logging how many were successfully
 * injected and throwing if any required secrets are missing.
 *
 * @param secrets - A map of secret names to their fetched values.
 * @throws {Error} If one or more values are `undefined`, `null`, or an empty string.
 */
export function validateInfisicalSecrets(secrets: Record<string, unknown>) {
  let missingSecrets: string[] = [];
  let fetchedSecrets: string[] = [];

  for (const [key, value] of Object.entries(secrets)) {
    if (value === undefined || value === null || value === "") {
      missingSecrets.push(key);
    }
    fetchedSecrets.push(key);
  }
  if (fetchedSecrets.length > 0) {
    logProcess(
      defaultLogger,
      `${fetchedSecrets.length} secret(s) injected from Infisical}`,
    );
  }

  if (missingSecrets.length > 0) {
    throw new Error(
      `${missingSecrets.length} missing environment variable(s): \n
      ${missingSecrets.join("\n ").toUpperCase()}`,
    );
  }
}

/**
 * Validates that all gateway controllers booted successfully,
 * logging a success message if so.
 *
 * @param logger - The logger instance.
 * @param gatewayControllers - A map of handlers names to their booted instances.
 * @throws {Error} If any handlers entry is falsy (failed to boot).
 */
export function validateGatewayControllers(
  logger: any,
  gatewayControllers: GatewayControllers,
): void {
  for (const [key, gatewayController] of Object.entries(gatewayControllers)) {
    if (!gatewayController) {
      throw new Error(
        `${key} controller is not registered, check module resource registry`,
      );
    }
  }

  logBootstrapStep(logger, "Gateway Controllers booted successfully");
}
