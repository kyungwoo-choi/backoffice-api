'use strict';
// const v1 = require('uuid/v1');
import {v1} from 'uuid'

export default {
    v1(): Buffer {

        const tokens = v1().split('-');

        // const uuid = `${tokens[2]}-${tokens[1]}-${tokens[0]}-${tokens[3]}-${tokens[4]}`;
        const uuid = `${tokens[2]}${tokens[1]}${tokens[0]}${tokens[3]}${tokens[4]}`;

        return Buffer.from(uuid, 'hex');
    },
    decode(buf: Buffer): string {
        return buf.toString('hex').toLowerCase();
    },
    toBuffer(uuid: string): Buffer {
        return Buffer.from(uuid, 'hex');
    }
};
