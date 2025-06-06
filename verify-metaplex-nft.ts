/**
 When you create an NFT and assign it to a collection, it's initially unverified — meaning:

    The NFT may claim it belongs to a collection,

    But that claim hasn’t been cryptographically signed or confirmed on-chain.

 
 
 */



import {
    findMetadataPda,
    mplTokenMetadata,
    verifyCollectionV1,
} from "@metaplex-foundation/mpl-token-metadata";
import {
    keypairIdentity,
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

// create a new connection to Solana's devnet cluster
const connection = new Connection(clusterApiUrl("devnet"));

// load keypair from local file system
// assumes that the keypair is already generated using `solana-keygen new`
const user = await getKeypairFromFile();
console.log("Loaded user:", user.publicKey.toBase58());


const umi = createUmi(connection);

const umiKeypair = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiKeypair)).use(mplTokenMetadata()).use(irysUploader());

// Substitute in your collection NFT address from create-metaplex-nft-collection.ts
const collectionAddress = UMIPublicKey("CCbxXAxhBmymwrqsG4NbfXfpN4NJps1HACsRBeNDZeSm");

// Substitute in your NFT address from create-metaplex-nft.ts
const nftAddress = UMIPublicKey("F5vM7MGrxnqDBpHBd3Bk6FNG5xS1FyMpzVMdfCAjHjir");

// Verify our collection as a Certified Collection
// See https://developers.metaplex.com/token-metadata/collections
const metadata = findMetadataPda(umi, { mint: nftAddress });
await verifyCollectionV1(umi, {
    metadata,
    collectionMint: collectionAddress,
    authority: umi.identity,
}).sendAndConfirm(umi);

let explorerLink = getExplorerLink("address", nftAddress, "devnet");
console.log(`verified collection:  ${explorerLink}`);
console.log("✅ Finished successfully!");