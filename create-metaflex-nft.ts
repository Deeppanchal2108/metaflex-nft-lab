import {
    createNft,
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    createGenericFile,
    generateSigner,
    keypairIdentity,
    percentAmount,
    publicKey as UMIPublicKey,
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
// create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const user = await getKeypairFromFile();
console.log("Loaded user:", user.publicKey.toBase58());

await airdropIfRequired(
    connection,
    user.publicKey,
    1 * LAMPORTS_PER_SOL,
    0.1 * LAMPORTS_PER_SOL,
);

const umi = createUmi(connection);

// convert to umi compatible keypair
const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);

// load our plugins and signer
umi
    .use(keypairIdentity(umiKeypair))
    .use(mplTokenMetadata())
    .use(irysUploader());


// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collectionNftAddress = UMIPublicKey("CCbxXAxhBmymwrqsG4NbfXfpN4NJps1HACsRBeNDZeSm");

// example data and metadata for our NFT
const nftData = {
    name: "Strange image",
    symbol: "SI",
    description: "Nothing serious ",
    sellerFeeBasisPoints: 0,
    imageFile: "nft.png",
};

const NFTImagePath = path.resolve("public", "nft.png");

const buffer = await fs.readFile(NFTImagePath);
let file = createGenericFile(buffer, NFTImagePath, {
    contentType: "image/png",
});

// upload image and get image uri
const [image] = await umi.uploader.upload([file]);
console.log("image uri:", image);

// upload offchain json using irys and get metadata uri
const uri = await umi.uploader.uploadJson({
    name: "Strange image",
    symbol: "SI",
    description: "Nothing serious ",
    image,
});
console.log("NFT offchain metadata URI:", uri);


// generate mint keypair
const mint = generateSigner(umi);

// create and mint NFT
await createNft(umi, {
    mint,
    name: "Strange image",
    symbol: "SI",
    uri,
    updateAuthority: umi.identity.publicKey,
    sellerFeeBasisPoints: percentAmount(0),
    collection: {
        key: collectionNftAddress,
        verified: false,
    },
}).sendAndConfirm(umi, { send: { commitment: "finalized" } });

let explorerLink = getExplorerLink("address", mint.publicKey, "devnet");
console.log(`Token Mint:  ${explorerLink}`);
/*
image uri: https://gateway.irys.xyz/GjrXwf1AyF9PKfMiUnte96WLN866YWQZS6XC49wttsdu
NFT offchain metadata URI: https://gateway.irys.xyz/Db6Ypv4QWnC3564TykaMVxcu4tWz66hC13i3T8R3G776
Token Mint:  https://explorer.solana.com/address/F5vM7MGrxnqDBpHBd3Bk6FNG5xS1FyMpzVMdfCAjHjir?cluster=devnet 
*/