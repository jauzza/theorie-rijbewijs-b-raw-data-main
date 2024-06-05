let currentQuestionIndex = 0;
let questions = [];
let timer;
let totalTime = 15 * 60; // 15 minutes in seconds

document.addEventListener('DOMContentLoaded', async () => {
    questions = await fetchQuestions();
    console.log('Loaded questions:', questions); // Debug statement
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
        return data;
    } catch (error) {
        console.error('Error loading questions:', error);
        return [];
    }
}

function showQuestion(question) {
    const questionContainer = document.getElementById('question');
    const answersContainer = document.getElementById('answers');
    const questionImage = document.getElementById('question-image');

    console.log('Showing question:', question); // Debug statement

    questionContainer.textContent = question.question || "Geen vraag beschikbaar";
    questionImage.src = question.image ? `public/assets/img/${question.image}` : "";
    answersContainer.innerHTML = '';

    if (question.options) {
        question.options.forEach((answer, index) => {
            if (answer) {  // Check if answer is not an empty string
                const button = document.createElement('button');
                button.textContent = answer;  // Correctly display the answer text
                button.onclick = () => selectAnswer(index);
                answersContainer.appendChild(button);
            }
        });
    } else {
        console.error('No options available for this question');
    }
}

function selectAnswer(selectedIndex) {
    const correctAnswer = parseInt(questions[currentQuestionIndex].correct, 10);
    if (selectedIndex === correctAnswer) {
        alert('Correct!');
    } else {
        alert('Onjuist, probeer het opnieuw.');
    }
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        currentQuestionIndex = 0;
        alert('Je hebt alle vragen beantwoord. We beginnen opnieuw.');
    }
    showQuestion(questions[currentQuestionIndex]);
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion(questions[currentQuestionIndex]);
    }
}

function startTimer() {
    timer = setInterval(() => {
        totalTime--;
        let minutes = Math.floor(totalTime / 60);
        let seconds = totalTime % 60;
        document.getElementById('time').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (totalTime <= 0) {
            clearInterval(timer);
            alert('Tijd is om!');
        }
    }, 1000);
}
