import axios from 'axios'

let handler = async (m) => {
    let query = m.text.slice(11).trim()
    if(!query) return m.reply('Esempio:.pinterest gatti')

    let url = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`
    await conn.sendMessage(m.chat, {image: {url}, caption: `*${query}*`}, {quoted: m})
}
handler.command = /^pinterest$/i
export default handler