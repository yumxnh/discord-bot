const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, AttachmentBuilder} = require('discord.js')
const {query} = require('../../database')
const {createCanvas, Image, loadImage} = require('@napi-rs/canvas')
const config = require('../../../config.json')
const {Role, Level} = require('../../utils/utils')
const { request } = require('undici')

module.exports = {
    name: 'experience-get',
    description: '獲得用戶的經驗值與等級狀態',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: 'user',
            description: '使用者',
            type: ApplicationCommandOptionType.User
        }

    ],
    execute: async (interaction) => {
        if (!interaction.inGuild()) return
        await interaction.deferReply()

        const guild = interaction.guild
        const user = interaction.options?.getUser('user') || interaction.user
        
        if (user.bot||user.system) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("查詢失敗")
                .setDescription(`你不能對此類型的使用者進行此操作!`)
            ]
        })

        let userData = (await query('select level, experience, total_experience from users where user_id = ?', [user.id]))[0]
        if (!userData) userData = { level: 1, experience: 0, total_experience: 0 }

        // 背景
        const canvas = createCanvas(1000, 300)
        const ctx = canvas.getContext('2d')
        const background = await loadImage("./resources/assests/img/rank_background.png")
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        // 底塊
        const back_block = {width: canvas.width-30, height: canvas.height-30}
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
        ctx.fillRect(15, 15, back_block.width, back_block.height)

        const level = userData.level
        const experience = userData.experience
        const required = Level.required(level)

        // 經驗進度條
        const process = {width: 600, height: 35}
        drawRoundedRectFill(ctx, 255, 180, 700, process.height, 18, "rgb(150, 150, 150)")
        drawRoundedRectFill(ctx, 255, 180, Math.round((experience/required)*700), process.height, 18, "#00CEF7")
        drawRoundedRectStroke(ctx, 255, 180, 700, process.height, 18, "#000000", 2)

        // 伺服器名稱
        ctx.font = 'bold 23px 7th Service Expanded Italic'
        ctx.fillStyle = '#ffffff'
        ctx.textAlign = 'center'
        ctx.fillText('Electronic Gamers State', 605, 240)
        
        // 經驗與需求
        drawExperienceText(ctx, experience, required, canvas.width - 45, canvas.height / 2 + 10)

        // 等級
        ctx.font = 'bold 50px Noto Sans TC'
        ctx.fillStyle = "#ffffff"
        ctx.fillText(`Lv.${level}`, canvas.width-45, canvas.height/2-50)

        // 用戶暱稱
        fitText(ctx, user.globalName||user.username, 54, 260, canvas.height / 2 + 10, 400)
        
        // 頭像
        await drawAvatar(ctx, 45, (canvas.height-90*2)/2, 90, user, guild)
        
        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'level.png' })
        interaction.editReply({ files: [attachment] })
    }
}

function drawRoundedRectStroke(ctx, x, y, width, height, radius, strokeColor, lineWidth) {
    radius = Math.min(radius, width / 2, height / 2)

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()

    if (strokeColor && lineWidth) {
        ctx.strokeStyle = strokeColor
        ctx.lineWidth = lineWidth
        ctx.stroke()
    }
    
    ctx.restore()
}

function drawRoundedRectFill(ctx, x, y, width, height, radius, fillColor) {
    const minWidth = radius * 2
    if (width < minWidth) width = minWidth

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()

    ctx.fillStyle = fillColor
    ctx.fill()
    ctx.restore()
}

function fitText(ctx, text, initialFontSize, x, y, maxWidth) {
    let fontSize = initialFontSize;
    ctx.textAlign = 'left'
    ctx.fillStyle = '#ffffff'

    do {
        ctx.font = `bold ${fontSize}px Noto Sans TC`
        fontSize -= 4
    } while (ctx.measureText(text).width > maxWidth && fontSize > 0)

    ctx.fillText(text, x, y)
}

function drawExperienceText(ctx, experience, required, x, y) {
    ctx.textAlign = 'right'
    ctx.font = 'bold 30px Noto Sans TC'
    ctx.fillStyle = '#808080'
    const requiredText = `/${formatNumber(required)} XP`
    ctx.fillText(requiredText, x, y)
    const requiredTextWidth = ctx.measureText(requiredText).width
    ctx.fillStyle = "#ffffff"
    ctx.fillText(formatNumber(experience), x - requiredTextWidth, y)
}

async function drawAvatar(ctx, x, y, radius, user, guild) {
    const { body } = await request(user.displayAvatarURL({ extension: 'jpg' }))
    const avatar = await loadImage(await body.arrayBuffer())

    if (await Role.has(user.id, guild.id, config.role.booster)) {
        ctx.beginPath()
        ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true)
        let gradient = ctx.createLinearGradient(x, y, x + 2 * radius, y + 2 * radius)
        gradient.addColorStop(0, "#ECCCFF")
        gradient.addColorStop(1, "#9880FF")
        ctx.strokeStyle = gradient
        ctx.lineWidth = 15
        ctx.stroke()
        ctx.closePath()
    }

    ctx.beginPath()
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true)
    ctx.closePath()
    ctx.clip()

    ctx.drawImage(avatar, x, y, 2 * radius, 2 * radius)
}

function formatNumber(number) {
    if (number >= 1e9) {
        return (number / 1e9).toFixed(1) + 'B'
    } else if (number >= 1e6) {
        return (number / 1e6).toFixed(1) + 'M'
    } else if (number >= 1e3) {
        return (number / 1e3).toFixed(1) + 'K'
    } else {
        return number.toString()
    }
}