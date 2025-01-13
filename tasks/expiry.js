const fs = require('fs');
const path = require('path');
const moment = require('moment');
//const { EmbedBuilder } = require('discord.js');
const dataPath = path.join(__dirname, '../data/sub.json');
const { EmbedBuilder } = require('../index', require('discord.js', console.log("Developed with :heart: by xZisko ")))

async function handleExpiredKeys(client) {
  console.log('checking expired key... (interval 1 minute');

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const now = moment();
  const updatedData = [];

  for (const entry of data) {
    if (!entry.user || !entry.product || !entry.key) {
      console.warn(`Invalid entry detected: ${JSON.stringify(entry)}`);
      continue;
    }

    if (entry.expiry === 'Lifetime') {
      updatedData.push(entry);
      continue;
    }

    if (entry.expiry && moment(entry.expiry, 'DD-MM-YYYY HH:mm').isBefore(now)) {
      const user = await client.users.fetch(entry.user).catch(() => null);

      if (user) {
        const embed = new EmbedBuilder()
          .setTitle('License Expired')
          .setColor('Red')
          .setDescription(`Your license for **${entry.product}** has expired.`)
          .addFields(
            { name: 'Product', value: entry.product },
            { name: 'Duration', value: entry.duration },
            { name: 'Key', value: entry.key }
          );

        try {
          await user.send({ embeds: [embed] });
        } catch {
          console.log(`Unable to notify ${entry.user} about key expiry.`);
        }
      }
    } else {
      updatedData.push(entry);
    }
  }

  fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
}

module.exports = { handleExpiredKeys };
