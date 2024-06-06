let currentQuestionIndex = 0;
let questions = [];
let totalTime = 15 * 60; // 15 minutes in seconds
let questionTimer;
let questionTime = 8; // 8 seconds per question for "remmen, gas los laten of niets doen"
let remmenGasNietsErrors = 0;
let kennisErrors = 0;
let gevaarErrors = 0;
let maxRemmenGasNietsErrors = 2;
let maxKennisErrors = 4;
let maxGevaarErrors = 4;

document.addEventListener('DOMContentLoaded', async () => {
    questions = await fetchQuestions();
    if (questions.length > 0) {
        showQuestion(questions[currentQuestionIndex]);
        startTotalTimer();
    } else {
        alert('Geen vragen gevonden!');
    }
});

async function fetchQuestions() {
    try {
        const response = await fetch('questions_car_nl.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        const data = await response.json();
        return data.remmen_gas_niets.concat(data.kennisvragen, data.gevaarherkenning);
    } catch (error) {
        console.error('Error loading questions:', error);
        return [];
    }
}

function showQuestion(question) {
    const questionContainer = document.getElementById('question');
    const answersContainer = document.getElementById('answers');
    const questionImage = document.getElementById('question-image');
    const titleElement = document.querySelector('.header h2'); // Selecteer het h2-element

    // Vul de titel van de vraagcategorie in het h2-element in
    titleElement.textContent = getCategoryTitle(question.category);

    questionContainer.textContent = question.question || "Geen vraag beschikbaar";
    questionImage.src = question.image ? `public/assets/img/${question.image}` : "";
    answersContainer.innerHTML = '';

    if (question.options) {
        question.options.forEach((answer, index) => {
            if (answer) {
                const button = document.createElement('button');
                button.textContent = answer;
                button.onclick = () => selectAnswer(index);
                answersContainer.appendChild(button);
            }
        });
    } else {
        console.error('No options available for this question');
    }

    if (question.category === "J") {
        startQuestionTimer();
    } else {
        clearQuestionTimer();
    }
}

// Functie om de titel van de vraagcategorie op te halen op basis van de categoriecode
function getCategoryTitle(category) {
    switch (category) {
        case "J":
            return "Gevaarherkenning";
        case "K":
            return "Kennisvragen";
        case "G":
            return "Situaties";
        default:
            return "Onbekend";
    }
}


function startQuestionTimer() {
    let timeLeft = questionTime;
    updateQuestionTimer(timeLeft);

    if (questionTimer) {
        clearInterval(questionTimer);
    }

    questionTimer = setInterval(() => {
        timeLeft--;
        updateQuestionTimer(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            nextQuestion();
        }
    }, 1000);
}

function clearQuestionTimer() {
    if (questionTimer) {
        clearInterval(questionTimer);
        document.getElementById('question-timer').textContent = '';
    }
}

function updateQuestionTimer(time) {
    document.getElementById('question-timer').textContent = `Tijd: ${time}s`;
}

function selectAnswer(selectedIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    const selectedAnswer = currentQuestion.options[selectedIndex];

    if (questionTimer) {
        clearInterval(questionTimer);
    }

    if (selectedAnswer !== correctAnswer) {
        if (currentQuestion.category === "J") {
            remmenGasNietsErrors++;
        } else if (currentQuestion.category === "K") {
            kennisErrors++;
        } else if (currentQuestion.category === "G") {
            gevaarErrors++;
        }
    }

    nextQuestion();
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
    } else {
        showQuestion(questions[currentQuestionIndex]);
    }
}

function endQuiz() {
    if (questionTimer) {
        clearInterval(questionTimer);
    }

    let result = '';
    if (remmenGasNietsErrors > maxRemmenGasNietsErrors) {
        result += 'Te veel fouten bij Remmen, Gas loslaten of Niets doen. Je bent gezakt.\n';
    }
    if (kennisErrors > maxKennisErrors) {
        result += 'Te veel fouten bij Kennisvragen. Je bent gezakt.\n';
    }
    if (gevaarErrors > maxGevaarErrors) {
        result += 'Te veel fouten bij Gevaarherkenning. Je bent gezakt.\n';
    }
    if (!result) {
        result = 'Gefeliciteerd! Je bent geslaagd.';
    }
    alert(result);
}

function startTotalTimer() {
    const totalTimeElement = document.getElementById('time');
    const timer = setInterval(() => {
        totalTime--;
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        totalTimeElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (totalTime <= 0) {
            clearInterval(timer);
            endQuiz();
        }
    }, 1000);
}

// Definieer de functie voor het teruggaan naar de vorige vraag
function previousQuestion() {
    currentQuestionIndex--;
    showQuestion(questions[currentQuestionIndex]);
}

// Update de showQuestion functie met de controle voor de "Vorige vraag" knop
function showQuestion(question) {
    const questionContainer = document.getElementById('question');
    const answersContainer = document.getElementById('answers');
    const questionImage = document.getElementById('question-image');
    const backButton = document.getElementById('back-button'); // Voeg deze regel toe

    questionContainer.textContent = question.question || "Geen vraag beschikbaar";
    questionImage.src = question.image ? `public/assets/img/${question.image}` : "";
    answersContainer.innerHTML = '';

    if (question.options) {
        question.options.forEach((answer, index) => {
            if (answer) {
                const button = document.createElement('button');
                button.textContent = answer;
                button.onclick = () => selectAnswer(index);
                answersContainer.appendChild(button);
            }
        });
    } else {
        console.error('No options available for this question');
    }

    // Controleer of de vraag tot de categorie "J" behoort om de "Vorige vraag" knop te tonen of te verbergen
    if (question.category === "J") {
        startQuestionTimer();
        backButton.style.display = "none"; // Verberg de "Vorige vraag" knop bij "J" vragen
    } else {
        clearQuestionTimer();
        // Laat de "Vorige vraag" knop zien als de huidige vraag niet de eerste is
        backButton.style.display = currentQuestionIndex > 0 ? "block" : "none";
        backButton.onclick = () => previousQuestion(); // Voeg een event listener toe voor terugklikken
    }
}
function previousQuestion() {
    if (currentQuestionIndex > 0 && questions[currentQuestionIndex - 1].category !== "J") {
        currentQuestionIndex--;
        showQuestion(questions[currentQuestionIndex]);
    }
}
document.addEventListener('DOMContentLoaded', async () => {
    questions = await fetchQuestions();
    if (questions.length > 0) {
        showQuestion(questions[currentQuestionIndex]);
        startTotalTimer();
        setSectionTitle(questions[currentQuestionIndex].category); // Roep de setSectionTitle functie aan bij het laden van de pagina
    } else {
        alert('Geen vragen gevonden!');
    }
});

function setSectionTitle(category) {
    const sectionTitle = document.querySelector('.header h2');
    switch(category) {
        case 'J':
            sectionTitle.textContent = 'Gevaarherkenning';
            break;
        case 'K':
            sectionTitle.textContent = 'Kennisvragen';
            break;
        case 'G':
            sectionTitle.textContent = 'Situaties';
            break;
        default:
            sectionTitle.textContent = 'Onderdeel';
            break;
    }
}
