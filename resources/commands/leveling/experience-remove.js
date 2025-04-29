const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const {query} = require('../../database')
const { Level } = require('../../utils/utils')

module.exports = {
    name: 'experience-remove',
    description: '移除經驗值或等級',
    type: ApplicationCommandType.ChatInput,
    devs_only: true,
    options: [
        {
            name: 'type',
            description: '移除經驗值或是等級',
            type: ApplicationCommandOptionType.String,
            choices: [
                {name: 'level', value: 'level'},
                {name: 'experience', value: 'experience'}
            ],
            required: true
        },

        {
            name: 'amount',
            description: '移除的數量',
            type: ApplicationCommandOptionType.Integer,
            min_value: 1,
            required: true
        },

        
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
        const amount = interaction.options.getInteger('amount')
        const type = interaction.options.getString('type')
        const user = interaction.options?.getUser('user') || interaction.user

        if (user.bot||user.system) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("移除失敗")
                .setDescription(`你不能對此類型的使用者進行此操作!`)
            ]
        })

        if (!user) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("移除失敗")
                .setDescription(`用戶不存在。`)
            ]
        })

        const userData = (await query('select level, experience, total_experience from users where user_id = ?', [user.id]))[0]
        
        if (!userData) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("移除失敗")
                .setDescription(`${user.id===interaction.user.id?"您":`<@${user.id}>`}在資料庫沒有相關數據。`)
            ]
        })
        const oldData = {...userData}

        if (type==="experience") {
            userData.total_experience = Math.max(0, userData.total_experience-amount)
            userData.experience = userData.total_experience
            userData.level = 1
            while (userData.experience>=Level.required(userData.level)) {
                userData.experience -= Level.required(userData.level)
                userData.level += 1
            }
        }
        
        if (type==="level") {
            let newLevel = userData.level - amount
            if (newLevel<1) {
                userData.level = 1
                userData.experience = 0
                userData.total_experience = 0
            } else {
                for (let level=userData.level;level>newLevel;level--) {
                    userData.total_experience -= Level.required(level-1)
                }
                userData.experience = userData.total_experience
                for (let level=1;level<newLevel;level++) {
                    userData.experience -= Level.required(level)
                }
                userData.level = newLevel
            }
        }

        await query('insert into users (user_id, user_name, level, experience, total_experience) values(?, ?, ?, ?, ?) on duplicate key update level = value(level), experience = value(experience), total_experience = value(total_experience)', [user.id, user.username, userData.level, userData.experience, userData.total_experience])
        .then(async () => {
            let target = user.id == interaction.user.id ? "您" : `<@${user.id}>`
            let type_sentence = type=="experience" ? `${amount.toLocaleString()}點經驗值` : `${amount.toLocaleString()}個等級`
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x00DC00)
                    .setTitle("移除成功")
                    .setDescription(`已成功為${target}移除了${type_sentence}。`)
                    .addFields(
                        { 
                            name: '等級',
                            value: oldData.level === userData.level ? `Lv.${userData.level}` : `Lv.${oldData.level} <a:s_arrows:1214050671486042143> Lv.${userData.level}`, 
                            inline: true 
                        },
                        { 
                            name: '經驗值', 
                            value: oldData.experience === userData.experience ? `${userData.experience.toLocaleString()}` : `${oldData.experience.toLocaleString()} <a:s_arrows:1214050671486042143> ${userData.experience.toLocaleString()}`, 
                            inline: true 
                        },
                        { 
                            name: '總經驗值', 
                            value: oldData.total_experience === userData.total_experience ? `${userData.total_experience.toLocaleString()}` : `${oldData.total_experience.toLocaleString()} <a:s_arrows:1214050671486042143> ${userData.total_experience.toLocaleString()}`, 
                            inline: false 
                        }
                    )
                ]
            })}
        ).catch(async (error) => {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xDC0000)
                    .setTitle("移除失敗")
                    .setDescription(`好像發生了一些錯誤ouo\n${error.message}`)
                ]
            })
        })
    }
}