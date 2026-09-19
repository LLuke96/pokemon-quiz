let questions = [];
let pokemonData = [];
let currentQuestion = 0;

const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const questionCounter = document.getElementById("question-counter");
const progressFill = document.getElementById("progress-fill");

const resultsContainer = document.getElementById("results-container");
const restartButton = document.getElementById("restart-button");

const pokemonResult = document.getElementById("pokemon-result");
const pokemonImage = document.getElementById("pokemon-image");
const pokemonName = document.getElementById("pokemon-name");

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

async function loadPokemonResult() {
    const pokemon = getClosestPokemon();

    if (!pokemon) {
        return;
    }

    try {
        const response = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
        );

        if (!response.ok) {
            throw new Error("Impossibile recuperare il Pokémon.");
        }

        const data = await response.json();

        const artwork =
            data.sprites.other["official-artwork"].front_default;

        pokemonName.textContent = pokemon.name;

        pokemonImage.src = artwork;
        pokemonImage.alt = pokemon.name;

        pokemonResult.classList.remove("hidden");

    } catch (error) {
        console.error(error);

        pokemonName.textContent = pokemon.name;
        pokemonResult.classList.remove("hidden");
    }
}

function getClosestPokemon() {
    let closestPokemon = null;
    let closestDistance = Infinity;

    pokemonData.forEach((pokemon) => {
        let distance = 0;

        Object.keys(characterResults).forEach((axis) => {
            const userValue = normalizeResult(characterResults[axis]);
            const pokemonValue = pokemon.profile[axis];

            distance += Math.pow(userValue - pokemonValue, 2);
        });

        distance = Math.sqrt(distance);

        if (distance < closestDistance) {
            closestDistance = distance;
            closestPokemon = pokemon;
        }
    });

    return closestPokemon;
}

function normalizeResult(value) {
    const maxValue = 20;

    const clampedValue = Math.max(
        -maxValue,
        Math.min(maxValue, value)
    );

    return (clampedValue / maxValue) * 2;
}

async function loadQuestions() {
    try {
        const [questionsResponse, pokemonResponse] = await Promise.all([
            fetch("data/questions.json"),
            fetch("data/pokemon.json")
        ]);

        if (!questionsResponse.ok) {
            throw new Error("Impossibile caricare le domande.");
        }

        if (!pokemonResponse.ok) {
            throw new Error("Impossibile caricare i Pokémon.");
        }

        questions = await questionsResponse.json();
        pokemonData = await pokemonResponse.json();

        if (!Array.isArray(questions) || questions.length === 0) {
            throw new Error("Il file delle domande è vuoto o non valido.");
        }

        if (!Array.isArray(pokemonData) || pokemonData.length === 0) {
            throw new Error("Il file dei Pokémon è vuoto o non valido.");
        }

        showQuestion();

    } catch (error) {
        console.error(error);
        questionText.textContent =
            "Si è verificato un errore nel caricamento del quiz.";
    }
}

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

    loadPokemonResult();
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

