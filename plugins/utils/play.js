const yts = require('yt-search'); // npm i yt-search
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "play",
    command: [".play"],
    desc: "Cerca su YouTube e invia la canzone in mp3",

    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const query = args.join(" ");

        if (!query) {
            return await sock.sendMessage(chatId, {
                text: "❌ Uso:.play nome canzone\nEsempio:.play headshot DR4GM4SHRO0M"
            });
        }

        try {
            await sock.sendMessage(chatId, { text: `🔍 Cerco: *${query}*` });

            // 1. Cerca su YouTube
            const search = await yts(query);
            const video = search.videos[0];
            
            if (!video) {
                return await sock.sendMessage(chatId, { text: "❌ Nessun risultato trovato" });
            }

            await sock.sendMessage(chatId, { 
                text: `✅ Trovato: *${video.title}*\n⏱️ ${video.timestamp}\n⬇️ Scarico mp3...` 
            });

            // 2. Scarica con yt-dlp
            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
            
            const filePath = path.join(tempDir, `${video.videoId}.mp3`);
            const cmd = `yt-dlp -x --audio-format mp3 -o "${filePath}" "${video.url}"`;

            await new Promise((resolve, reject) => {
                exec(cmd, (error) => {
                    if (error) reject(error);
                    else resolve();
                });
            });

            // 3. Invia l'mp3
            await sock.sendMessage(chatId, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`,
                ptt: false
            });

            // cancella
            fs.unlinkSync(filePath);

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, {
                text: `❌ Errore: ${err.message}`
            });
        }
    }
}