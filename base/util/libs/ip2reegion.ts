/*
 * Created by Wu Jian Ping on - 2022/07/22.
 */

import {App} from "../../App";

const fs = require('fs')

const VectorIndexSize = 8
const VectorIndexCols = 256
const VectorIndexLength = 256 * 256 * (4 + 4)
const SegmentIndexSize = 14
const IP_REGEX = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/

const getStartEndPtr = Symbol('#getStartEndPtr')
const getBuffer = Symbol('#getBuffer')
const openFilePromise = Symbol('#openFilePromise')

export const getIpSearcher = (dbPath)=>{
    const stats = fs.statSync(dbPath)
    const buffer = Buffer.alloc(stats.size)
    const fd = fs.openSync(dbPath, 'r')
    fs.readSync(fd, buffer, 0, stats.size, 0)
    fs.close(fd,function(){})

    return new IpSearcher(null, null, buffer)

}
export class IpSearcher {
    private _dbFile: any;
    private _vectorIndex: any;
    private _buffer: any;
    // 直接加载进缓存
    constructor (dbFile, vectorIndex, buffer) {
        this._dbFile = dbFile
        this._vectorIndex = vectorIndex
        this._buffer = buffer

        if (this._buffer) {
            this._vectorIndex = this._buffer.subarray(256, 256 + VectorIndexLength)
        }


    }


    async [getStartEndPtr] (idx, fd, ioStatus) {
        if (this._vectorIndex) {
            const sPtr = this._vectorIndex.readUInt32LE(idx)
            const ePtr = this._vectorIndex.readUInt32LE(idx + 4)
            return { sPtr, ePtr }
        } else {
            const buf = await this[getBuffer](256 + idx, 8, fd, ioStatus)
            const sPtr = buf.readUInt32LE()
            const ePtr = buf.readUInt32LE(4)
            return { sPtr, ePtr }
        }
    }

    async [getBuffer] (offset, length, fd, ioStatus) {
        if (this._buffer) {
            return this._buffer.subarray(offset, offset + length)
        } else {
            const buf = Buffer.alloc(length)
            return new Promise((resolve, reject) => {
                ioStatus.ioCount += 1
                fs.read(fd, buf, 0, length, offset, (err) => {
                    if (err) {
                        reject(err)
                    } else {
                        resolve(buf)
                    }
                })
            })
        }
    }

    [openFilePromise] (fileName) {
        return new Promise((resolve, reject) => {
            fs.open(fileName, 'r', (err, fd) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(fd)
                }
            })
        })
    }

    async searchCity (ip) {
        let  result = await this.search(ip);
        let str = "中国|0|上海|上海市|电信"
        let [country,stat,province,city,channel] = result.region.split("|");
        return {country,stat,province,city,channel}
    }
    async search (ip) {
        const startTime = process.hrtime()
        const ioStatus = {
            ioCount: 0
        }

        if (!isValidIp(ip)) {
            // throw new Error(`IP: ${ip} is invalid`)
            return { region: "", ioCount:0, took:0 }
        }

        let fd = null

        if (!this._buffer) {
            fd = await this[openFilePromise](this._dbFile)
        }

        const ps = ip.split('.')
        const i0 = parseInt(ps[0])
        const i1 = parseInt(ps[1])
        const i2 = parseInt(ps[2])
        const i3 = parseInt(ps[3])

        const ipInt = i0 * 256 * 256 * 256 + i1 * 256 * 256 + i2 * 256 + i3
        const idx = i0 * VectorIndexCols * VectorIndexSize + i1 * VectorIndexSize
        const { sPtr, ePtr } = await this[getStartEndPtr](idx, fd, ioStatus)
        let l = 0
        let h = (ePtr - sPtr) / SegmentIndexSize
        let result = null

        while (l <= h) {
            const m = (l + h) >> 1

            const p = sPtr + m * SegmentIndexSize

            const buff = await this[getBuffer](p, SegmentIndexSize, fd, ioStatus)

            const sip = buff.readUInt32LE(0)

            if (ipInt < sip) {
                h = m - 1
            } else {
                const eip = buff.readUInt32LE(4)
                if (ipInt > eip) {
                    l = m + 1
                } else {
                    const dataLen = buff.readUInt16LE(8)
                    const dataPtr = buff.readUInt32LE(10)
                    const data = await this[getBuffer](dataPtr, dataLen, fd, ioStatus)
                    result = data.toString('utf-8')
                    break
                }
            }
        }
        if (fd) {
            fs.close(fd,function(){})
        }

        const diff = process.hrtime(startTime)

        const took = (diff[0] * 1e9 + diff[1]) / 1e3
        return { region: result, ioCount: ioStatus.ioCount, took }
    }
}

const _checkFile = dbPath => {
    let res1 = App.SystemUtil.safeRunFunc(()=>{
        fs.accessSync(dbPath, fs.constants.F_OK)
    },this)
    if(!res1){
        throw new Error(`${dbPath} does not exist`)
    }
    res1= App.SystemUtil.safeRunFunc(()=>{
        fs.accessSync(dbPath, fs.constants.R_OK)
        return true;
    },this)
    if(!res1){
        throw new Error(`${dbPath} is not readable`)
    }


}

const isValidIp = ip => {
    return IP_REGEX.test(ip)
}

const newWithFileOnly = dbPath => {
    _checkFile(dbPath)

    return new IpSearcher(dbPath, null, null)
}

const newWithVectorIndex = (dbPath, vectorIndex) => {
    _checkFile(dbPath)

    if (!Buffer.isBuffer(vectorIndex)) {
        throw new Error('vectorIndex is invalid')
    }

    return new IpSearcher(dbPath, vectorIndex, null)
}


const loadVectorIndexFromFile = dbPath => {
    const fd = fs.openSync(dbPath, 'r')
    const buffer = Buffer.alloc(VectorIndexLength)
    fs.readSync(fd, buffer, 0, VectorIndexLength, 256)
    fs.close(fd,function(){})
    return buffer
}




