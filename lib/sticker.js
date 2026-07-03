import { writeFile } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'

const execAsync = promisify(exec)

export async function sticker(buffer, isVideo = false, packname, author) {
    if (!Buffer.isBuffer(buffer)) throw new Error('Input non è un buffer')
    
    const tmp = join(tmpdir(), `${Date.now()}`)
    
    try {
        if (isVideo || buffer.toString('utf8').includes('WEBM') || buffer.toString('utf8').includes('MP4')) {
            // Video/GIF → Webp animato
            await writeFile(`${tmp}.mp4`, buffer)
            await execAsync(`ffmpeg -i ${tmp}.mp4 -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -t 10 -r 10 -loop 0 ${tmp}.webp`)
            const webpBuffer = await sharp(`${tmp}.webp`).webp().toBuffer()
            return webpBuffer
        } else {
            // Foto → Webp statico
            const webpBuffer = await sharp(buffer)
                .resize(512, 512, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 }
                })
                .webp()
                .toBuffer()
            return webpBuffer
        }
    } catch (e) {
        throw e
    }
}