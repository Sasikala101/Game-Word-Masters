const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGTH = 5;
const ROUND = 6;

async function init() {
  let currentGuess = '';
  let currentRow = 0;
  let isLoading=false;

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObj = await res.json();
  const word = resObj.word.toUpperCase();
  const wordparts = word.split("");
  let done = false;
  setLoading(false);

  function addLetter(letter) {
    if (currentGuess.length < ANSWER_LENGTH) {
      currentGuess += letter;
    } else {
      currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
  }

  async function commit() {
    if (currentGuess.length !== ANSWER_LENGTH) {
      return;
    }

    isLoading = true;
    setLoading(true);

    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess })
    });

    const resObj = await res.json();
    const validword = resObj.validword;
    isLoading = false;
    setLoading(false);

    if (!validword) {
      markInvalidword();
      return;
    }

    const guessparts = currentGuess.split("");
    const map = makeMap(wordparts);

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessparts[i] === wordparts[i]) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
      }
    }

    for (let i = 0; i < ANSWER_LENGTH; i++) {
      if (guessparts[i] === wordparts[i]) {
        // Correct letter already marked
      } else if (wordparts.includes(guessparts[i]) && map[guessparts[i]] > 0) {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
        map[guessparts[i]]--;
      } else {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
      }
    }

    currentRow++;

    if (currentGuess === word) {
      alert('you win!');
      document.querySelector('.brand').classList.add("winner");
      done = true;
      return;
    } else if (currentRow === ROUND) {
      alert(`you lost, the word was ${word}`);
      done = true;
    }

    currentGuess = '';
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
  }

  function markInvalidword() {
    for (let i = 0; i < ANSWER_LENGTH; i++) {
      letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

      setTimeout(function () {
        letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
      }, 10);
    }
  }

  document.addEventListener('keydown', function handlekeypress(event) {
    if (done || isLoading) {
      return;
    }

    const action = event.key;

    if (action === 'Enter') {
      commit();
    } else if (action === 'Backspace') {
      backspace();
    } else if (isLetter(action)) {
      addLetter(action.toUpperCase());
    } 
    })

}
function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);
}
function setLoading(isLoading){
    loadingDiv.classList.toggle('show',isLoading)
}
function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
      const letter = array[i];
      if (obj[letter]) {
        obj[letter]++;
      } else {
        obj[letter] = 1;
      }
    }
    return obj;
  }
init();