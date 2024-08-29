import libp2pKit from './libp2p_kit.js'
import orbitdbKit from './orbitdb_kit.js'
import websocketKit from './websocket_kit.js'

export class Main {
    constructor() {
        this.libp2pKit = new libp2pKit()
        this.websocketKit = new websocketKit()
        this.orbitdbKit = new orbitdbKit()
    }

    async init() {
        await this.libp2pKit.init()
        await this.websocketKit.init()
        await this.orbitdbKit.init()
    }

    async close() {
        await this.libp2pKit.close()
        await this.orbitdbKit.close()
        await this.websocketKit.close()
    }
}

export default Main