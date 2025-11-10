import path from 'path'

/**
 * Represents a single image layer folder used to compose NFTs.
 */
interface Layer {
  /** Folder name of the layer (e.g. "body", "eyes", etc.) */
  name: string
}

/**
 * Describes collection-level metadata such as name, royalties, and external links.
 */
interface CollectionMetadata {
  /** Name of the NFT collection. */
  name: string
  /** Description displayed on marketplaces. */
  description: string
  /** External website or project link. */
  external_link: string
  /** IPFS CID (or URL) for the collection’s main logo image. */
  image: string
  /** IPFS CID (or URL) for the collection’s banner image. */
  banner_image: string
  /** Royalty percentage in basis points (e.g. 500 = 5%). */
  seller_fee_basis_points: number
  /** Wallet address receiving secondary sale royalties. */
  fee_recipient: string
  /** Total NFT supply (for display or contract sync). */
  supply: number
}

/**
 * Global configuration interface for the NFT Art Generator.
 */
export interface Config {
  /** Absolute path to the directory containing all layer folders. */
  layersDir: string
  /** Absolute path where generated images and metadata will be saved. */
  outputDir: string
  /** Total number of NFTs to generate. */
  totalNFTs: number
  /** Whether duplicate NFT combinations are allowed. */
  allowDuplicates: boolean
  /** NFT image size configuration. */
  image: {
    width: number
    height: number
  }
  /** Ordered list of layers defining the visual composition. */
  layersOrder: Layer[]
  /** Metadata describing the NFT collection. */
  collection: CollectionMetadata
}

/**
 * Global configuration for the NFT Art Generator.
 *
 * Defines directories, image parameters, layer order, and collection metadata.
 *
 * @example
 * ```ts
 * import { config } from "./config";
 * console.log(config.layersOrder.map(l => l.name));
 * ```
 */
export const config: Config = {
  // Directories
  layersDir: path.resolve('layers'),
  outputDir: path.resolve('collection'),

  // Generation Settings
  totalNFTs: 10,
  allowDuplicates: false,

  // Image Configuration
  image: {
    height: 2048,
    width: 2048,
  },

  // Layer Composition Order
  layersOrder: [{ name: 'backdrop' }, { name: 'body' }, { name: 'ears' }, { name: 'outline' }],

  // Collection Metadata
  collection: {
    name: 'Test Collection',
    description: 'Collection description',
    external_link: 'https://example.com',
    image: 'ipfs://QmPLACEHOLDER',
    banner_image: 'ipfs://QmPLACEHOLDER_BANNER',
    seller_fee_basis_points: 500, // 5%
    fee_recipient: '0x1234567890abcdef1234567890abcdef12345678',
    supply: 10,
  },
}
