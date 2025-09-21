const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion");
const toggleThemeButton = document.querySelector("#theme-toggle-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;

const API_KEY = "YOUR-API-KEY-HERE";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// Keywords to filter only mental health queries
const mentalHealthKeywords = [
  "stress", "anxiety", "depression", "mental health", "emotions", "panic", "sad", "lonely",
  "study", "academics", "negative", "thoughts", "stressful", "overwhelmed", "tired", "burnout",
  "motivation", "self-care", "support", "fear", "worry", "therapy", "balance", "academic",
  "well-being", "sleep", "relax", "confusion", "confused", "stress", "anxiety", "depression", "mental health", "emotions", "panic", "sad", "lonely", "hi", "hello", "study", "academics", "negative", "thoughts", "stressful", "overwhelmed", "tired", "burnout", "motivation", "self-care", "support", "fear", "worry", "therapy", "balance", "academic", "mental", "well-being", "sleep", "relax", "confusion", "confused"
];

const isMentalHealthRelated = (message) => {
  const lower = message.toLowerCase();
  return mentalHealthKeywords.some(keyword => lower.includes(keyword));
};

const loadDataFromLocalstorage = () => {
  const savedChats = localStorage.getItem("saved-chats");
  const isLightMode = (localStorage.getItem("themeColor") === "light_mode");
  document.body.classList.toggle("light_mode", isLightMode);
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
  chatContainer.innerHTML = savedChats || '';
  document.body.classList.toggle("hide-header", savedChats);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
};

const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

const showTypingEffect = (text, textElement, incomingMessageDiv) => {
  const words = text.split(' ');
  let index = 0;
  const interval = setInterval(() => {
    textElement.innerText += (index === 0 ? '' : ' ') + words[index++];
    incomingMessageDiv.querySelector(".icon").classList.add("hide");
    if (index === words.length) {
      clearInterval(interval);
      isResponseGenerating = false;
      incomingMessageDiv.querySelector(".icon").classList.remove("hide");
      localStorage.setItem("saved-chats", chatContainer.innerHTML);
    }
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
  }, 75);
};

const generateAPIResponse = async (incomingMessageDiv) => {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{
            text: `You are a mental health chatbot named HUMAAN. you also know previous chats
You only help with emotional wellness, stress, anxiety, and balance. 
Keep all responses to the point. 
Do not answer anything unrelated to mental health. 
Be kind, brief, and give advice.\n\nUser: ${userMessage}`
          }]
        }]
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);

    const reply = data?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
    showTypingEffect(reply, textElement, incomingMessageDiv);
  } catch (error) {
    isResponseGenerating = false;
    textElement.innerText = error.message;
    textElement.parentElement.closest(".message").classList.add("error");
  } finally {
    incomingMessageDiv.classList.remove("loading");
  }
};

const showLoadingAnimation = () => {
  const html = `<div class="message-content">
                  <img class="avatar" src="../logo.png" alt="Bot avatar">
                  <p class="text"></p>
                  <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                  </div>
                </div>
                <span onClick="copyMessage(this)" class="icon material-symbols-rounded">content_copy</span>`;

  const incomingMessageDiv = createMessageElement(html, "incoming", "loading");
  chatContainer.appendChild(incomingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  generateAPIResponse(incomingMessageDiv);
};

const copyMessage = (copyButton) => {
  const messageText = copyButton.parentElement.querySelector(".text").innerText;
  navigator.clipboard.writeText(messageText);
  copyButton.innerText = "done";
  setTimeout(() => copyButton.innerText = "content_copy", 1000);
};

const handleOutgoingChat = () => {
  userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
  if (!userMessage || isResponseGenerating) return;

  // Show user's message in chat (always)
  const html = `<div class="message-content">
                  <img class="avatar" src="user.png" alt="User avatar">
                  <p class="text"></p>
                </div>`;
  const outgoingMessageDiv = createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = userMessage;
  chatContainer.appendChild(outgoingMessageDiv);
  chatContainer.scrollTo(0, chatContainer.scrollHeight);
  typingForm.reset();
  document.body.classList.add("hide-header");

  // Check if it's a mental health query
  if (!isMentalHealthRelated(userMessage)) {
    const html = `<div class="message-content">
                    <img class="avatar" src="../logo.png" alt="Bot avatar">
                    <p class="text">I'm here to support your mental and emotional health. Let's keep our conversation focused on that 💙</p>
                  </div>
                  <span class="icon material-symbols-rounded">mood</span>`;
    const warningMessage = createMessageElement(html, "incoming");
    chatContainer.appendChild(warningMessage);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    return;
  }

  // Proceed with response generation
  isResponseGenerating = true;
  setTimeout(showLoadingAnimation, 500);
};


toggleThemeButton.addEventListener("click", () => {
  const isLightMode = document.body.classList.toggle("light_mode");
  localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
  toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});

deleteChatButton.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete all the chats?")) {
    localStorage.removeItem("saved-chats");
    loadDataFromLocalstorage();
  }
});

suggestions.forEach(suggestion => {
  suggestion.addEventListener("click", () => {
    userMessage = suggestion.querySelector(".text").innerText;
    handleOutgoingChat();
  });
});

typingForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleOutgoingChat();
});

loadDataFromLocalstorage();
