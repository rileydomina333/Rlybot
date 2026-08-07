import axios from 'axios'
let handler = async (m) => {
    let text = m.text.slice(4)
    if(!text) return m.reply('Esempio:.ai ciao')
    m.reply('_RLY AI sta cercando una IA libera..._')

    const URLS = [
        `https://text.pollinations.ai/${encodeURIComponent(text)}?model=openai`,
        `https://text.pollinations.ai/${encodeURIComponent(text)}?model=llamav3`,
        `https://api.cohere.ai/v1/generate` // altri
    ]
    // ... prova tutte finché 1 risponde
}
handler.command = /^ai$/i
export default handler