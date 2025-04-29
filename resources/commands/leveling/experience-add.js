const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits} = require('discord.js')
const {query} = require('../../database')
const {Role, Level} = require('../../utils/utils')

module.exports = {
    name: 'experience-add',
    description: '增加經驗值或等級',
    type: ApplicationCommandType.ChatInput,
    devs_only: true,
    options: [
        {
            name: 'type',
            description: '增加經驗值或是等級',
            type: ApplicationCommandOptionType.String,
            choices: [
                {name: 'level', value: 'level'},
                {name: 'experience', value: 'experience'}
            ],
            required: true
        },

        {
            name: 'amount',
            description: '增加的數量',
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
                .setTitle("增加失敗")
                .setDescription(`你不能對此類型的使用者進行此操作!`)
            ]
        })

        if (!user) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("增加失敗")
                .setDescription(`用戶不存在。`)
            ]
        })

        let userData = (await query('select level, experience, total_experience from users where user_id = ?', [user.id]))[0]
        if (!userData) userData = { level: 1, experience: 0, total_experience: 0 }
        const oldData = {...userData}

        if (type==="experience") {
            userData.total_experience += amount
            userData.experience = userData.total_experience
            userData.level = 1
            while (userData.experience>=Level.required(userData.level)) {
                userData.experience -= Level.required(userData.level)
                userData.level += 1
            }
        }

        if (type==="level") {
            for (let i=userData.level;i<userData.level+amount;i++) {
                userData.total_experience += Level.required(i)
            }
            userData.level+=amount
        }

        await query('insert into users (user_id, user_name, level, experience, total_experience) values(?, ?, ?, ?, ?) on duplicate key update level = value(level), experience = value(experience), total_experience = value(total_experience)', [user.id, user.username, userData.level, userData.experience, userData.total_experience])
        .then(async () => {
            let target = user.id == interaction.user.id ? "您" : `<@${user.id}>`
            let type_sentence = type=="experience" ? `${amount.toLocaleString()}點經驗值` : `${amount.toLocaleString()}個等級`
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x00DC00)
                    .setTitle("增加成功")
                    .setDescription(`已成功為${target}增加了${type_sentence}。`)
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
                    .setTitle("增加失敗")
                    .setDescription(`好像發生了一些錯誤ouo\n${error.message}`)
                ]
            })
        })
    }
}