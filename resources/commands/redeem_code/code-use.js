const {ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder} = require('discord.js')
const {query} = require('../../database')
const {Level, Role} = require('../../utils/utils')

module.exports = {
    name: 'code-use',
    description: '使用兌換碼',
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "code",
            description: "兌換碼",
            type: ApplicationCommandOptionType.String,
        }
    ],
    execute: async (interaction) => {
		if (!interaction.inGuild()) return
        await interaction.deferReply({ephemeral: true})
        const code = interaction.options.getString('code')

        const isValidCodeFormat = /^[A-Z0-9a-z]{15}$/.test(code)
        if (!code.startsWith("EGS")||!isValidCodeFormat) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("使用失敗")
                .setDescription(`代碼格式錯誤`)
            ]
        })

        const result = (await query('select * from redeem_codes left join code_activations on redeem_codes.code = code_activations.code where redeem_codes.code =  ?', [code]))

        if (!result[0]) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("使用失敗")
                .setDescription(`未知的代碼。`)
            ]
        })

        if (!result[0].status) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("使用失敗")
                .setDescription(`該代碼已經被停用。`)
            ]
        })

        if (result[0].expiration_time) {
            let current_time = new Date()
            let expiration_time = new Date(result[0].expiration_time)
            if (current_time >= expiration_time) return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0xDC0000)
                    .setTitle("使用失敗")
                    .setDescription(`該代碼已經過期。`)
                ]
            })
        }

        const guild = interaction.guild
        const user = interaction.user

        let used = result.find(row => row.user_id === user.id)
        if (used) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("使用失敗")
                .setDescription(`你已經使用過該代碼。`)
            ]
        })

        if (!(await Role.has(user.id, guild.id, result[0].user_groups))&&result[0].user_groups) return await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                .setColor(0xDC0000)
                .setTitle("使用失敗")
                .setDescription(`你沒有權限使用該代碼。`)
            ]
        })

        const userData = (await query('select * from users where user_id = ?', [user.id]))[0] || { level: 1, experience: 0, total_experience: 0 }
        const oldData = userData

        if (result[0].type==="experience") {
            userData.total_experience += result[0].amount
            userData.experience = userData.total_experience
            userData.level = 1
            while (userData.experience>=Level.required(userData.level)) {
                userData.experience -= Level.required(userData.level)
                userData.level += 1
            }
        }

        if (result[0].type==="level") {
            for (let i=userData.level;i<userData.level+result[0].amount;i++) {
                userData.total_experience += Level.required(i)
            }
            userData.level+=result[0].amount
        }

        const date = new Date()
        if (result[0].code_type=="single_use") await query('update redeem_codes set use_count = use_count + 1, status = 0 where code = ?', [code])
        if (result[0].code_type=="multi_use")  await query('update redeem_codes set use_count = use_count + 1 where code = ?', [code])
        await query('insert into code_activations (user_id, code, activation_time) values(?, ?, ?)', [user.id, code, date])
        await query('insert into users (user_id, user_name, level, experience, total_experience) values(?, ?, ?, ?, ?) on duplicate key update level = value(level), experience = value(experience), total_experience = value(total_experience)', [user.id, user.username, userData.level, userData.experience, userData.total_experience])
        .then(async () => {
            let target = user.id == interaction.user.id ? "您" : `<@${user.id}>`
            let type_sentence = result[0].type=="experience" ? `${result[0].amount.toLocaleString()}點經驗值` : `${result[0].amount.toLocaleString()}個等級`
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(0x00DC00)
                    .setTitle("代碼使用成功")
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
                    .setTitle("代碼使用失敗")
                    .setDescription(`好像發生了一些錯誤ouo\n${error.message}`)
                ]
            })
        })
    }
}