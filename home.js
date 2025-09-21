// ------------------- Page & Tab Utilities -------------------
function refreshPage() {
    const activeTab = localStorage.getItem("activeTab") || "profile";
    loadContent(activeTab); // reload current tab without losing state
}

function clearActiveTabs() {
    document.querySelectorAll(".sidebar ul li").forEach(tab => tab.classList.remove("active"));
}

// ------------------- User State -------------------
function saveUserState(tab, state) {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;
    localStorage.setItem(`${tab}_state_${userEmail}`, JSON.stringify(state));
}

function loadUserState(tab) {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return null;
    const state = localStorage.getItem(`${tab}_state_${userEmail}`);
    return state ? JSON.parse(state) : null;
}

// ------------------- Quiz -------------------
const questions = [
    "😞 Little interest or pleasure in doing things?",
    "😔 Feeling down, depressed, or hopeless?",
    "😴 Trouble sleeping or sleeping too much?",
    "😩 Feeling tired or having little energy?",
    "🍔 Poor appetite or overeating?",
    "🙁 Feeling bad about yourself or feeling like a failure?",
    "🤯 Trouble concentrating?",
    "🐢 Moving or speaking so slowly others noticed?",
    "💭 Thoughts of self-harm or hopelessness?",
    "📚 Feeling overwhelmed by academic tasks?",
    "🕒 Trouble managing time effectively?",
    "📈 Pressure to meet high expectations?",
    "📝 Frequent test anxiety?",
    "🎓 Struggling to balance study and life?",
    "📉 Lack of motivation to study?"
];

let currentQ = 0;
let score = 0;

function startQuiz() {
    currentQ = 0;
    score = 0;
    const intro = document.getElementById("quizIntro");
    const quizSection = document.getElementById("quizSection");
    if (intro) intro.style.display = "none";
    if (quizSection) quizSection.style.display = "block";
    showQuestion();
}

function showQuestion() {
    const card = document.getElementById("quizCard");
    if (!card) return;

    if (currentQ >= questions.length) {
        saveQuizHistory();
        displayQuizResults(card);
        updateProgress();
        return;
    }

    const q = questions[currentQ];
    card.classList.remove("animate");
    void card.offsetWidth; // trigger reflow for animation
    card.classList.add("animate");

    card.innerHTML = `
        <h5>${q}</h5>
        <button class="option-btn" onclick="nextQuestion(0)">Not at all</button>
        <button class="option-btn" onclick="nextQuestion(1)">Several days</button>
        <button class="option-btn" onclick="nextQuestion(2)">More than half the days</button>
        <button class="option-btn" onclick="nextQuestion(3)">Nearly every day</button>
    `;
    updateProgress();
}

function nextQuestion(points) {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return alert("User not logged in");

    score += points;
    currentQ++;
    saveUserState('quiz', { currentQ, score });
    showQuestion();
}

function updateProgress() {
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = `${(currentQ / questions.length) * 100}%`;
}

function saveQuizHistory() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const history = JSON.parse(localStorage.getItem(`quizHistory_${userEmail}`)) || [];
    history.push({
        date: new Date().toLocaleString(),
        score: score,
        total: questions.length * 3
    });
    localStorage.setItem(`quizHistory_${userEmail}`, JSON.stringify(history));
}

function displayQuizResults(card) {
    card.innerHTML = `
        <h4>✅ Quiz Completed</h4>
        <p>Your Score: <strong>${score} / ${questions.length * 3}</strong></p>
        <div id="recommendations" style="margin-left:20px;"></div>
        <button class="btn btn-success mt-3" onclick="startQuiz()" style="margin-left:20px;">Retake Quiz</button>
    `;

    const recommendations = document.getElementById("recommendations");

    if (score <= 10) {
        recommendations.innerHTML = `
            <h5>🌟 You're doing well! Let's keep that momentum going.</h5>
            <ul>
                <li>💆‍♂️ Continue prioritizing self-care.</li>
                <li>🫂 Spend time with friends and loved ones.</li>
                <li>🎨 Enjoy hobbies or creative activities.</li>
            </ul>`;
    } else if (score <= 20) {
        recommendations.innerHTML = `
            <h5>😊 You're doing okay.</h5>
            <ul>
                <li>⚖️ Balance work-life.</li>
                <li>🏃‍♂️ Add physical activity.</li>
                <li>🧘‍♀️ Practice mindfulness.</li>
                <li>🌍 Stay socially engaged.</li>
            </ul>`;
    } else if (score <= 30) {
        recommendations.innerHTML = `
            <h5>🙂 Some difficulties, but you're not alone.</h5>
            <ul>
                <li>📝 Keep a journal.</li>
                <li>🎯 Set small goals.</li>
                <li>👥 Stay connected.</li>
                <li>⏸️ Take regular breaks.</li>
            </ul>`;
    } else {
        recommendations.innerHTML = `
            <h5>😟 Significant mental health challenges.</h5>
            <ul>
                <li>💬 Speak with a professional.</li>
                <li>🧘‍♂️ Try mindfulness.</li>
                <li>😴 Prioritize sleep & diet.</li>
                <li>💖 Regular counseling.</li>
            </ul>`;
    }
}

// ------------------- Load Content -------------------
function loadContent(section) {
    clearActiveTabs();
    document.getElementById(`${section}-tab`).classList.add("active");
    const mainContent = document.getElementById("main-content");

    switch (section) {
        case "dashboard":
            mainContent.innerHTML = `
            <div class="quiz-container">
                <div id="quizIntro">
                    <h2>🧠 Mental Health & Academic Wellness Quiz</h2>
                    <p>This quiz is designed to help you reflect on your emotional well-being, academic stress, and self-care habits. It takes just 10 minutes to complete and will give you personalized suggestions based on your responses.</p>
                    <ul>
                        <li>💡 Understand your current mental and emotional state</li>
                        <li>📊 Track patterns over time (history is saved locally)</li>
                        <li>🔐 Completely private — your answers are not shared</li>
                    </ul>
                    <p>Click the button below to begin the quiz when you're ready.</p>
                    <div class="button-container" style="display:flex; justify-content:center; margin-bottom:20px;">
            <button 
                class="btn-primary" 
                onclick="startQuiz()" 
                style="
                    padding: 12px 28px;
                    font-size: 1rem;
                    border-radius: 12px;
                    background: linear-gradient(90deg, #8e44ad, #6f3df5);
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                "
            >
                Start Quiz
            </button>
        </div>
                </div>
                <div id="quizSection" style="display:none;">
                    <h2>🧠 Mental Health & Academic Wellness Quiz</h2>
                    <div id="progressContainer"><div id="progressBar"></div></div>
                    <div id="quizCard" class="quiz-card animate"></div>
                </div>
            </div>
            `;

            // Restore quiz state AFTER DOM exists
            const savedQuiz = loadUserState('quiz');
            if (savedQuiz) {
                currentQ = savedQuiz.currentQ;
                score = savedQuiz.score;
                document.getElementById("quizIntro").style.display = "none";
                document.getElementById("quizSection").style.display = "block";
                showQuestion();
            }
            break;

        case "chatbot":
    mainContent.innerHTML = `
    <div id="chatbotDescription" class="content-card">
        <h2 class="chatbot-heading">HUMAAN: Your Mental Wellness Chatbot</h2>

        <p class="mb-3">
            Meet <strong>HUMAAN</strong>, your 24/7 virtual companion for mental wellness. 
            Whether you're feeling stressed, anxious, low on motivation, or just need someone to talk to, HUMAAN is here to help.
        </p>

        <h3>🌟 What can it help you with?</h3>
        <ul class="chatbot-list">
            <li>🧘 Stress and anxiety relief techniques</li>
            <li>🎯 Focus and productivity support</li>
            <li>📚 Academic pressure guidance</li>
            <li>💬 Emotional encouragement & grounding conversations</li>
        </ul>

        <h3 class="mt-4">📌 How to use it?</h3>
        <ul class="chatbot-list">
            <li>Type a question or feeling you'd like to talk about</li>
            <li>Get instant, empathetic responses</li>
        </ul>

        <div class="mt-4" style="text-align:center;">
            <button class="btn-primary" onclick="openChatbot()">🚀 Launch Chat Assistant</button>
        </div>
    </div>

    <div id="chatbotFrameContainer" class="content-card" style="display:none; height:580px; margin-top:20px;">
        <iframe id="chatbotFrame" src="" class="chatbot-iframe"></iframe>
    </div>
    `;

    const savedChat = loadUserState('chatbot');
    if (savedChat && savedChat.opened) openChatbot();
    break;


        case "consultants":
    mainContent.innerHTML = `
    <div class="content-card">
        <h2>🔎 Find Mental Health Consultants</h2>
        <p>Enter your city or area to find nearby mental health professionals.</p>
        
        <div class="form-group" style="margin: 20px 0;">
            <input 
                type="text" 
                id="locationInput" 
                class="form-control" 
                placeholder="e.g., Mumbai, Delhi" 
                onkeydown="handleKeyPress(event)" 
                style="
                    width: 100%;
                    padding: 12px 16px;
                    border-radius: 12px;
                    border: 1px solid #555;
                    background-color: #2e2e3f;
                    color: #fff;
                    font-size: 1rem;
                "
            />
        </div>

        <div class="button-container" style="display:flex; justify-content:center; margin-bottom:20px;">
            <button 
                class="btn-primary" 
                onclick="searchConsultants()" 
                style="
                    padding: 12px 28px;
                    font-size: 1rem;
                    border-radius: 12px;
                    background: linear-gradient(90deg, #8e44ad, #6f3df5);
                    color: #fff;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                "
            >
                Search
            </button>
        </div>

        <div id="mapResult" style="margin-top: 20px;"></div>
    </div>
    `;

    // Load saved user state for consultants
    const savedConsultants = loadUserState('consultants');
    if (savedConsultants && savedConsultants.location) {
        const input = document.getElementById("locationInput");
        input.value = savedConsultants.location;
        renderConsultants(savedConsultants.location);
    }
    break;


        case "resources":
            mainContent.innerHTML = `
            <div class="content-card">
                <h2>📖 Health & Wellness Resources</h2>
                <p><strong>General Healthcare Tips:</strong></p>
                <ul>
                    <li>🧘‍♂️ Stay hydrated by drinking enough water daily.</li>
                    <li>🛌 Ensure you get at least 7-8 hours of sleep.</li>
                    <li>🥗 Maintain a balanced diet, including fruits and vegetables.</li>
                    <li>🏃 Exercise regularly to stay active and reduce stress.</li>
                </ul>
                <h3 class="mt-4">📹 Recommended Videos</h3>
                <div class="embed-responsive embed-responsive-16by9 mb-3">
                    <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/3QIfkeA6HBY" allowfullscreen></iframe>
                </div>
                <div class="embed-responsive embed-responsive-16by9 mb-3">
                    <iframe class="embed-responsive-item" src="https://www.youtube.com/embed/ZToicYcHIOU" allowfullscreen></iframe>
                </div>
                <h3 class="mt-4">📰 Blogs & Articles</h3>
                <ul>
                    <li><a href="https://www.healthline.com/" target="_blank">Healthline</a> - Trusted health information and advice.</li>
                    <li><a href="https://www.mayoclinic.org/" target="_blank">Mayo Clinic</a> - Expert health articles and resources.</li>
                    <li><a href="https://www.webmd.com/" target="_blank">WebMD</a> - Medical news and expert advice.</li>
                </ul>
            </div>
            `;
            break;

        case "profile":
            const name = localStorage.getItem("userName") || "User";
            const phone = localStorage.getItem("userPhoneNumber") || "Not available";
            const userEmail = localStorage.getItem("userEmail") || "defaultUser";
            const history = JSON.parse(localStorage.getItem(`quizHistory_${userEmail}`)) || [];

            mainContent.innerHTML = `
            <div class="content-card">
                <h2>📝 Profile</h2>
                <p>👤 <strong>Name:</strong> ${name}</p>
                <p>📧 <strong>Email:</strong> ${userEmail}</p>
                <p>📞 <strong>Phone:</strong> ${phone}</p>
                <h5>📊 <strong>Quiz History:</strong></h5>
                <ul style="margin-left:50px;">
                    ${history.length > 0 ? history.map(entry => `<li>${entry.date} : ${entry.score}/${entry.total}</li>`).join('') : '<li>No quiz history yet.</li>'}
                </ul>
                <button class="btn btn-warning mt-3" onclick="clearQuizHistory()">Clear Quiz History</button>
                <button class="btn btn-danger mt-1" onclick="logout()">Logout</button>
            </div>`;
            break;

        default:
            mainContent.innerHTML = `<div class="content-card"><h1>Welcome</h1></div>`;
            break;
    }

    localStorage.setItem("activeTab", section);
}

// ------------------- Other Utilities -------------------
function openChatbot() {
    const desc = document.getElementById("chatbotDescription");
    const container = document.getElementById("chatbotFrameContainer");
    const frame = document.getElementById("chatbotFrame");

    if (desc) desc.style.display = "none";
    if (container) container.style.display = "block";
    frame.src = "./chatbot/index.html";

    saveUserState('chatbot', { opened: true });
}

function searchConsultants() {
    const location = document.getElementById("locationInput").value;
    if (!location) return alert("Please enter a location.");

    const query = `mental health consultants in ${location}`;
    const mapResult = document.getElementById("mapResult");

    mapResult.innerHTML = `
        <h3 style="font-size:1.2rem;">🗺️ Consultants in ${location}</h3>
        <div class="map-container">
            <iframe 
                src="https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed"
                width="200%" 
                height="600" 
                style="border:0; border-radius:10px;" 
                allowfullscreen 
                loading="lazy">
            </iframe>
        </div>
    `;

    saveUserState('consultants', { location });
    renderConsultants(location);
}

function renderConsultants(location) {
    // Optional: render custom cards here
}

function clearQuizHistory() {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return alert("User email not found.");
    localStorage.removeItem(`quizHistory_${userEmail}`);
    loadContent("profile");
}

function logout() {
    localStorage.clear();
    alert("Logged out.");
    window.location.href = "./login.html";
}

function handleKeyPress(event) {
    if (event.key === 'Enter') searchConsultants();
}

// ------------------- On Load -------------------
window.onload = () => {
    const activeTab = localStorage.getItem("activeTab") || "profile";
    loadContent(activeTab);
};
