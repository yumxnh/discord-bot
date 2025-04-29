const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const {query} = require('../../database')

module.exports = {
    name: 'code-generate',
    description: '生成兌換碼',
    type: ApplicationCommandType.ChatInput,
    cooldown: 10,
    devs_only: true,
    options: [
        {
            name: "code_type",
            description: "兌換碼的類型",
            type: ApplicationCommandOptionType.String,
            choices: [
                {name: "Single-use", value: "single_use"},
                {name: "Multi-use",  value: "multi_use" }
            ],
            required: true
        },

        {
            name: "type",
            description: "兌換內容的類型",
            type: ApplicationCommandOptionType.String,
            choices: [
                {name: "experience", value: "experience"},
                {name: "level",      value: "level"     }
            ],
            required: true
        },
        
        {
            name: "amount",
            description: "兌換內容的數量",
            type: ApplicationCommandOptionType.Integer,
            required: true
        },
        
        {
            name: "count",
            description: "兌換碼的生成數量",
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            max_value: 5,
        },
        
        {
            name: "group",
            description: "僅開放給限定身分組使用",
            type: ApplicationCommandOptionType.Role
        }
    ],
    execute: async (interaction) => {
		if (!interaction.inGuild()) return
        await interaction.deferReply({ephemeral: true})

        const code_type = interaction.options.getString('code_type')
        const type = interaction.options.getString('type')
        const amount = interaction.options.getInteger('amount')
        const count = interaction.options?.getInteger('count') || 1
        const group = interaction.options?.getRole('group').id || null

        const codes = await generateCodes(code_type, type, amount, count, group)
        let sentnece = ''
        if (type=="experience") sentnece = `增加${amount}點經驗值`
        if (type=="level")      sentnece = `增加${amount}個等級`
        
        let description = ''
        if (code_type=='single_use') description = '一次性'
        if (code_type=='multi_use')  description = '多次性'
        if (group) description += `僅限<@&${group}>使用`
        
        
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0x00DC00)
                .setTitle("生成成功")
                .setDescription(`已成功為您生成了${codes.length}個${description}的代碼\n效果: ${sentnece}\n${codes.map(code => `\`${code}\``).join('\n')}`)
            ]
        })
    }
}

let generateArray = []

async function generateCodes(code_type, type, amount, count, group) {
    let values = []
    let creation_time = new Date()

    for (let i=0;i<count;i++) {
        let code = await generateUniqueCode()
        generateArray.push(code)
        values.push([code, code_type, creation_time, type, amount, group])
    }

    if (values.length > 0) {
        const sql = `INSERT INTO redeem_codes (code, code_type, creation_time, type, amount, user_groups) VALUES ?`
        await query(sql, [values])
    }

    return generateArray
}


async function isCodeUnique(code) {
    const result = await query(`SELECT code FROM redeem_codes WHERE code = ?`, [code])
    return result.length === 0 && !generateArray.includes(code)
}

async function generateUniqueCode() {
    let unique = false
    let newCode = ''

    while (!unique) {
        newCode = generateUniqueCode()
        unique = await isCodeUnique(newCode)
    }

    return newCode
}

function generateUniqueCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = 'EGS'

    for (let i = 0; i < 12; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }

    return result
}