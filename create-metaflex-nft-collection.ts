import { createNft, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    percentAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";

import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";

import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";



import { clusterApiUrl, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { promises as fs } from "fs";
import * as path from "path";

const connection = new Connection(clusterApiUrl("devnet"))


// load keypair from local file system
const user = await getKeypairFromFile()


console.log("Loaded user:", user.publicKey.toBase58());

const umi = createUmi(connection);

// convert to umi compatible keypair
const umiKeyPair = umi.eddsa.createKeypairFromSecretKey(user.secretKey)

umi.use(keypairIdentity(umiKeyPair)).use(mplTokenMetadata()).use(irysUploader());

const collectionImagePath = path.resolve('public', 'collection.png');

const buffer = await fs.readFile(collectionImagePath);
let file = createGenericFile(buffer, collectionImagePath, {
    contentType: "image/png",
});
let imageUri;
try {
    const [image] = await umi.uploader.upload([file]);
    imageUri = image;
    console.log("image uri:", image);
    
}
catch (e) {
    console.log("Error : ",e)
}

const uri = await umi.uploader.uploadJson({
    name: "Deep panchal",
    symbol: "DP",
    description: "nothing private here",
    imageUri
});
console.log("Collection offchain metadata URI:", uri);


const collectionMint = generateSigner(umi)


// create and mint NFT
await createNft(umi, {
    mint: collectionMint,
    name: "Deep panchal",
    uri,
    updateAuthority: umi.identity.publicKey,
    sellerFeeBasisPoints: percentAmount(0),
    isCollection: true,
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink(
    "address",
    collectionMint.publicKey,
    "devnet",
);
console.log(`Collection NFT:  ${explorerLink}`);
console.log(`Collection NFT address is:`, collectionMint.publicKey);
console.log("✅ Finished successfully!");