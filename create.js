const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Generate license keys.')
    .addStringOption(option =>
      option.setName('product')
        .setDescription('The product for which keys are generated.')
        .setRequired(true)
        .addChoices(
          { name: 'Fortnite Private', value: 'Fortnite Private' },
          { name: 'Temp Spoofer', value: 'Temp Spoofer' },
          { name: 'Perm Spoofer', value: 'Perm Spoofer' }
        )
    )
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('The duration of the keys.')
        .setRequired(true)
        .addChoices(
          { name: '1 Day', value: '1 Day' },
          { name: '1 Week', value: '1 Week' },
          { name: '1 Month', value: '1 Month' },
          { name: 'Lifetime', value: 'Lifetime' }
        )
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of keys to generate.')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send the keys to.')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.member.permissions.has('Administrator')) {
      return interaction.reply({
        content: 'You do not have permission to use this command.',
        ephemeral: true,
      });
    }

    const product = interaction.options.getString('product');
    const duration = interaction.options.getString('duration');
    const amount = interaction.options.getInteger('amount');
    const user = interaction.options.getUser('user');

    const dataPath = path.join(__dirname, '../data/sub.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const userAlreadyInCategory = data.some(entry => entry.user === user.tag && entry.product === product);

    if (userAlreadyInCategory) {
      return interaction.reply({
        content: `User already registered in the **${product}** category.`,
        ephemeral: true,
      });
    }

    const productCode = product === 'Perm Spoofer' ? 'PERM-SPOOFER' :
      product === 'Temp Spoofer' ? 'TEMP-SPOOFER' :
      product === 'Fortnite Private' ? 'FORTNITE-PRIVATE' : 'XX';

    const generateKey = () => {
      const randomSegment = () => Math.random().toString(36).substr(2, 4).toUpperCase();
      return `${productCode}-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
    };

    const keys = Array.from({ length: amount }, generateKey);

    let expiryDate;
    switch (duration) {
      case '1 Day':
        expiryDate = moment().add(1, 'day').format('DD-MM-YYYY HH:mm');
        break;
      case '1 Week':
        expiryDate = moment().add(1, 'week').format('DD-MM-YYYY HH:mm');
        break;
      case '1 Month':
        expiryDate = moment().add(1, 'month').format('DD-MM-YYYY HH:mm');
        break;
      case 'Lifetime':
        expiryDate = 'Lifetime';
        break;
    }

    const newEntries = keys.map(key => ({
      product,
      duration,
      user: user.tag,
      key,
      expiry: expiryDate,
    }));

    data.push(...newEntries);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    const embedExecutor = new EmbedBuilder()
      .setTitle('License Key Generated')
      .setColor('#000000')
      .addFields(
        { name: 'Product', value: product },
        { name: 'Duration', value: duration },
        { name: 'Keys Generated', value: `${amount}` }
      );

    await interaction.reply({ embeds: [embedExecutor], ephemeral: true });

    const embedUser = new EmbedBuilder()
      .setTitle('Your Licenses')
      .setColor('#000000')
      .addFields(
        { name: 'Product', value: product },
        { name: 'Duration', value: duration },
        { name: 'Keys', value: keys.join('\n') }
      );

    try {
      await user.send({ embeds: [embedUser] });
    } catch (error) {
      console.error('Unable to notify user:', error.message);
    }
  }
};
