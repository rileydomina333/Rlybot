if (command === "play_audio") {

  let infoMsg = `
ℹ️ 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨:

*${video.title}*

⌛️ 𝐒𝐜𝐚𝐫𝐢𝐜𝐨 𝐥’𝐚𝐮𝐝𝐢𝐨...

> 𝟥𝟥𝟥 𝔹𝕆𝕋 𝐝𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫
`

  await m.reply(infoMsg)

  const ts = Date.now()
  const output = path.join(os.tmpdir(), `audio_${ts}.mp3`)

  try {

    // Controlla che ffmpeg esista
    await execPromise(`/usr/bin/ffmpeg -version`)

    // Scarica l'audio e convertilo in MP3
    await execPromise(
      `yt-dlp ` +
      `--no-playlist ` +
      `--no-warnings ` +
      `--retries 3 ` +
      `-f "bestaudio/best" ` +
      `-x ` +
      `--audio-format mp3 ` +
      `--audio-quality 128K ` +
      `--ffmpeg-location /usr/bin/ffmpeg ` +
      `-o "${output}" ` +
      `"${video.url}"`
    )

    // Controlla che il file sia stato realmente creato
    if (!fs.existsSync(output)) {
      throw new Error("File audio non creato da yt-dlp")
    }

    const stats = fs.statSync(output)

    if (stats.size === 0) {
      throw new Error("File audio vuoto")
    }

    console.log(
      `[PLAY] Audio scaricato: ${output} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`
    )

    await conn.sendMessage(
      m.chat,
      {
        audio: fs.readFileSync(output),
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`
      },
      { quoted: m }
    )

    // Elimina il file temporaneo
    try {
      fs.unlinkSync(output)
    } catch {}

    global.lyricsRequest = global.lyricsRequest || {}
    global.lyricsRequest[m.sender] = video.title

    if (pendingLyrics[m.sender]) {
      clearTimeout(pendingLyrics[m.sender])
    }

    pendingLyrics[m.sender] = setTimeout(() => {
      delete pendingLyrics[m.sender]
      delete global.lyricsRequest[m.sender]
    }, 15000)

    const pulsanti = [
      ['✅ 𝐒𝐢', `${usedPrefix}lyrics_yes`]
    ]

    await conn.sendButton(
      m.chat,
      `📜 Vuoi il testo?\n\n*${video.title}*`,
      `Hai 15 secondi`,
      null,
      pulsanti,
      m
    )

    delete global.playChoice[m.sender]

  } catch (e) {

    console.error("❌ ERRORE PLAY AUDIO:")
    console.error(e?.message || e)

    // Elimina eventuale file rimasto
    if (fs.existsSync(output)) {
      try {
        fs.unlinkSync(output)
      } catch {}
    }

    return m.reply(
      `❌ Errore durante il download dell'audio.\n\n` +
      `🔧 Controlla i log del bot per vedere l'errore di yt-dlp.`
    )
  }
}