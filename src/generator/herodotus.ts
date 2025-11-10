import fs from 'fs'
import path from 'path'
import { config as c } from '../config'
import { createDirIfMissing } from '../utils/directory'
import type { GeneratedNFT } from './composer'

/**
 * Generates metadata JSON files for each NFT in the provided collection.
 *
 * The metadata format is compatible with major marketplaces such as
 * **OpenSea**, **Rarible**, and others. Each metadata file includes
 * the NFT’s name, description, image link, traits (attributes),
 * and collection information from `config`.
 *
 * The function clears the existing `metadata` directory inside the given `outputDir`
 * before creating new files.
 *
 * @param {GeneratedNFT[]} nfts - Array of generated NFT objects with image paths and traits.
 * @param {string} outputDir - Path to the collection’s output directory where the `metadata` folder will be created.
 * @returns {void}
 *
 * @throws {Error} If writing metadata files fails due to missing directories or permission issues.
 *
 * @example
 * ```ts
 * import { generateMetadata } from "./metadata";
 * import { generateImages } from "./composer";
 *
 * const nfts = await generateImages("layers", "collection", 5);
 * generateMetadata(nfts, "collection");
 * // Creates: collection/metadata/1.json, 2.json, etc.
 * ```
 */
export function generateMetadata(nfts: GeneratedNFT[], outputDir: string): void {
  // Clean output folder
  const metadataDir = path.join(outputDir, 'metadata')
  if (fs.existsSync(metadataDir)) {
    fs.rmSync(metadataDir, { recursive: true, force: true })
  }
  createDirIfMissing(metadataDir)

  // Metadata generation
  for (const nft of nfts) {
    const metadata = {
      name: `${c.collection.name} #${nft.id}`,
      description: c.collection.description,
      external_link: c.collection.external_link,
      image: `${c.collection.image}/${nft.id}.png/`,
      banner_image: c.collection.banner_image,
      seller_fee_basis_points: c.collection.seller_fee_basis_points,
      fee_recipient: c.collection.fee_recipient,
      attributes: nft.traits.map((t) => ({
        trait: t.trait,
        value: t.value,
      })),
    }

    const filePath = path.join(outputDir, 'metadata', `${nft.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2))
  }

  console.log(`🧾 Metadata created for ${nfts.length} NFTs`)
}
