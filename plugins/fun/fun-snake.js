// SNAKE UNIVERSE - Plugin per bot Baileys (Riley, Hisoka, etc)
// Comando:.snake

let games = {} // salva le partite attive

const WIDTH = 12
const HEIGHT = 14
const EMOJI_EMPTY = '⬛'
const EMOJI_SNAKE = '🟩'
const EMOJI_HEAD = '🟢'
const EMOJI_FOOD = '🍎'

function render(snake, food) {
    let board = ''
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (x == food.x && y == food.y) board += EMOJI_FOOD
            else if (snake[0].x == x && snake[0].y == y) board += EMOJI_HEAD
            else if (snake.some(s => s.x == x && s.y == y)) board += EMOJI_SNAKE
            else board += EMOJI_EMPTY
        }
        board += '\n'
    }
    return board
}

function randomFood(snake) {
    let pos
    do {
        pos = { x: Math.floor(Math.random() * WIDTH), y: Math.floor(Math.random() * HEIGHT) }
    } while (snake.some(s => s.x == pos.x && s.y == pos.y))
    return pos
}

let handler = async (m, { conn, usedPrefix, command }) => {
    let chat = m.chat
    if (games[chat]) return m.reply('🐍 C\'è già una partita in corso in questa chat! Usa TERMINA PARTITA.')

    // inizializza
    let snake = [{ x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }]
    let dir = 'up'
    let nextDir = 'up'
    let food = randomFood(snake)
    let score = 0
    let record = global.db?.data?.users?.[m.sender]?.snakeRecord || 0

    let text = `🐍 *SNAKE UNIVERSE*\n\nPunteggio: ${score} | FACILE | Record: ${record}\n\n${render(snake, food)}`

    let msg = await conn.sendMessage(chat, {
        text: text,
        footer: 'Usa le frecce per muoverti',
        buttons: [
            { buttonId: 'snake_up', buttonText: { displayText: '⬆️' }, type: 1 },
            { buttonId: 'snake_down', buttonText: { displayText: '⬇️' }, type: 1 },
            { buttonId: 'snake_left', buttonText: { displayText: '⬅️' }, type: 1 },
            { buttonId: 'snake_right', buttonText: { displayText: '➡️' }, type: 1 },
            { buttonId: 'snake_stop', buttonText: { displayText: '🟥 TERMINA PARTITA' }, type: 1 },
        ],
        headerType: 1
    }, { quoted: m })

    games[chat] = { snake, dir, nextDir, food, score, record, msgId: msg.key, interval: null, sender: m.sender, conn }

    // LOOP DI GIOCO
    games[chat].interval = setInterval(async () => {
        let g = games[chat]
        if (!g) return

        g.dir = g.nextDir
        let head = {...g.snake[0] }
        if (g.dir == 'up') head.y--
        if (g.dir == 'down') head.y++
        if (g.dir == 'left') head.x--
        if (g.dir == 'right') head.x++

        // collisione muri
        if (head.x < 0 || head.x >= WIDTH || head.y < 0 || head.y >= HEIGHT) return gameOver(chat)
        // collisione corpo
        if (g.snake.some(s => s.x == head.x && s.y == head.y)) return gameOver(chat)

        g.snake.unshift(head)

        // mangia
        if (head.x == g.food.x && head.y == g.food.y) {
            g.score += 10
            g.food = randomFood(g.snake)
        } else {
            g.snake.pop()
        }

        let newText = `🐍 *SNAKE UNIVERSE*\n\nPunteggio: ${g.score} | FACILE | Record: ${Math.max(g.score, g.record)}\n\n${render(g.snake, g.food)}`

        try {
            await g.conn.sendMessage(chat, { text: newText, edit: g.msgId })
        } catch {}

    }, 450) // 450ms = FACILE, metti 300 per normale, 200 difficile

    async function gameOver(chat) {
        let g = games[chat]
        if (!g) return
        clearInterval(g.interval)

        // salva record
        if (global.db?.data?.users) {
            if (!global.db.data.users[g.sender]) global.db.data.users[g.sender] = {}
            if ((global.db.data.users[g.sender].snakeRecord || 0) < g.score) {
                global.db.data.users[g.sender].snakeRecord = g.score
            }
        }

        await g.conn.sendMessage(chat, { text: `💀 *GAME OVER*\n\nPunteggio finale: *${g.score}*\nRecord: *${Math.max(g.score, g.record)}*\n\nScrivi *.snake* per rigiocare`, edit: g.msgId })
        delete games[chat]
    }
}

handler.before = async (m, { conn }) => {
    if (!m.message) return
    let btnId = m.message?.buttons