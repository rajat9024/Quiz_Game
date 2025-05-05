const quizForm = document.getElementById('quiz-form');
const submitButton = document.getElementById('submit-button');
const resultsContainer = document.getElementById('results-container');
const scoreDisplay = document.getElementById('score');
const playAgainButton = document.getElementById('play-again-button');

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = {};
let quizData = []; // Initialize as an empty array

const apiUrl = 'https://opentdb.com/api.php?amount=5&difficulty=easy&type=multiple'; // Fetch 5 multiple-choice questions
// const apiUrl = 'https://opentdb.com/api.php?amount=15'; // You had this, but the fetch amount is controlled later
const numberOfQuestionsToFetch = 5; // Explicitly set the number of questions to fetch

async function fetchQuizQuestions() {
    try {
        const response = await fetch(apiUrl); // Use the predefined apiUrl
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return processApiResponse(data); // Function to format the API response
    } catch (error) {
        console.error('Error fetching quiz questions:', error);
        quizForm.innerHTML = '<p class="error">Failed to load questions. Please try again later.</p>';
        submitButton.classList.add('hidden');
        return [];
    }
}

function processApiResponse(apiResponse) {
    if (!apiResponse || !apiResponse.results) {
        console.error('Invalid API response:', apiResponse);
        return [];
    }
    return apiResponse.results.map(item => ({
        question: item.question,
        options: [...item.incorrect_answers, item.correct_answer].sort(() => Math.random() - 0.5), // Combine and shuffle options
        correctAnswer: item.correct_answer
    }));
}

async function loadQuiz() {
    quizForm.innerHTML = '';
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = {};
    resultsContainer.classList.add('hidden');
    submitButton.classList.remove('hidden');

    quizData = await fetchQuizQuestions(); // Fetch questions from the API

    if (quizData.length === 0) return; // Stop if no questions were fetched

    quizData.forEach((questionData, index) => {
        const questionContainer = document.createElement('div');
        questionContainer.classList.add('question-container');

        const questionText = document.createElement('p');
        questionText.classList.add('question-text');
        questionText.textContent = `${index + 1}. ${questionData.question}`;
        questionContainer.appendChild(questionText);

        const optionsList = document.createElement('ul');
        optionsList.classList.add('options-list');

        const allOptions = [...questionData.options]; // Use the shuffled options

        allOptions.forEach((option, optionIndex) => {
            const listItem = document.createElement('li');
            listItem.classList.add('option-item');

            const radioInput = document.createElement('input');
            radioInput.type = 'radio';
            radioInput.name = `q${index}`;
            radioInput.value = option;
            radioInput.classList.add('option-input');
            radioInput.id = `q${index}-${optionIndex}`;

            const label = document.createElement('label');
            label.textContent = option;
            label.htmlFor = `q${index}-${optionIndex}`;
            label.classList.add('option-label');

            listItem.appendChild(radioInput);
            listItem.appendChild(label);
            optionsList.appendChild(listItem);
        });

        questionContainer.appendChild(optionsList);
        quizForm.appendChild(questionContainer);
    });
}

function checkAnswers() {
    if (quizData.length === 0) return;

    score = 0;
    const questionContainers = document.querySelectorAll('.question-container');

    quizData.forEach((questionData, index) => {
        const selectedOption = quizForm.querySelector(`input[name="q${index}"]:checked`);

        if (selectedOption) {
            const userAnswer = selectedOption.value;
            userAnswers[`q${index}`] = userAnswer;
            if (userAnswer === questionData.correctAnswer) {
                score++;
            }
        }
    });

    displayResults();
}

function displayResults() {
    if (quizData.length === 0) return;

    scoreDisplay.textContent = `You scored ${score} out of ${quizData.length} questions correctly!`;
    resultsContainer.classList.remove('hidden');
    quizForm.classList.add('hidden');
    submitButton.classList.add('hidden');
}

function playAgain() {
    loadQuiz(); // Fetch new questions and reload
    quizForm.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    submitButton.classList.remove('hidden');
}

// Event Listeners
submitButton.addEventListener('click', checkAnswers);
playAgainButton.addEventListener('click', playAgain);

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', loadQuiz);