import fs from 'fs';
import { TextEncoder, TextDecoder } from 'util';

const getFile = (filename: string): File => {
    const path = `${__dirname}/../images/${filename}`
    const buffer = fs.readFileSync(path);

    return new File([buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
    )], filename, {
        type: 'image/png',
    })
}

import {
    PngInfoReader,
    PngInfoReaderChunkEventParameter,
} from '~/assets/scripts/PngInfoReader'

describe('PngInfoReader', () => {
    beforeAll(() => {
        if (typeof globalThis.TextEncoder === 'undefined') {
            globalThis.TextEncoder = TextEncoder;
        }
        
        if (typeof globalThis.TextDecoder === 'undefined') {
            // globalThis.TextDecoder = TextDecoder;
            Object.assign(globalThis, {
                TextDecoder: TextDecoder,
            });
        }
    })

    test('read normal 1', async () => {
        const reader = new PngInfoReader()

        await reader.read(getFile('PngInfoReader.ts.1.png'))
    })

    test('read normal 2', async () => {
        const reader = new PngInfoReader()

        reader.addEventListener('end', () => {
        })
        reader.addEventListener('error', () => {
        })
        reader.addEventListener('start', () => {
        })
        reader.addEventListener('chunk', (chunkInfo:PngInfoReaderChunkEventParameter) => {
        })

        await reader.read(getFile('PngInfoReader.ts.1.png'))
    })

    test('read undefined 1', async () => {
        const reader = new PngInfoReader()

        await reader.read(undefined).catch(() => {
        })
    })

    test('read undefined 2', async () => {
        const reader = new PngInfoReader()

        reader.addEventListener('end', () => {
        })
        reader.addEventListener('error', () => {
        })
        reader.addEventListener('start', () => {
        })
        reader.addEventListener('chunk', (chunkInfo:PngInfoReaderChunkEventParameter) => {
        })

        await reader.read(undefined).catch(() => {
        })
    })

    test('read not png file 1', async () => {
        const reader = new PngInfoReader()

        await reader.read(getFile('PngInfoReader.ts.2.jpg'))
    })

    test('read not png file 2', async () => {
        const reader = new PngInfoReader()

        reader.addEventListener('end', () => {
        })
        reader.addEventListener('error', () => {
        })
        reader.addEventListener('start', () => {
        })
        reader.addEventListener('chunk', (chunkInfo:PngInfoReaderChunkEventParameter) => {
        })

        await reader.read(getFile('PngInfoReader.ts.2.jpg'))
    })
})
