// Import readline to accept input from the terminal.
const readline = require("node:readline");

// Store the trivia questions in an array of objects.
const questions = [
  {
    question: "Which language runs directly in a web browser?",
    options: {
      A: "Python",
      B: "JavaScript",
      C: "C++",
      D: "Java",
    },
    answer: "B",
    explanation: "JavaScript is the primary programming language of the web.",
  },
  {
    question: "Which keyword declares a variable that can be reassigned?",
    options: {
      A: "const",
      B: "static",
      C: "let",
      D: "fixed",
    },
    answer: "C",
    explanation: "The let keyword declares a block-scoped, reassignable variable.",
  },
  {
    question: "Which method adds an element to the end of an array?",
    options: {
      A: "push()",
      B: "pop()",
      C: "shift()",
      D: "slice()",
    },
    answer: "A",
    explanation: "The push() method adds one or more elements to an array's end.",
  },
  {
    question: "Which array method creates a new array by transforming elements?",
    options: {
      A: "find()",
      B: "map()",
      C: "some()",
      D: "includes()",
    },
    answer: "B",
    explanation: "The map() method transforms each element into a new array element.",
  },
  {
    question: "Which function runs code after a specified delay?",
    options: {
      A: "forEach()",
      B: "JSON.parse()",
      C: "setTimeout()",
      D: "console.log()",
    },
    answer: "C",
    explanation: "setTimeout() schedules a callback to run after a delay.",
  },
];

// Set the time limit for answering each question.
const TIME_LIMIT = 15;

// Create a readline interface for terminal input.
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

// Ask the player a question and wait for their answer.
function askQuestion(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// Ask a question with a time limit.
function askWithTimeout(rl, prompt, seconds) {
  return new Promise((resolve) => {
    let finished = false;
    let remaining = seconds;

    console.log(`You have ${seconds} seconds to answer.`);

    const countdown = setInterval(() => {
      remaining -= 1;

      if (remaining > 0) {
        console.log(`Time remaining: ${remaining} seconds`);
      }
    }, 1000);

    const timeout = setTimeout(() => {
      if (finished) return;

      finished = true;
      clearInterval(countdown);

      console.log("\nTime is up!");

      // Close the interface so the game cannot wait indefinitely.
      rl.close();

      resolve(null);
    }, seconds * 1000);

    rl.question(prompt, (answer) => {
      if (finished) return;

      finished = true;

      clearTimeout(timeout);
      clearInterval(countdown);

      resolve(answer.trim());
    });
  });
}

// Display a question and its multiple-choice options.
function displayQuestion(question, index, total) {
  console.log("\n====================================");
  console.log(`QUESTION ${index + 1} OF ${total}`);
  console.log("====================================");
  console.log(question.question);

  // Display the answer options.
  Object.entries(question.options).forEach(([letter, option]) => {
    console.log(`${letter}. ${option}`);
  });
}

// Check the player's answer and provide immediate feedback.
function checkAnswer(question, userAnswer) {
  const answer = userAnswer.toUpperCase();

  if (answer === question.answer) {
    console.log("Correct! Well done!");
    return true;
  }

  console.log(
    `Incorrect! The correct answer is ${question.answer}. ` +
      question.options[question.answer]
  );

  return false;
}

// Display the player's final results.
function displayResults(score, total, results) {
  const percentage = Math.round((score / total) * 100);

  console.log("\n====================================");
  console.log("             GAME OVER");
  console.log("====================================");

  console.log(`Questions answered correctly: ${score}/${total}`);
  console.log(`Final percentage: ${percentage}%`);

  if (percentage === 100) {
    console.log("Excellent! You answered every question correctly!");
  } else if (percentage >= 60) {
    console.log("Good job! Keep practicing to improve your score.");
  } else {
    console.log("Keep learning! You can try again and improve your score.");
  }

  console.log("\nYour answer summary:");

  // Use array iteration to display the results.
  results.forEach((result, index) => {
    console.log(`\nQuestion ${index + 1}: ${result.question}`);
    console.log(`Your answer: ${result.userAnswer}`);
    console.log(`Correct answer: ${result.correctAnswer}`);
    console.log(`Result: ${result.correct ? "Correct" : "Incorrect"}`);
  });

  console.log("\nThank you for playing!");
}

// Run one complete quiz.
async function startGame() {
  const rl = createInterface();

  let score = 0;
  const results = [];

  console.log("\n====================================");
  console.log("       JAVASCRIPT TRIVIA GAME");
  console.log("====================================");
  console.log(`There are ${questions.length} questions.`);
  console.log(`You have ${TIME_LIMIT} seconds per question.`);
  console.log("Enter A, B, C, or D to select an answer.");

  const start = await askQuestion(
    rl,
    "\nAre you ready to start? Type yes to begin: "
  );

  if (start.toLowerCase() !== "yes") {
    console.log("Game cancelled. Run the program again when you're ready.");
    rl.close();
    return;
  }

  // Loop through the questions one at a time.
  for (let i = 0; i < questions.length; i++) {
    const currentQuestion = questions[i];

    displayQuestion(currentQuestion, i, questions.length);

    const userAnswer = await askWithTimeout(
      rl,
      "\nYour answer (A, B, C, or D): ",
      TIME_LIMIT
    );

    // Stop the game if the player runs out of time.
    if (userAnswer === null) {
      console.log("The quiz ended because you ran out of time.");
      break;
    }

    const normalizedAnswer = userAnswer.toUpperCase();

    // Validate the input before checking the answer.
    if (!["A", "B", "C", "D"].includes(normalizedAnswer)) {
      console.log("Invalid choice. Please enter A, B, C, or D.");

      results.push({
        question: currentQuestion.question,
        userAnswer: userAnswer || "(empty)",
        correctAnswer: currentQuestion.answer,
        correct: false,
      });

      continue;
    }

    // Check the answer and update the score.
    const correct = checkAnswer(currentQuestion, normalizedAnswer);

    if (correct) {
      score++;
    }

    results.push({
      question: currentQuestion.question,
      userAnswer: normalizedAnswer,
      correctAnswer: currentQuestion.answer,
      correct: correct,
    });
  }

  // Display results even if the quiz ends early.
  rl.close();
  displayResults(score, questions.length, results);
}

// Start the application and handle unexpected errors.
startGame().catch((error) => {
  console.error("An unexpected error occurred:", error.message);
  process.exitCode = 1;
});