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
import { requireConfig } from '../config/config.js';
import { randomInt } from 'crypto';

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
        this.config = requireConfig();
        this.ctx = {
			config: {
				identityKey: null,
				listen: null
			},
			peers: [],
			peerHandlers: [],
			messageHistory: [],
			libp2p: null
		}
    }

    async init(ctx) {
        let id = randomInt(1000000)
        if (!ctx){
            if (!this.config){
                this.config = requireConfig();
            }
            if (this.config.identityKey){
                this.ctx.config.identityKey = this.config.identityKey;
            }
            else{
                this.ctx.config.identityKey = null;
            }
            if (this.config.listen){
                this.ctx.config.listen = this.config.listen
            }
            else{
                this.ctx.config.listen = ["/ip4/0.0.0.0/tcp/0"]
            }
            if (this.config.peers){
                this.ctx.peers = this.config.peers
            }
            else{
                this.ctx.peers = []
            }
            if (this.config.peerHandlers){
                this.ctx.peerHandlers = this.config.peerHandlers
            }
            else{
                this.ctx.peerHandlers = []
            }
            if (this.config.messageHistory){
                this.ctx.messageHistory = this.config.messageHistory
            }
            else{
                this.ctx.messageHistory = []
            }
            await this.libp2pKit.init(this.ctx);
            // this.ctx.libp2p = await createLibp2p({
            //     peerId: this.ctx.config.identityKey
            //         ? await createFromPrivKey(deriveKeyPair(this.ctx.config.identityKey))
            //         : undefined,
            //     addresses: {
            //         listen: this.ctx.config.listen
            //     },
            //     transports: [
            //         tcp(),
            //         webSockets()
            //     ],
            //     streamMuxers: [
            //         mplex()
            //     ],
            //     connectionEncryption: [
            //         noise()
            //     ]
            // })
        }
        else{
            this.ctx = ctx;
            if (!this.ctx.config.identityKey){
                this.ctx.config.identityKey = null;
            }
            if (!this.ctx.config.listen){
                this.ctx.config.listen = "/ip4/0.0.0.0/tcp/0"
            }
            if (!this.ctx.peers){
                this.ctx.peers = []
            }
            if (!this.ctx.peerHandlers){
                this.ctx.peerHandlers = []
            }
            if (!this.ctx.messageHistory){
                this.ctx.messageHistory = []
            }            
            await this.libp2pKit.init(this.ctx);
        }



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
    
    async test() {
        console.log('OrbitDbKit test')
        // throw new Error('OrbitDbKit test not implemented')
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