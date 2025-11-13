import fs from 'fs'
import path from 'path'
import { dirExists } from '../utils/directory'

/**
 * Replaces the IPFS CID **only in the "image" field** of all metadata JSON files within a given directory.
 *
 * This function scans all JSON files in the specified `metadataDir`,
 * reads each as metadata, and updates only the `image` field if it contains
 * an IPFS link (`ipfs://<oldCid>/<filename>`). The filename part remains unchanged.
 * Other fields (e.g. `banner_image`) are not modified.
 *
 * Typical usage:
 * - After uploading your collection’s image assets to IPFS, use this function
 *   to update metadata so that the `image` field points to the new CID.
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
  dirExists(metadataDir)

  const files = fs.readdirSync(metadataDir)
  let updatedCount = 0

  for (const file of files) {
    const filePath = path.join(metadataDir, file)

    // Пропускаем не-JSON файлы
    if (!file.endsWith('.json')) continue

    const raw = fs.readFileSync(filePath, 'utf8')
    let json: any

    try {
      json = JSON.parse(raw)
    } catch (e) {
      console.warn(`⚠️ Skipping invalid JSON file: ${file}`)
      continue
    }

    // Меняем только поле `image`
    if (typeof json.image === 'string' && json.image.startsWith('ipfs://')) {
      const oldImage = json.image
      const fileName = oldImage.split('/').pop() // сохраняем имя файла (например 1.png)
      json.image = `ipfs://${newCid}/${fileName}`
      updatedCount++
    }

    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8')
  }

  console.log(`✅ Updated ${updatedCount} metadata files (image field only) with CID: ${newCid}`)
  return updatedCount
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const metadataDir = path.resolve('collection', 'metadata')
  const newCid = args[0]

  if (!newCid) {
    console.error('❌ Missing CID argument. Usage: npm run replace-img-cid -- <CID>')
    process.exit(1)
  }

  try {
    replaceIpfsCid(metadataDir, newCid)
  } catch (err: any) {
    console.error('❌ Failed to update CID:', err.message ?? err)
    process.exit(1)
  }
}
