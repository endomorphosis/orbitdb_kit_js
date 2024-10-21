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


import {createLibp2p} from 'libp2p'
import {identify} from '@libp2p/identify'
import {gossipsub} from '@chainsafe/libp2p-gossipsub'
import {tcp} from '@libp2p/tcp'
import {mdns} from '@libp2p/mdns'
import { webSockets } from '@libp2p/websockets';
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { bootstrap } from '@libp2p/bootstrap'
import { floodsub } from '@libp2p/floodsub'
import { kadDHT, removePublicAddressesMapper } from '@libp2p/kad-dht'
import { peerIdFromString } from '@libp2p/peer-id'
import { pubsubPeerDiscovery } from '@libp2p/pubsub-peer-discovery'
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2'
import { all } from '@libp2p/websockets/filters'
import { ping } from '@libp2p/ping'
import { webRTC } from '@libp2p/webrtc';



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
			libp2p: null,
            dbname: null
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
            if (this.config.dbname){
                this.ctx.dbname = this.config.dbname
            }
            else{
                this.ctx.dbname = "test"
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
            if (!this.ctx.dbname){
                this.ctx.dbname = "test"
            }            
            await this.libp2pKit.init(this.ctx);
        }


        // let blockstore = new LevelBlockstore(`./ipfs/`+id+`/blocks`);
        // this.blockstore = blockstore;
        // let datastore = new LevelDatastore(`./ipfs/`+id+`/datastore`);
        // this.datastore = datastore;
        // this.ctx.libp2p.addEventListener("peer:connect", event => {
        //     console.log('connected', event.detail)
        // })
        // let ipfs = await createHelia({blockstore: blockstore, libp2p: this.ctx.libp2p, datastore: datastore, blockBrokers: [bitswap()]})
        // this.ipfs = ipfs
        // ipfs.libp2p.addEventListener("peer:connect", event => {
        //     console.log('connected', event.detail)
        // })
        // let identities = await Identities({ ipfs, path: `./orbitdb/`+id+`/identities` })
        // this.identities = identities
        // let identity = await identities.createIdentity({ id })
        // this.identity = identity
        // let orbitdb = await createOrbitDB({ipfs: ipfs, identities, id: id, directory: `./orbitdb/`+id})
        // this.orbitdb = orbitdb 

        // this.orbitdb = await createOrbitDB(ipfs, { identity: identity, accessController: OrbitDBAccessController })
        // let db = await orbitdb.open(this.ctx.dbname,
        //     {type: 'documents',
        //         AccessController: OrbitDBAccessController({ write: ["*"], sync: false}),
        //     })
        // this.db = db
        // let oldHeads = await db.log.heads()
        // this.oldHeads = oldHeads

        const ipfsLibp2pOptions = {
            addresses: {
                listen: ['/ip4/0.0.0.0/tcp/0']
            },
            transports: [
                tcp(),
                webSockets({
                    // filter: all
                }),
                // webRTC(),
                circuitRelayTransport({
                    discoverRelays: 1
                })
            ],
            streamMuxers: [
                yamux(),
                mplex()
            ],
            connectionEncryption: [
                noise()
            ],
            peerDiscovery: [
                mdns({
                    interval: 20e3
                }),
                pubsubPeerDiscovery({
                    interval: 1000
                }),
                bootstrap({
                    list: bootstrappers
                })
            ],
            services: {
                lanDHT: kadDHT({
                    protocol: '/ipfs/lan/kad/1.0.0',
                    peerInfoMapper: removePublicAddressesMapper,
                    clientMode: false
                }),
                pubsub:
                    gossipsub({
                        allowPublishToZeroPeers: true
                    }),
                identify: identify(),
                ping: ping({
                    protocolPrefix: 'ipfs', // default
                }),
            },
            connectionManager: {

            }
        }
        const libp2p = await createLibp2p({  addresses: {
            //listen: [`/ip4/${ipAddress}/tcp/0`]
            listen: ['/ip4/0.0.0.0/tcp/0']
            }, ...ipfsLibp2pOptions})
        const blockstore = new LevelBlockstore(`./ipfs/`+id+`/blocks`)
        const datastore = new LevelDatastore(`./ipfs/`+id+`/datastore`);
        const ipfs = await createHelia({blockstore: blockstore, libp2p: libp2p, datastore: datastore, blockBrokers: [bitswap()]})
        const identities = await Identities({ ipfs, path: `./orbitdb/`+id+`/identities` })
        const identity = identities.createIdentity({ id })
        ipfs.libp2p.addEventListener("peer:connect", event => {
            console.log('connected', event.detail)
        })

        const orbitdb = await createOrbitDB({ipfs: ipfs, identities, id: id, directory: `./orbitdb/`+id})

        const db = await orbitdb.open(this.ctx.dbname,
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