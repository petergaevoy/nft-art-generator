import { readdirSync } from "fs";
import path from "path";

console.log("NFT Art Generator started 🖼️");

const layersDir = path.join(process.cwd(), "layers");
console.log("Available layers:", readdirSync(layersDir));