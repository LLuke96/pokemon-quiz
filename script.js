let questions = [];
let currentQuestion = 0;

const characterResults = {
    intraprendenza: 0,
    riflessivita: 0,
    empatia: 0,
    socialita: 0,
    curiosita: 0,
    determinazione: 0
};

const axes = {
    intraprendenza: {
        name: "Intraprendenza",
        negative: "Prudente",
        positive: "Intraprendente"
    },
    riflessivita: {
        name: "Riflessività",
        negative: "Riflessivo",
        positive: "Impulsivo"
    },
    empatia: {
        name: "Empatia",
        negative: "Empatico",
        positive: "Distaccato"
    },
    socialita: {
        name: "Socialità",
        negative: "Solitario",
        positive: "Socievole"
    },
    curiosita: {
        name: "Curiosità",
        negative: "Conservatore",
        positive: "Esploratore"
    },
    determinazione: {
        name: "Determinazione",
        negative: "Flessibile",
        positive: "Tenace"
    }
};

const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const questionCounter = document.getElementById("question-counter");
const progressFill = document.getElementById("progress-fill");

const resultsContainer = document.getElementById("results-container");
const restartButton = document.getElementById("restart-button");


// --------------------------------------------------
// CARICAMENTO DOMANDE
// --------------------------------------------------

async function loadQuestions() {
    try {
        const response = await fetch("data/questions.json");

        if (!response.ok) {
            throw new Error("Impossibile caricare le domande.");
        }

        questions = await response.json();

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Il file delle domande è vuoto o non valido.");
        }

        showQuestion();

    } catch (error) {
        console.error(error);
        questionText.textContent = "Si è verificato un errore nel caricamento del quiz.";
    }
}


// --------------------------------------------------
// MOSTRA DOMANDA
// --------------------------------------------------

function showQuestion() {
    const question = questions[currentQuestion];

    questionText.textContent = question.question;

    questionCounter.textContent =
        `Domanda ${currentQuestion + 1} di ${questions.length}`;

    const progress =
        ((currentQuestion + 1) / questions.length) * 100;

    progressFill.style.width = `${progress}%`;

    answersContainer.innerHTML = "";

    question.answers.forEach((answer) => {

        const button = document.createElement("button");

        button.classList.add("answer-button");
        button.textContent = answer.text;

        button.addEventListener("click", () => {
            selectAnswer(answer);
        });

        answersContainer.appendChild(button);
    });
}


// --------------------------------------------------
// RISPOSTA
// --------------------------------------------------

function selectAnswer(answer) {

    // Applica gli effetti della risposta
    Object.entries(answer.effects).forEach(([axis, value]) => {

        if (characterResults.hasOwnProperty(axis)) {
            characterResults[axis] += value;
        }

    });

    // Passa alla domanda successiva
    currentQuestion++;

    if (currentQuestion >= questions.length) {
        showResults();
    } else {
        showQuestion();
    }
}


// --------------------------------------------------
// RISULTATI
// --------------------------------------------------

function showResults() {

    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");

    resultsContainer.innerHTML = "";

    Object.entries(axes).forEach(([axisId, axis]) => {

        const value = characterResults[axisId];

        /*
         * Per ora utilizziamo un range teorico di -20 / +20.
         * Lo modificheremo quando avremo deciso i punteggi
         * effettivi delle risposte.
         */

        const maxValue = 20;

        const clampedValue = Math.max(
            -maxValue,
            Math.min(maxValue, value)
        );

        // Trasforma -20...+20 in 0...100%
        const percentage =
            ((clampedValue + maxValue) / (maxValue * 2)) * 100;

        const resultElement = document.createElement("div");

        resultElement.classList.add("result-axis");

        resultElement.innerHTML = `
            <div class="axis-header">
                <span class="axis-name">${axis.name}</span>
                <span class="axis-label">${value}</span>
            </div>

            <div class="axis-bar">
                <div class="axis-center"></div>
                <div
                    class="axis-value"
                    style="left: ${percentage}%"
                ></div>
            </div>

            <div class="axis-labels">
                <span>${axis.negative}</span>
                <span>${axis.positive}</span>
            </div>
        `;

        resultsContainer.appendChild(resultElement);
    });
}


// --------------------------------------------------
// RESET
// --------------------------------------------------

function restartQuiz() {

    currentQuestion = 0;

    Object.keys(characterResults).forEach((axis) => {
        characterResults[axis] = 0;
    });

    resultScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");

    showQuestion();
}

restartButton.addEventListener("click", restartQuiz);


// --------------------------------------------------
// START
// --------------------------------------------------

loadQuestions();

