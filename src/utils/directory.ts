import fs from 'fs'
import path from 'path'

/**
 * Checks whether a directory exists.
 * Throws an error if it does not exist.
 *
 * @param {string} dir - Path to the directory.
 * @returns {boolean} True if the directory exists.
 * @throws {Error} If the directory does not exist.
 */
export function dirExists(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    throw new Error(`Directory does not exist: ${dir}`)
  }
  return true
}

/**
 * Ensures a directory exists; creates it if missing.
 *
 * @param {string} dir - Path to the directory.
 */
export function createDirIfMissing(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

/**
 * Returns a list of file names in the specified directory.
 * Hidden files (those starting with a dot) are excluded.
 *
 * @param {string} dir - Path to the directory to read files from.
 * @returns {string[]} An array of file names.
 *
 * @example
 * ```ts
 * const files = getFiles("layers/backdrop");
 * // ["sky.png", "mountains.png", "clouds.png"]
 * ```
 */
export function getFiles(dir: string): string[] {
  return fs.readdirSync(dir).filter((file) => !file.startsWith('.'))
}

/**
 * Returns a list of subfolder names inside the specified directory.
 *
 * @param {string} dir - Path to the directory to read subfolders from.
 * @returns {string[]} An array of subfolder names.
 *
 * @example
 * ```ts
 * const folders = getFolders("layers");
 * // ["backdrop", "body", "outline"]
 * ```
 */
export function getFolders(dir: string): string[] {
  return fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
}
