import { libp2pKitJs } from 'libp2p_kit_js'
import { LevelBlockstore } from 'blockstore-level'
import { LevelDatastore } from "datastore-level";
import { createHelia } from 'helia';
import { bitswap } from '@helia/block-brokers'
import { createOrbitDB, Identities, OrbitDBAccessController } from '@orbitdb/core'
import { EventEmitter } from "events";
import asn1js from "asn1js";
import pvtsutils from "pvtsutils";
import pvutils from "pvutils";

export class orbitDbKitJs {
    constructor( resources, metadata) {
        this.libp2pKit = new libp2pKitJs(resources, metadata);
        this.blockstore = null;
        this.datastore = null;
        this.ipfs = null;
        this.identities = null;
        this.identity = null;
        this.orbitdb = null;
        this.db = null;
    }

    async init(id) {
        await this.libp2pKit.init();
        this.blockstore = new LevelBlockstore(`./ipfs/`+id+`/blocks`);
        this.datastore = new LevelDatastore(`./ipfs/`+id+`/datastore`);
        this.ipfs = await createHelia({blockstore: this.blockstore, libp2p: this.libp2p, datastore: this.datastore, blockBrokers: [bitswap()]})
        this.identities = await Identities({ ipfs, path: `./orbitdb/`+id+`/identities` })
        this.identity = await this.identities.createIdentity({ id })
        this.orbitdb = await createOrbitDB(this.ipfs, { identity: this.identity, accessController: OrbitDBAccessController })
        this.db = await orbitdb.open(swarmName+"-"+index+"-of-"+chunkSize,
            {type: 'documents',
                AccessController: OrbitDBAccessController({ write: ["*"], sync: false}),
            })
        let oldHeads = await db.log.heads()
    }

    async close() {
        await this.libp2pKit.close()
        this.handleTerminationSignal()
    }

    async handleTerminationSignal() {
        console.info('received termination signal, cleaning up and exiting...');
        await this.db.close()
        await this.orbitdb.stop()
        await this.ipfs.stop()
        process.exit();
    }
}

export default orbitDbKitJs

if (import.meta.url === 'file://' + process.argv[1]) {
    console.log("Running test");
    let test_results = {};
    try{
        const testOrbitDbKitJs = new orbitDbKitJs();
        await testOrbitDbKitJs.init().then((init) => {
            test_results.init = init;
            console.log("testOrbitDbKitJs init: ", init);
            testOrbitDbKitJs.test().then((result) => {
                test_results.results = result;
                console.log("testOrbitDbKitJs: ", result);
            }).catch((error) => {
                test_results.results = error;
                console.log("testOrbitDbKitJs error: ", error);
                // throw error;
            });
        }).catch((error) => {
            testOrbitDbKitJs.init = error ;
            console.error("testOrbitDbKitJs init error: ", error);
            // throw error;
            testOrbitDbKitJs.test().then((result) => {
                test_results.results = result;
                console.log("testOrbitDbKitJs: ", result);
            }).catch((error) => {
                test_results.results = error;
                console.log("testOrbitDbKitJs error: ", error);
                // throw error;
            });
        });
    } catch (error) {
        console.error("testOrbitDbKitJs error: ", error);
        test_results.error = error;
    }
}