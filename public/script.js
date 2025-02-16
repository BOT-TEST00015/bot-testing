const API_URL = 'https://bot-testing-h66s.onrender.com/chat';
const messagesDiv = document.getElementById('messages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

function addMessage(text, isUser = false) {
  const messageEl = document.createElement('div');
  messageEl.classList.add('message', isUser ? 'userMessage' : 'botMessage');

  if (typeof text === 'object' && text.reply) {
    messageEl.innerHTML = text.reply.replace(/\n/g, '<br>');
  } else {
    messageEl.innerText = text;
  }

  messagesDiv.appendChild(messageEl);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage(message, true);
  userInput.value = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) throw new Error('Network error');

    const data = await response.json();
    addMessage(data);
  } catch (error) {
    addMessage('⚠️ Error processing your request.');
  }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Initial bot message
addMessage('👋 Hello! Type "help" to see available commands.');

function checkServerStatus() {
    fetch('https://bot-testing-h66s.onrender.com/chat', { method: 'HEAD' })  // Sending a HEAD request
      .then(response => {
        document.querySelector('.status').innerHTML = '<span class="status-dot online"></span> Online';
      })
      .catch(error => {
        document.querySelector('.status').innerHTML = '<span class="status-dot offline"></span> Offline';
      });
  }
  
  setInterval(checkServerStatus, 5000); // Check every 5 seconds
  checkServerStatus(); // Run on page load
  