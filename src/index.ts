import { generateImages } from './generator/composer'
import { generateMetadata } from './generator/herodotus'
import { config } from './config'

/**
 * Main entry point for the NFT Art Generator.
 *
 * This function:
 * 1. Loads configuration settings.
 * 2. Generates NFT images from layered assets.
 * 3. Creates metadata files for each generated NFT.
 *
 * @async
 * @function runGenerator
 * @returns {Promise<void>} Resolves when the generation process is complete.
 *
 * @example
 * ```ts
 * await runGenerator();
 * // -> Generates all NFTs and their metadata according to the config
 * ```
 */
export async function runGenerator(): Promise<void> {
  console.log('🚂 NFT Art Generator started!\n')

  const { layersDir, outputDir, totalNFTs, allowDuplicates } = config

  try {
    // Step 1: Generate layered images
    const nfts = await generateImages(layersDir, outputDir, totalNFTs, allowDuplicates)

    // Step 2: Generate metadata files
    generateMetadata(nfts, outputDir)

    console.log('\n🏁 Generation complete')
  } catch (error) {
    console.error('❌ Generation failed:', error)
    process.exit(1)
  }
}

// Execute generator when run directly
if (require.main === module) {
  runGenerator()
}
