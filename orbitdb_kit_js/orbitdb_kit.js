import libp2pKit from './libp2p_kit.js'


export class OrbitDBKit {
    constructor(ipfs, orbitdb) {
        this.ipfs = ipfs
        this.orbitdb = orbitdb
    }

    async init() {    

    }

    async createDB(dbName, dbType) {
        let db = await this.orbitdb.create(dbName, dbType)
        return db
    }

    async openDB(dbName) {
        let db = await this.orbitdb.open(dbName)
        return db
    }
}

