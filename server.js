const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { DateTime } = require('luxon');
const app = express();

// Constants
const PORT = process.env.PORT || 10000;
const COMMANDS = {
  HELP: 'help',
  TIME_CONVERT: 'timeconvert',
  IP_ADDRESS: 'ipaddress',
  TICKET_DRI: 'ticket_dri',
  NUMBER_VERIFY: 'number_verify'
};

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Command handlers
const commandHandlers = {
  [COMMANDS.HELP]: () => ({
    reply: `📋 Available Commands:

1️⃣ ticket_dri <Ticket_ID>
   Get direct link to ticket details

2️⃣ number_verify <number>,<number>
   Verify phone numbers

3️⃣ ipaddress
   Get IP whitelist details

4️⃣ timeconvert <timestamp>
   Convert timestamp to IST/UTC with time difference`
  }),

  [COMMANDS.TIME_CONVERT]: (timestamp) => {
    if (isNaN(timestamp)) {
      return { reply: '⚠️ Please provide a valid timestamp in milliseconds' };
    }

    const utcTime = DateTime.fromMillis(Number(timestamp), { zone: 'utc' });
    const istTime = utcTime.setZone('Asia/Kolkata');
    const currentTime = DateTime.now();
    const timeDiff = currentTime.diff(utcTime).shiftTo('days', 'hours', 'minutes', 'seconds');

    return {
      reply: `🕒 Time Conversion Results:

📅 Converted Time (IST): 
${istTime.toFormat('yyyy-MM-dd HH:mm:ss.SSS')}

⏰ Current Time (IST): 
${currentTime.setZone('Asia/Kolkata').toFormat('yyyy-MM-dd HH:mm:ss.SSS')}

⌛ Time Difference: 
${timeDiff.days} days, ${timeDiff.hours} hours, ${timeDiff.minutes} minutes, ${Math.floor(timeDiff.seconds)} seconds`
    };
  },

  [COMMANDS.IP_ADDRESS]: () => ({
    reply: `🌐 IP Address Details:

🇸🇬 Singapore Stamp:
• 52.74.143.161
• 54.251.51.1
• 54.251.51.3
• 18.139.79.180

🇮🇳 Mumbai Stamp:
• 35.154.174.161
• 13.233.217.51

🔄 StatusCallback IPs:
• 13.127.149.191
• 13.234.181.224`
  }),

  [COMMANDS.TICKET_DRI]: (ticketId) => {
    if (!ticketId) {
      return { reply: '⚠️ Please provide a valid Ticket ID' };
    }
    return {
      reply: `🎫 Ticket Details:\n\n <a href="https://script.google.com/a/macros/exotel.com/s/AKfycbyxsFanQ0yjpXTntkvCraXAs6qObVoSXLGydz1Uz8SG_KhfCqeIOzAM99n98QG7ppMF/exec?id=${ticketId.toUpperCase()}" target="_blank" style="color: blue; text-decoration: none;">Click here to view ticket details for ${ticketId.toUpperCase()}</a>`
    };
  },


  [COMMANDS.NUMBER_VERIFY]: async (numbers) => {
    if (!numbers) {
      return { reply: '⚠️ Please provide numbers to verify' };
    }

    const numberList = numbers.split(',');
    const results = await Promise.all(
      numberList.map(async (number) => {
        try {
          const response = await axios.get(`https://my.exotel.com/exoapi/updateDevice?From=${number}`);
          return {
            number: number.trim(),
            status: response.status === 200 ? '✅ Verified' : '❌ Failed'
          };
        } catch (error) {
          return {
            number: number.trim(),
            status: '❌ Error during verification'
          };
        }
      })
    );

    const formattedResults = results.map(result => 
      `${result.number}: ${result.status}`
    ).join('\n');

    return {
      reply: `📱 Phone Number Verification Results:

${formattedResults}`
    };
  }
};

// Main chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const message = req.body.message?.toLowerCase() ?? '';
    console.log('👤 USER:', message);

    // Parse command and arguments
    const [command, ...args] = message.split(' ');
    const handler = commandHandlers[command];

    let response;
    if (handler) {
      response = await handler(args.join(' '));
    } else if (message.includes('hello')) {
      response = { 
        reply: `👋 Hi there! 

I'm your support bot. How can I assist you today?

Type "help" to see available commands.` 
      };
    } else {
      response = { 
        reply: `❓ I didn't understand that command.

Type "help" to see a list of available commands.` 
      };
    }

    console.log('🤖 BOT:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      reply: '⚠️ An error occurred while processing your request. Please try again.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});