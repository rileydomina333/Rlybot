import yts from 'yt-search';

const CHATUNITY_API = 'https://api.chatunity.it/download/play';
const WEIRDDL_API = 'https://weirddl.sbs/api/download';

const getYoutubeInfo = async (url) => {
    try {
        const search = await yts(url);
        const videos = search.videos || [];

        return videos.find(v => v.url === url) || videos[0] || null;
    } catch {
        return null;
    }
};

const chatunity = async (url) => {
    const apiUrl = `${CHATUNITY_API}?query=${encodeURIComponent(url)}`;

    console.log('[CHATUNITY]', apiUrl);

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    });

    const raw = await response.text();

    console.log('[CHATUNITY STATUS]', response.status);
    console.log('[CHATUNITY RESPONSE]', raw);

    let data;

    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error(`ChatUnity risposta non valida: HTTP ${response.status}`);
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `ChatUnity HTTP ${response.status}`
        );
    }

    if (!data.success) {
        throw new Error(
            data.message ||
            data.error ||
            'ChatUnity download fallito'
        );
    }

    if (!data.downloadUrl) {
        throw new Error('ChatUnity non ha restituito downloadUrl');
    }

    return {
        url: data.downloadUrl,
        provider: 'ChatUnity'
    };
};

const weirdDL = async (url) => {
    const apiUrl = `${WEIRDDL_API}?url=${encodeURIComponent(url)}`;

    console.log('[WEIRDDL]', apiUrl);

    const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
            Accept: '*/*',
            'User-Agent': 'Mozilla/5.0'
        }
    });

    console.log('[WEIRDDL STATUS]', response.status);
    console.log(
        '[WEIRDDL CONTENT-TYPE]',
        response.headers.get('content-type')
    );

    if (!response.ok) {
        const raw = await response.text();

        let message = raw;

        try {
            const data = JSON.parse(raw);

            message =
                data.message ||
                data.error ||
                data.code ||
                raw;
        } catch {}

        throw new Error(
            `WeirdDL HTTP ${response.status}: ${message}`
        );
    }

    const contentType =
        response.headers.get('content-type') || '';

    if (
        contentType.includes('video/') ||
        contentType.includes('audio/') ||
        contentType.includes('application/octet-stream')
    ) {
        const arrayBuffer = await response.arrayBuffer();

        return {
            buffer: Buffer.from(arrayBuffer),
            provider: 'WeirdDL',
            contentType
        };
    }

    const raw = await response.text();

    let data;

    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error(
            'WeirdDL ha restituito una risposta non riconosciuta'
        );
    }

    if (data.url) {
        return {
            url: data.url,
            provider: 'WeirdDL'
        };
    }

    if (data.downloadUrl) {
        return {
            url: data.downloadUrl,
            provider: 'WeirdDL'
        };
    }

    if (data.media?.url) {
        return {
            url: data.media.url,
            provider: 'WeirdDL'
        };
    }

    if (Array.isArray(data.medias) && data.medias.length) {
        const media =
            data.medias.find(x =>
                x.type === 'video'
            ) ||
            data.medias.find(x =>
                x.type === 'audio'
            ) ||
            data.medias[0];

        if (media?.url) {
            return {
                url: media.url,
                provider: 'WeirdDL'
            };
        }
    }

    throw new Error(
        'WeirdDL non ha restituito un URL di download'
    );
};

const getFile = async (url) => {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    });

    if (!response.ok) {
        throw new Error(
            `Download file fallito: HTTP ${response.status}`
        );
    }

    const arrayBuffer = await response.arrayBuffer();

    return {
        buffer: Buffer.from(arrayBuffer),
        contentType:
            response.headers.get('content-type') || ''
    };
};

const downloadMedia = async (youtubeUrl, mode) => {
    try {
        console.log('[DOWNLOAD] Provo ChatUnity');

        const result = await chatunity(youtubeUrl);

        console.log(
            '[DOWNLOAD] ChatUnity OK'
        );

        const file = await getFile(result.url);

        return {
            buffer: file.buffer,
            contentType: file.contentType,
            provider: 'ChatUnity'
        };
    } catch (error) {
        console.error(
            '[CHATUNITY FALLBACK]',
            error.message
        );
    }

    try {
        console.log('[DOWNLOAD] Provo WeirdDL');

        const result = await weirdDL(youtubeUrl);

        console.log(
            '[DOWNLOAD] WeirdDL OK'
        );

        if (result.buffer) {
            return {
                buffer: result.buffer,
                contentType: result.contentType || '',
                provider: 'WeirdDL'
            };
        }

        if (result.url) {
            const file = await getFile(result.url);

            return {
                buffer: file.buffer,
                contentType: file.contentType,
                provider: 'WeirdDL'
            };
        }

        throw new Error(
            'WeirdDL non ha fornito un file'
        );
    } catch (error) {
        console.error(
            '[WEIRDDL ERROR]',
            error.message
        );

        throw new Error(
            `ChatUnity e WeirdDL hanno fallito.\n\n${error.message}`
        );
    }
};

let handler = async (
    m,
    {
        conn,
        text,
        usedPrefix,
        command
    }
) => {
    if (!text) {
        return m.reply(
            `⚡ *𝑵𝑰𝑮𝑮𝑨-𝑩𝑶𝑻*\n\n` +
            `💡 Usa:\n` +
            `${usedPrefix}play nome canzone`
        );
    }

    try {
        const cmd = command.toLowerCase();

        let youtubeUrl = text.trim();
        let title = 'YouTube';
        let duration = '';
        let thumbnail = null;

        if (!/^https?:\/\//i.test(youtubeUrl)) {
            const search = await yts(youtubeUrl);
            const vid = search.videos?.[0];

            if (!vid) {
                return m.reply(
                    '❌ *Nessun risultato trovato.*'
                );
            }

            youtubeUrl = vid.url;
            title = vid.title || 'Senza titolo';
            duration = vid.timestamp || '';
            thumbnail = vid.thumbnail || null;
        } else {
            const vid = await getYoutubeInfo(
                youtubeUrl
            );

            if (vid) {
                title = vid.title || title;
                duration = vid.timestamp || '';
                thumbnail = vid.thumbnail || null;
            }
        }

        if (cmd === 'play') {
            const caption =
                `┏━━━━━━━━━━━━━━━━━━━┓\n` +
                `   🎧 *𝙋𝙇𝘼𝙔 𝑵𝑰𝑮𝑮𝑨-𝑩𝑶𝑻* 🎧\n` +
                `┗━━━━━━━━━━━━━━━━━━━┛\n\n` +
                `◈ 📌 *Titolo:* ${title}\n` +
                `◈ ⏱️ *Durata:* ${duration || 'Sconosciuta'}\n\n` +
                `🎵 *Seleziona il formato:*`;

            const buttons = [
                {
                    buttonId:
                        `${usedPrefix}playaud ${youtubeUrl}`,
                    buttonText: {
                        displayText:
                            '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)'
                    },
                    type: 1
                },
                {
                    buttonId:
                        `${usedPrefix}playvid ${youtubeUrl}`,
                    buttonText: {
                        displayText:
                            '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)'
                    },
                    type: 1
                }
            ];

            if (thumbnail) {
                return await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url: thumbnail
                        },
                        caption,
                        footer:
                            '𝑵𝑰𝑮𝑮𝑨-𝑩𝑶𝑻',
                        buttons,
                        headerType: 4
                    },
                    {
                        quoted: m
                    }
                );
            }

            return await conn.sendMessage(
                m.chat,
                {
                    text: caption,
                    footer:
                        '𝑵𝑰𝑮𝑮𝑨-𝑩𝑶𝑻',
                    buttons,
                    headerType: 1
                },
                {
                    quoted: m
                }
            );
        }

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '📥',
                    key: m.key
                }
            }
        );

        const result = await downloadMedia(
            youtubeUrl,
            cmd === 'playaud'
                ? 'audio'
                : 'video'
        );

        console.log(
            '[PROVIDER]',
            result.provider
        );

        console.log(
            '[FILE SIZE]',
            `${(
                result.buffer.length /
                1024 /
                1024
            ).toFixed(2)} MB`
        );

        if (cmd === 'playvid') {
            if (
                result.buffer.length >
                200 * 1024 * 1024
            ) {
                throw new Error(
                    'Il video è troppo grande per essere inviato.'
                );
            }

            await conn.sendMessage(
                m.chat,
                {
                    video: result.buffer,
                    mimetype:
                        result.contentType.includes(
                            'webm'
                        )
                            ? 'video/webm'
                            : 'video/mp4',
                    fileName:
                        `${title}.mp4`,
                    caption:
                        `✅ *Download completato!*\n\n` +
                        `🎬 *${title}*` +
                        (
                            duration
                                ? `\n⏱️ ${duration}`
                                : ''
                        )
                },
                {
                    quoted: m
                }
            );
        }

        if (cmd === 'playaud') {
            await conn.sendMessage(
                m.chat,
                {
                    audio: result.buffer,
                    mimetype:
                        result.contentType.includes(
                            'ogg'
                        )
                            ? 'audio/ogg'
                            : result.contentType.includes(
                                'mpeg'
                            )
                                ? 'audio/mpeg'
                                : 'audio/mp4',
                    fileName:
                        `${title}.mp3`,
                    ptt: false
                },
                {
                    quoted: m
                }
            );
        }

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        );

    } catch (error) {
        console.error(
            '[PLAY ERROR]',
            error
        );

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '❌',
                    key: m.key
                }
            }
        );

        return m.reply(
            `❌ *PLAY ERROR*\n\n` +
            `${error.message || 'Errore sconosciuto'}`
        );
    }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command =
    /^(play|playaud|playvid)$/i;

export default handler;