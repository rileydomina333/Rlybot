const yts = require('yt-search'); // npm i yt-search
const ytdl = require('@distube/ytdl-core'); // npm i @distube/ytdl-core
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

            // 2. Scarica audio in mp3
            const stream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio'
            });

            const filePath = path.join(__dirname, `../temp/${video.videoId}.mp3`);
            
            // crea cartella temp se non esiste
            if (!fs.existsSync(path.join(__dirname, '../temp'))) {
                fs.mkdirSync(path.join(__dirname, '../temp'));
            }

            const writer = fs.createWriteStream(filePath);
            
            await new Promise((resolve, reject) => {
                stream.pipe(writer);
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // 3. Invia l'mp3
            await sock.sendMessage(chatId, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mpeg',
                fileName: `${video.title}.mp3`
            });

            // cancella il file dopo l'invio
            fs.unlinkSync(filePath);

        } catch (err) {
            console.error(err);
            await sock.sendMessage(chatId, {
                text: `❌ Errore: ${err.message}`
            });
        }
    }
}