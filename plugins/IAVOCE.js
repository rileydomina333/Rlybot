import fetch from 'node-fetch';
import googleTTS from 'google-tts-api';
import { unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `Usa: *${usedPrefix + command}* <testo>\nEsempio: *${usedPrefix + command}* ciao come stai`;

    try {
        // Genera link audio con google-tts-api
        const url = googleTTS.getAudioUrl(text, {
            lang: 'it', // lingua italiano
            slow: false,
            host: 'https://translate.google.com',
        });

        // Scarica l'mp3
        const res = await fetch(url);
        const buffer = await res.buffer();
        
        // Salva temporaneo
        const filePath = join('./tmp', `tts-${Date.now()}.mp3`);
        writeFileSync(filePath, buffer);

        // Invia vocale
        await conn.sendFile(m.chat, filePath, 'audio.mp3', null, m, true, {
            type: 'audioMessage',
            ptt: true
        });

        // Cancella file
        unlinkSync(filePath);

    } catch (e) {
        console.log(e);
        throw '❌ Errore nel generare il vocale. Riprova';
    }
}

handler.help = ['iavoce <testo>'];
handler.tags = ['ai'];
handler.command = /^(iavoce|voceai)$/i;

export default handler;