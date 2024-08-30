
export class orbitDbKitJs {
    constructor(resources, metadata) {
        this.resources = resources
        this.metadata = metadata
    }

    async init(libp2pKit, ipfsKit) {    
        this.ipfsKit = ipfsKit
        this.libp2pKit = libp2pKit
    }

    async test() {
        console.log('OrbitDbKit test')
        throw new Error('OrbitDbKit test not implemented')
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
export default orbitDbKitJs