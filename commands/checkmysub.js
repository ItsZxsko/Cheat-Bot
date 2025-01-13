const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkmysub')
    .setDescription('Check your subscription status and remaining time.'),

  async execute(interaction) {
    const user = interaction.user;
    const dataPath = path.join(__dirname, '../data/sub.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    const userSubscriptions = data.filter(entry => entry.user === user.tag);

    if (userSubscriptions.length === 0) {
      return interaction.reply({
        content: 'You do not have an active subscription.',
        ephemeral: true
      });
    }

    const embeds = userSubscriptions.map(subscription => {
      const { product, duration, expiry } = subscription;
      const embed = new EmbedBuilder()
        .setTitle(`Subscription for ${product}`)
        .setColor('Blue')
        .addFields(
          { name: 'Product', value: product },
          { name: 'Duration', value: duration },
          { name: 'Expiration', value: expiry || 'Lifetime' }
        );

      if (expiry) {
        const expiryMoment = moment(expiry, 'DD-MM-YYYY HH:mm');
        const now = moment();

        if (expiryMoment.isAfter(now)) {
          const timeRemaining = moment.duration(expiryMoment.diff(now));
          const timeLeftStr = `${timeRemaining.days()} days, ${timeRemaining.hours()} hours, ${timeRemaining.minutes()} minutes`;

          embed.addFields({ name: 'Time Remaining', value: timeLeftStr || 'Lifetime' });
        } else {
          embed.addFields({ name: 'Time Remaining', value: 'Expired' });
        }
      }

      return embed;
    });

    await interaction.reply({ embeds });
  }
};
