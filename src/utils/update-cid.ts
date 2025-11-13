import fs from 'fs'
import path from 'path'
import { dirExists } from '../utils/directory'

/**
 * Replaces the IPFS CID **only in the "image" field** of all metadata JSON files within a given directory.
 *
 * This function scans all JSON files in the specified `metadataDir`,
 * reads each as metadata, and updates only the `image` field if it contains
 * an IPFS link (`ipfs://<oldCid>/<filename>`). The filename or subpath part remains unchanged.
 *
 * @param {string} metadataDir - Path to the directory containing metadata files.
 * @param {string} newCid - The new IPFS CID to insert into the `image` field.
 * @returns {number} Number of metadata files successfully updated.
 *
 * @example
 * // Replace only the "image" CIDs inside the "collection/metadata" folder
 * replaceIpfsCid("collection/metadata", "bafybeihdwdce6examplecid123");
 */
export function replaceIpfsCid(metadataDir: string, newCid: string): number {
  if (!dirExists(metadataDir)) {
    throw new Error(`❌ Directory not found: ${metadataDir}`)
  }

  const files = fs.readdirSync(metadataDir)
  let updatedCount = 0

  for (const file of files) {
    if (!file.endsWith('.json')) continue

    const filePath = path.join(metadataDir, file)
    let json: any

    try {
      json = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {
      console.warn(`⚠️ Skipping invalid JSON: ${file}`)
      continue
    }

    if (typeof json.image === 'string' && json.image.startsWith('ipfs://')) {
      const match = json.image.match(/^ipfs:\/\/[^/]+\/(.+)$/)
      if (match && match[1]) {
        const relativePath = match[1]
        json.image = `ipfs://${newCid}/${relativePath}`
        updatedCount++
      } else {
        console.warn(`⚠️ Could not extract relative path from: ${json.image}`)
      }
    } else {
      console.warn(`⚠️ No valid "image" field in ${file}`)
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8')
  }

  console.log(`\n✅ Updated ${updatedCount} metadata files with new CID: ${newCid}`)
  return updatedCount
}

if (require.main === module) {
  const [newCid, dirArg] = process.argv.slice(2)
  const metadataDir = path.resolve(dirArg || 'collection/metadata')

  if (!newCid) {
    console.error('❌ Missing CID argument.\nUsage: npm run replace-img-cid -- <CID> [metadataDir]')
    process.exit(1)
  }

  try {
    replaceIpfsCid(metadataDir, newCid)
  } catch (err: any) {
    console.error('❌ Failed to update CID:', err.message ?? err)
    process.exit(1)
  }
}
