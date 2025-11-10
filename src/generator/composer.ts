import { createCanvas, loadImage } from 'canvas'
import fs from 'fs'
import path from 'path'
import { createDirIfMissing, getFiles } from '../utils/directory'
import { config } from '../config'

/**
 * Represents a single trait (layer property) of an NFT.
 * Each trait corresponds to one image layer file (e.g., "ears: big", "body: red").
 *
 * @typedef {Object} Trait
 * @property {string} trait - The name of the trait (layer folder name).
 * @property {string} value - The value of the trait (filename without extension).
 * @property {string} filePath - Full path to the image file used for this trait.
 */
interface Trait {
  trait: string
  value: string
  filePath: string
}

/**
 * Represents a generated NFT image and its associated metadata.
 *
 * @typedef {Object} GeneratedNFT
 * @property {number} id - Unique NFT identifier (1-based index).
 * @property {Trait[]} traits - Array of traits (layer details) used for this NFT.
 * @property {string} imagePath - Path where the final rendered image is saved.
 */
export interface GeneratedNFT {
  id: number
  traits: Trait[]
  imagePath: string
}

/**
 * Width of the generated NFT image in pixels.
 * Defaults to `2048` if not specified in `config.image.width`.
 *
 * @constant
 * @type {number}
 */
const WIDTH: number = config.image.width || 2048
/**
 * Height of the generated NFT image in pixels.
 * Defaults to `2048` if not specified in `config.image.height`.
 *
 * @constant
 * @type {number}
 */
const HEIGHT: number = config.image.height || 2048

/**
 * Generates a collection of NFT images from layered assets.
 *
 * Reads layer folders in the order defined in `config.layersOrder`,
 * randomly picks one image from each folder, composes them on a canvas,
 * and saves the final PNG image to the output directory.
 *
 * Ensures all generated NFTs are unique if `allowDuplicates` is false.
 *
 * @async
 * @param {string} layersDir - Root directory containing layer folders (e.g. `layers/backdrop`, `layers/body`).
 * @param {string} outputDir - Directory where generated images will be saved.
 * @param {number} collectionSize - Number of NFTs to generate.
 * @param {boolean} [allowDuplicates=false] - Whether to allow duplicate combinations.
 * @returns {Promise<GeneratedNFT[]>} Array of generated NFTs with traits and image paths.
 *
 * @throws {Error} If a layer folder is missing or empty.
 * @throws {Error} If requested collection size exceeds unique combinations.
 *
 * @example
 * ```ts
 * const results = await generateImages("layers", "collection", 10, false);
 * console.log(results[0]);
 * // {
 * //   id: 1,
 * //   traits: [
 * //     { trait: "backdrop", value: "blue", filePath: "layers/backdrop/blue.png" },
 * //     { trait: "body", value: "cat", filePath: "layers/body/cat.png" }
 * //   ],
 * //   imagePath: "collection/images/1.png"
 * // }
 * ```
 */
export async function generateImages(
  layersDir: string,
  outputDir: string,
  collectionSize: number,
  allowDuplicates: boolean = false
): Promise<GeneratedNFT[]> {
  const startTime = performance.now()

  // Get layers in configured order
  const layersOrder = config.layersOrder.map((l) => l.name)
  const layers = layersOrder.map((name) => {
    const layerPath = path.join(layersDir, name)
    const files = getFiles(layerPath)
    if (!fs.existsSync(layerPath) || files.length === 0) {
      throw new Error(`❌ Missing or empty layer folder: "${layerPath}"`)
    }
    return { name, files }
  })

  // Prepare output folder
  const imagesDir = path.join(outputDir, 'images')
  if (fs.existsSync(imagesDir)) {
    fs.rmSync(imagesDir, { recursive: true, force: true })
  }
  createDirIfMissing(imagesDir)

  // Pre-calculate total possible combinations (for uniqueness check)
  if (!allowDuplicates) {
    const totalCombinations = layers.reduce((acc, layer) => acc * layer.files.length, 1)
    console.log('🧮 Number of layer variants:')
    layers.forEach((layer) => console.log(` - ${layer.name}: ${layer.files.length}`))
    console.log(`🔢 Total possible combinations: ${totalCombinations}`)

    if (collectionSize > totalCombinations) {
      throw new Error(
        `❌ Cannot generate ${collectionSize} unique NFTs — only ${totalCombinations} combinations possible.`
      )
    }
  }

  const results: GeneratedNFT[] = []
  const generatedCombinations = new Set<string>()

  console.log(`\n🎲 Generation settings:`)
  console.log(` - Collection size: ${collectionSize}`)
  console.log(` - Duplicated allowed: ${allowDuplicates}`)
  console.log(` - Collection dimentions: ${HEIGHT} X ${WIDTH}\n`)

  // NFT generation loop
  for (let i = 1; i <= collectionSize; i++) {
    let unique = false
    let traits: Trait[] = []
    let combinationKey = ''
    let attempts = 0

    while (!unique) {
      attempts++

      traits = layers.map((layer) => {
        const randomFile = layer.files[Math.floor(Math.random() * layer.files.length)]
        const filePath = path.join(layersDir, layer.name, randomFile)
        return {
          trait: layer.name,
          value: path.parse(randomFile).name,
          filePath,
        }
      })

      combinationKey = traits.map((t) => `${t.trait}:${t.value}`).join('|')

      if (!allowDuplicates && generatedCombinations.has(combinationKey)) {
        console.log(`⚠️ Duplicate detected for NFT #${i}, regenerating...`)
        continue
      }

      generatedCombinations.add(combinationKey)
      unique = true
    }

    // Draw image layers on canvas
    const canvas = createCanvas(WIDTH, HEIGHT)
    const ctx = canvas.getContext('2d')

    const images = await Promise.all(traits.map((t) => loadImage(t.filePath)))
    images.forEach((img) => ctx.drawImage(img, 0, 0, WIDTH, HEIGHT))

    // Save image
    const imagePath = path.join(imagesDir, `${i}.png`)
    const buffer = canvas.toBuffer('image/png')
    await fs.promises.writeFile(imagePath, buffer)

    results.push({ id: i, traits, imagePath })

    // ETA estimation
    const elapsed = (performance.now() - startTime) / 1000
    const avgPerNFT = elapsed / i
    const remaining = (collectionSize - i) * avgPerNFT

    console.log(
      `✅ NFT #${i} created (${attempts} attempts) | ETA: ~${remaining.toFixed(
        1
      )}s left | Traits: ${traits.map((t) => `${t.trait}: ${t.value}`).join(', ')}`
    )
  }

  // Summary
  const totalSeconds = ((performance.now() - startTime) / 1000).toFixed(2)
  const avgPerNFT = (Number(totalSeconds) / collectionSize).toFixed(2)

  console.log('\n⏱️ Generation summary:')
  console.log(` - NFTs created: ${collectionSize}`)
  console.log(` - Total time: ${totalSeconds}s`)
  console.log(` - Average per NFT: ${avgPerNFT}s\n`)

  return results
}
