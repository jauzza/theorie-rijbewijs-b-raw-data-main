let currentQuestionIndex = 0;
let questions = [];
let totalTime = 15 * 60; // 15 minutes in seconds
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
        startTimer();
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
}

function selectAnswer(selectedIndex) {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.answer;
    const selectedAnswer = currentQuestion.options[selectedIndex];

    // Check if the selected answer is correct
    if (selectedAnswer !== correctAnswer) {
        if (currentQuestion.category === "J") {
            remmenGasNietsErrors++;
        } else if (currentQuestion.category === "K") {
            kennisErrors++;
        } else if (currentQuestion.category === "G") {
            gevaarErrors++;
        }
    }

    // Automatically go to the next question
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

function startTimer() {
    timer = setInterval(() => {
        totalTime--;
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (totalTime <= 0) {
            clearInterval(timer);
            endQuiz();
        }
    }, 1000);
}
