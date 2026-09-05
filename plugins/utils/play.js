import yts from 'yt-search'
import { exec } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

let pendingLyrics = {}

global.playChoice = global.playChoice || {}
global.playSelection = global.playSelection || {}
global.lyricsRequest = global.lyricsRequest || {}

const YTDLP = '/usr/bin/yt-dlp'
const FFMPEG = '/usr/bin/ffmpeg'

const getThumbnail = (video) =>
  video?.thumbnail ||
  video?.image ||
  video?.images?.[0] ||
  'icone/333.jpg'

const execPromise = (cmd) => new Promise((resolve, reject) => {
  exec(
    cmd,
    {
      maxBuffer: 1024 * 1024 * 20,
      timeout: 10 * 60 * 1000
    },
    (err, stdout, stderr) => {

      if (err) {
        const error = new Error(
          stderr?.trim() ||
          stdout?.trim() ||
          err.message
        )

        error.stdout = stdout
        error.stderr = stderr
        error.code = err.code

        reject(error)
        return
      }

      resolve(stdout)
    }
  )
})

const safeFileName = (name) => {
  return String(name || 'audio')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 100)
}

const fileExists = (file) => {
  try {
    return fs.existsSync(file) && fs.statSync(file).size > 0
  } catch {
    return false
  }
}

const removeFile = (file) => {
  try {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file)
    }
  } catch {}
}

let handler = async (m, { conn, text, usedPrefix, command }) => {

  /*
  ============================================================
  PLAY
  ============================================================
  */

  if (command === 'play') {

    if (!text?.trim()) {
      return m.reply('🎧 𝐒𝐜𝐫𝐢𝐯𝐢 𝐢𝐥 𝐭𝐢𝐭𝐨𝐥𝐨!')
    }

    try {

      const search = await yts(text.trim())
      const results = search.videos?.slice(0, 5) || []

      if (!results.length) {
        return m.reply('❌ Nessun risultato trovato.')
      }

      global.playSelection[m.sender] = results

      const selectionCards = results.map((video, index) => ({

        image: {
          url: getThumbnail(video)
        },

        title:
          `🎵 ${video.title.substring(0, 60)}` +
          `${video.title.length > 60 ? '…' : ''}`,

        body:
          `🎵 *${video.title}*\n\n` +
          `📺 ${video.author?.name || 'Sconosciuto'}\n` +
          `⏱️ ${video.timestamp || '—'}\n` +
          `👁️ ${video.views?.toLocaleString() || '—'}`,

        footer: '333 BOT',

        buttons: [{
          name: 'quick_reply',

          buttonParamsJson: JSON.stringify({
            display_text: `🎧 Seleziona ${index + 1}`,
            id: `.play_select ${index + 1}`
          })
        }]

      }))

      return conn.sendMessage(
        m.chat,
        {
          text:
            `🔎 𝐓𝐫𝐨𝐯𝐚𝐭𝐢 ${results.length} 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐢 ` +
            `per "*${text.trim()}*".\n\n` +
            `Scrolla e scegli la canzone adatta alla tua richiesta.`,

          footer: '333 BOT',

          cards: selectionCards
        }
      )

    } catch (e) {

      console.error('[PLAY SEARCH]', e)

      return m.reply(
        '❌ Errore durante la ricerca su YouTube.'
      )
    }
  }


  /*
  ============================================================
  PLAY SELECT
  ============================================================
  */

  if (command === 'play_select') {

    const index = Number((text || '').trim())

    const results = global.playSelection[m.sender]

    if (!results?.length) {
      return m.reply('❌ Nessuna selezione attiva.')
    }

    if (
      !Number.isInteger(index) ||
      index < 1 ||
      index > results.length
    ) {
      return m.reply(
        `❌ Seleziona un numero valido tra 1 e ${results.length}.`
      )
    }

    const video = results[index - 1]

    if (!video?.url) {
      return m.reply('❌ Risultato non valido.')
    }

    global.playChoice[m.sender] = video

    delete global.playSelection[m.sender]

    const thumbnail = getThumbnail(video)

    const actionText =
      `🎶 *${video.title}*\n\n` +
      `📺 Canale: ${video.author?.name || 'Sconosciuto'}\n` +
      `⏱️ Durata: ${video.timestamp || '—'}\n` +
      `👁️ Ascolti: ${video.views?.toLocaleString() || '—'}`

    /*
     * IMPORTANTE:
     * Non usiamo { quoted: m }.
     * Il tuo simple.js va in errore quando il messaggio
     * generato dal pulsante non possiede contextInfo.
     */

    try {

      await conn.sendMessage(m.chat, {
        image: {
          url: thumbnail
        },

        caption:
          `${actionText}\n\n` +
          `🎧 Scegli un'azione per questo brano:`,

        footer: '333 BOT',

        buttons: [
          {
            buttonId: '.play_audio',
            buttonText: {
              displayText: '🎧 Scegli audio'
            },
            type: 1
          },

          {
            buttonId: '.play_video',
            buttonText: {
              displayText: '🎥 Scegli video'
            },
            type: 1
          },

          {
            buttonId: '.add_queue',
            buttonText: {
              displayText: '🎵 Metti in coda'
            },
            type: 1
          }
        ],

        headerType: 1
      })

    } catch (e) {

      console.error('[PLAY SELECT SEND]', e)

      /*
       * Fallback senza quoted/buttons.
       */
      await conn.sendMessage(m.chat, {
        text:
          `${actionText}\n\n` +
          `Rispondi con:\n` +
          `• ${usedPrefix}play_audio\n` +
          `• ${usedPrefix}play_video`
      })
    }

    return
  }


  /*
  ============================================================
  RECUPERA VIDEO SELEZIONATO
  ============================================================
  */

  const video = global.playChoice[m.sender]

  if (!video) {
    return m.reply('❌ Nessuna richiesta attiva.')
  }


  /*
  ============================================================
  PLAY AUDIO
  ============================================================
  */

  if (command === 'play_audio') {

    const ts = Date.now()

    const output = path.join(
      os.tmpdir(),
      `333_audio_${ts}.mp3`
    )

    try {

      /*
       * Messaggio SENZA quoted.
       * Evita l'errore:
       * Cannot read properties of undefined
       * (reading 'contextInfo')
       */

      await conn.sendMessage(m.chat, {
        text:
          `ℹ️ 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨:\n\n` +
          `*${video.title}*\n\n` +
          `⌛️ 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐥’𝐚𝐮𝐝𝐢𝐨...\n\n` +
          `> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫`
      })

      console.log('================================')
      console.log('🎧 PLAY AUDIO')
      console.log('TITLE:', video.title)
      console.log('URL:', video.url)
      console.log('OUTPUT:', output)
      console.log('================================')

      /*
       * Controllo yt-dlp
       */
      await execPromise(
        `${YTDLP} --version`
      )

      /*
       * Controllo ffmpeg
       */
      await execPromise(
        `${FFMPEG} -version`
      )

      /*
       * Download + conversione MP3.
       *
       * -f bestaudio/best
       * -x
       * --audio-format mp3
       * --audio-quality 128K
       *
       * yt-dlp documenta -x come estrazione audio
       * e richiede ffmpeg/ffprobe per il post-processing.
       */

      await execPromise(
        `${YTDLP} ` +
        `--ignore-config ` +
        `--no-playlist ` +
        `--no-warnings ` +
        `--retries 3 ` +
        `--fragment-retries 3 ` +
        `-f "bestaudio/best" ` +
        `-x ` +
        `--audio-format mp3 ` +
        `--audio-quality 128K ` +
        `--ffmpeg-location "${FFMPEG}" ` +
        `-o "${output}" ` +
        `"${video.url}"`
      )

      /*
       * Verifica file
       */

      if (!fileExists(output)) {
        throw new Error(
          'yt-dlp non ha creato il file MP3.'
        )
      }

      const stats = fs.statSync(output)

      console.log(
        `✅ MP3 creato: ` +
        `${(stats.size / 1024 / 1024).toFixed(2)} MB`
      )

      /*
       * Invia audio SENZA quoted.
       */

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(output),
        mimetype: 'audio/mpeg',
        fileName:
          `${safeFileName(video.title)}.mp3`
      })

      console.log('✅ AUDIO INVIATO')

      /*
       * Elimina file temporaneo
       */

      removeFile(output)

      /*
       * Richiesta lyrics
       */

      global.lyricsRequest[m.sender] = video.title

      if (pendingLyrics[m.sender]) {
        clearTimeout(pendingLyrics[m.sender])
      }

      pendingLyrics[m.sender] = setTimeout(() => {

        delete pendingLyrics[m.sender]
        delete global.lyricsRequest[m.sender]

      }, 15000)

      /*
       * Pulsante lyrics.
       *
       * Se il tuo fork supporta sendButton,
       * lo utilizziamo senza quoted.
       */

      try {

        await conn.sendButton(
          m.chat,
          `📜 Vuoi il testo?\n\n*${video.title}*`,
          `Hai 15 secondi`,
          null,
          [
            [
              '✅ 𝐒𝐢',
              `${usedPrefix}lyrics_yes`
            ]
          ]
        )

      } catch (buttonError) {

        console.error(
          '[LYRICS BUTTON]',
          buttonError
        )

        /*
         * Fallback semplice.
         */

        await conn.sendMessage(m.chat, {
          text:
            `📜 Vuoi il testo?\n\n` +
            `*${video.title}*\n\n` +
            `Scrivi: ${usedPrefix}lyrics_yes`
        })
      }

      delete global.playChoice[m.sender]

    } catch (e) {

      console.error('================================')
      console.error('❌ PLAY AUDIO ERROR')
      console.error('================================')
      console.error(e?.message || e)
      console.error('STDOUT:', e?.stdout || '')
      console.error('STDERR:', e?.stderr || '')
      console.error('================================')

      removeFile(output)

      return conn.sendMessage(m.chat, {
        text:
          `❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐚𝐮𝐝𝐢𝐨.\n\n` +
          `Non è stato possibile scaricare *${video.title}*.\n\n` +
          `🔧 Controlla la console del bot.`
      })
    }

    return
  }


  /*
  ============================================================
  PLAY VIDEO
  ============================================================
  */

  if (command === 'play_video') {

    if (video.seconds > 480) {
      return m.reply('❌ Max 8 minuti.')
    }

    await conn.sendMessage(m.chat, {
      text:
        `🎬 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐯𝐢𝐝𝐞𝐨...\n\n` +
        `> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫`
    })

    const ts = Date.now()

    const raw = path.join(
      os.tmpdir(),
      `333_vid_raw_${ts}.mp4`
    )

    const out = path.join(
      os.tmpdir(),
      `333_vid_out_${ts}.mp4`
    )

    try {

      await execPromise(
        `${YTDLP} ` +
        `--ignore-config ` +
        `--no-playlist ` +
        `--no-warnings ` +
        `--retries 3 ` +
        `-f "bestvideo[vcodec^=avc1][height<=480]+bestaudio[acodec^=mp4a]/best[vcodec^=avc1][height<=480]/best[height<=480]" ` +
        `--merge-output-format mp4 ` +
        `--ffmpeg-location "${FFMPEG}" ` +
        `--no-part ` +
        `-o "${raw}" ` +
        `"${video.url}"`
      )

      if (!fileExists(raw)) {
        throw new Error(
          'yt-dlp non ha creato il video.'
        )
      }

      await execPromise(
        `${FFMPEG} -y ` +
        `-i "${raw}" ` +
        `-c:v libx264 ` +
        `-preset ultrafast ` +
        `-crf 30 ` +
        `-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ` +
        `-c:a aac ` +
        `-b:a 96k ` +
        `-movflags +faststart ` +
        `"${out}"`
      )

      removeFile(raw)

      if (!fileExists(out)) {
        throw new Error(
          'FFmpeg non ha creato il video finale.'
        )
      }

      const sizeMB =
        fs.statSync(out).size /
        (1024 * 1024)

      console.log(
        `🎬 Video finale: ${sizeMB.toFixed(2)} MB`
      )

      if (sizeMB > 64) {

        removeFile(out)

        return conn.sendMessage(m.chat, {
          text: '❌ Video troppo pesante.'
        })
      }

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(out),
        mimetype: 'video/mp4',
        caption: `🎬 ${video.title}`
      })

      removeFile(out)

      delete global.playChoice[m.sender]

    } catch (e) {

      console.error('================================')
      console.error('❌ PLAY VIDEO ERROR')
      console.error('================================')
      console.error(e?.message || e)
      console.error('STDOUT:', e?.stdout || '')
      console.error('STDERR:', e?.stderr || '')
      console.error('================================')

      removeFile(raw)
      removeFile(out)

      return conn.sendMessage(m.chat, {
        text:
          `❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐯𝐢𝐝𝐞𝐨.\n\n` +
          `Controlla la console del bot.`
      })
    }

    return
  }
}


handler.command =
  /^(play|play_audio|play_video|play_select)$/i

handler.help = ['play']

handler.tags = ['fun']

export default handler