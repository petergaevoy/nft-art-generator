# 🖼️ NFT Art Generator

A flexible and developer-friendly NFT collection generator built with **Node.js** and **TypeScript**.  
It creates **unique NFTs** from layered image assets and produces **metadata** compatible with **OpenSea** and other marketplaces.

---

## ✨ Features

- 🎨 Generate NFT images using **layered PNG assets**
- 🧩 Automatically produce **metadata files** (ERC-721 / ERC-1155 compatible)
- 🔀 Option to **allow or prevent duplicates**
- ⚙️ Define precise **layer order** via config
- 🪶 Built-in **CID updater** for metadata after IPFS upload
- 🧾 Clean TypeScript architecture with strict typing and JSDoc

---

## 📁 Project Structure

```
nft-art-generator/
├── src/
│   ├── config.ts               # Configuration (layers order, image size, etc.)
│   ├── index.ts                # Entry point
│   ├── generator/
│   │   ├── composer.ts         # NFT generation logic
│   │   └── herodotus.ts        # NFT metadata generation
│   └── utils/
│       ├── directory.ts        # Directory utilities
│       └── update-cid.ts       # CID updater for metadata
│
├── layers/                     # Source image layers (backdrop, body, outline, ...)
├── collection/
│   ├── images/                 # Generated NFT images
│   └── metadata/               # Generated metadata JSONs
│
├── package.json
└── README.md
```

---

## 🚀 Usage

### 1. Prepare Your Layers

Create the `layers` directory and subfolders for each layer:

```
layers/
├── backdrop/
│   ├── blue.png
│   └── red.png
├── body/
│   ├── cat.png
│   └── dog.png
└── ears/
    ├── short.png
    └── long.png
```

Each subfolder represents a **trait type**, and each image file is a **trait value**.

---

### 2. Configure generation preferences

Edit **`src/config.ts`** to define:
<br>1️⃣ - Collection size (number of NFTs to generate)
<br>2️⃣ - Whether duplicates are allowed
<br>3️⃣ - Image dimensions (width & height)
<br>4️⃣ - Order of image layers (from top to bottom)
<br>5️⃣ - Collection metadata constants

---

### 3. Generate NFT Collection

Run the generator:

```bash
npm run create
```

It will:

- Create `collection/images` with generated PNGs
- Create `collection/metadata` with corresponding metadata JSON files

---

### 4. Replace IPFS CID in Metadata

After uploading your images to IPFS, replace the old CID in all metadata files with the new one:

```bash
npm run replace-img-cid -- <NEW_CID>
```

Example:

```bash
npm run replace-img-cid -- myNewCID
```

This updates **only the `image` field** in metadata and does **not** modify `banner_image` or other links.

---

## 🧠 Example Metadata Output

```json
{
  "name": "Collection #1",
  "description": "Collection description",
  "external_link": "https://example.com",
  "image": "ipfs://QmPLACEHOLDER/1.png/",
  "banner_image": "ipfs://QmPLACEHOLDER_BANNER",
  "seller_fee_basis_points": 500,
  "fee_recipient": "0x1234567890abcdef1234567890abcdef12345678",
  "attributes": [
    {
      "trait": "backdrop",
      "value": "pink"
    },
    {
      "trait": "body",
      "value": "blue"
    },
    {
      "trait": "ears",
      "value": "tiffany"
    },
    {
      "trait": "outline",
      "value": "red"
    }
  ]
}
```

---

## 🧩 Scripts

| Command                            | Description                     |
| ---------------------------------- | ------------------------------- |
| `npm run create`                   | Generate NFT collection         |
| `npm run replace-img-cid -- <CID>` | Update IPFS CID inside metadata |

---

## 🧱 Tech Stack

- **Node.js** + **TypeScript**
- **canvas** — Image composition
- **fs / path** — File system utilities
- **JSDoc** — Documentation & type hints

---

## 🧾 License

MIT © 2025 — NFT Art Generator by Peter Gaevoy
