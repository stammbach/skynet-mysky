import { Buffer } from "buffer";
import { permCategoryToString, Permission, permTypeToString } from "skynet-mysky-utils";
import { hash, sign } from "tweetnacl";

import type { KeyPair } from "skynet-js";

const urlParams = new URLSearchParams(window.location.search);
const DEBUG_ENABLED = urlParams.get("debug") === "true";

const SALT_ROOT_DISCOVERABLE_KEY = "root discoverable key";

/**
 * Prints to stdout, only if DEBUG_ENABLED flag is set.
 *
 * @param message - The message to print.
 * @param {...any} optionalContext - The optional context.
 */
export function log(message: string, ...optionalContext: any[]): void {
  if (DEBUG_ENABLED) {
    console.log(message, ...optionalContext);
  }
}

/**
 * Generates a keypair from the given user seed. It first salts the seed.
 *
 * @param seed - The user seed as bytes.
 * @returns - The keypair.
 */
export function genKeyPairFromSeed(seed: Uint8Array): KeyPair {
  const bytes = new Uint8Array([...sha512(SALT_ROOT_DISCOVERABLE_KEY), ...sha512(seed)]);
  const hashBytes = sha512(bytes).slice(0, 32);

  const { publicKey, secretKey } = sign.keyPair.fromSeed(hashBytes);

  return { publicKey: toHexString(publicKey), privateKey: toHexString(secretKey) };
}

/**
 * Constructs a human-readable version of the permission.
 *
 * @param perm - The given permission.
 * @returns - The string.
 */
export function readablePermission(perm: Permission): string {
  const category = permCategoryToString(perm.category);
  const permType = permTypeToString(perm.permType);

  return `${perm.requestor} can ${permType} ${category} files at ${perm.path}`;
}

/**
 * Hashes the given string or byte array using sha512.
 *
 * @param message - The string or byte array to hash.
 * @returns - The resulting hash.
 */
export function sha512(message: Uint8Array | string): Uint8Array {
  if (typeof message === "string") {
    return hash(stringToUint8ArrayUtf8(message));
  }
  return hash(message);
}

/**
 * Converts a UTF-8 string to a uint8 array containing valid UTF-8 bytes.
 *
 * @param str - The string to convert.
 * @returns - The uint8 array.
 * @throws - Will throw if the input is not a string.
 */
export function stringToUint8ArrayUtf8(str: string): Uint8Array {
  return Uint8Array.from(Buffer.from(str, "utf-8"));
}

/**
 * Convert a byte array to a hex string.
 *
 * @param byteArray - The byte array to convert.
 * @returns - The hex string.
 * @see {@link https://stackoverflow.com/a/44608819|Stack Overflow}
 */
export function toHexString(byteArray: Uint8Array): string {
  let s = "";
  byteArray.forEach(function (byte) {
    s += ("0" + (byte & 0xff).toString(16)).slice(-2);
  });
  return s;
}
