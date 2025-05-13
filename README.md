# 🧱 Metaplex NFT Collection on Solana Devnet

This project demonstrates how to create a Collection NFT on Solana using the Metaplex `umi` SDK, mint an individual NFT that belongs to that collection, and verify it on-chain.

> ⚠️ This runs on **Solana Devnet** for testing purposes.

---

## 📦 Tech Stack

- **Solana Web3.js** – Blockchain interaction
- **Metaplex UMI SDK** – NFT minting and collection utilities
- **Irys (Bundlr)** – Off-chain storage for image and metadata
- **TypeScript** – Runtime scripting
- **Node.js** – Script runner
- **esrun** – Native ES module runner for TS files

---

## 📁 Project Structure

```bash
metaflex-nft-lab/
├── public/
│   └── collection.png           # Collection image
├── create-metaplex-collection.ts  # Script to create collection NFT
├── create-metaplex-nft.ts         # Script to mint an NFT
├── verify-metaplex-nft.ts         # Script to verify NFT belongs to collection
└── README.md                      # You are here ✅
