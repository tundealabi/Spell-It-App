((global)=>{ 
    class Welcome {
    constructor () {
        this.welcomeArea = document.querySelector(".welcome-area");
        this.form = document.querySelector("form");
        this.formInput = this.form.querySelector("input");
        this.formInputValue = this.formInput.value;
    }
    validate (value) {
        let regex = /^\D{1,6}$/;
        if(regex.test(value)) {
        this.formInputValue = value;
        this.displayPlayPage();
        }else {
            this.formInput.classList.add("error-username");
        }
    }
    displayPlayPage() {
        document.body.classList.remove("body-welcome");
        this.welcomeArea.classList.add("hide-content");
        spellPage.nav.classList.remove("hide-content");
        spellPage.mainTag.classList.remove("hide-content");
        spellPage.username.textContent = this.formInputValue;
        spellPage.username.style = "text-transform: capitalize";
        spellPage.chancesNo.textContent = spellPage.chancesCount;
        spellPage.scoreBoard.textContent = spellPage.scoreCount;
        spellPage.answerBtn.disabled = true;
        wordLibrary.highScore();
    }
}

class Spell {
    constructor () {
        this.nav = document.getElementById("navbar");
        this.aside = document.getElementById("aside-words");
        this.mainTag = document.getElementById("main");
        this.highscore = document.getElementById("score");
        this.leader = document.getElementById("user-highscore");
        this.username = document.getElementById("user");
        this.speaker = document.getElementById("speaker");
        this.listenBtn = document.getElementById("listen-btn");
        this.listenBool = true;
        this.scrambleArea = document.getElementById("scramble")
        this.scoreBoard = document.getElementById("score-board");
        this.chancesLeft = document.getElementById("chances-left");
        this.chancesNo = document.getElementById("chances-no");
        this.chancesCount = 3;
        this.scoreCount = 0;
        this.answerInput = document.getElementById("answer");
        this.answerBtn = document.getElementById("answer-btn");
        this.speechSynth = global.speechSynthesis;
        this.speechUtter = new SpeechSynthesisUtterance();
        this.incorrectSound = new Audio("./assets/audio/incorrect-answer-effect.mp3");
        this.correctSound = new Audio("./assets/audio/win-effect.mp3");
        this.gameOverSound = new Audio("./assets/audio/failure-sound-effect.mp3");
    }
    speakWord(word) {
        this.speechUtter.voice = this.speechSynth.getVoices()[5];
        this.speechUtter.rate = 0.5;
        this.speechUtter.pitch = 1.1;
        this.speechUtter.volume = 10;
        this.speechUtter.text = word;
        this.speechSynth.speak(this.speechUtter);
        if(this.speechSynth.speaking) {
            this.speaker.src = "./assets/img/sound.gif";
            this.listenBtn.disabled = true;
            spellPage.answerBtn.disabled = true;
        }
        this.speechUtter.onend = () =>{
            this.speaker.src = "./assets/img/sound.png";
            this.listenBtn.disabled = false;
            spellPage.answerBtn.disabled = false;
        }
    }
}

class Words{
    constructor () {
        this.wordStore = "";
        this.loadWordLibrary();
        this.wordBank = null;
    }
    loadWordLibrary() {
        fetch("js/words.json")
        .then(resp=>resp.json())
        .then(data=>this.analyseData(data));
    }
    analyseData(data) {
        this.wordBank = data;
    }
    randomGenWord() {
      let rand = Math.floor(Math.random()*this.wordBank.length);
      this.wordStore = this.wordBank[rand];
      spellPage.speakWord(this.wordBank[rand]);
      this.randomStrings(this.wordStore);
    }
    gamePlay() {
        let answer =  spellPage.answerInput.value.toLowerCase();
        let correctAns = this.wordStore.toLowerCase();
        if(answer === correctAns) {
            this.randomGenWord();
            this.asideWords(correctAns,"correct");
            spellPage.correctSound.play();
            spellPage.chancesCount++;
            spellPage.scoreCount += answer.length;
            spellPage.chancesNo.textContent = spellPage.chancesCount;
            spellPage.scoreBoard.textContent = spellPage.scoreCount;
            spellPage.answerInput.value = "";
        }else {
            spellPage.chancesCount--;
            if(spellPage.chancesCount === 0){
                this.highScore();
                spellPage.gameOverSound.play();
                spellPage.chancesLeft.textContent = "GAME OVER";
                spellPage.listenBtn.dataset.status = "replay";
                spellPage.listenBtn.textContent = "Replay";
                spellPage.answerBtn.disabled = true;
                spellPage.answerInput.value = "";
            }else{
                spellPage.incorrectSound.play();
                this.randomGenWord();
                spellPage.chancesNo.textContent = spellPage.chancesCount;
                spellPage.answerInput.value = "";
            }
            this.asideWords(correctAns,"miss");
        }
    }
    randomStrings (string) {
        spellPage.scrambleArea.innerHTML = "";
        let split = string.split("");
        let splitLength = split.length;
        for(let i = splitLength-1; i > 0; i--) {
            let rand = Math.floor(Math.random() * (i + 1));
            [split[i],split[rand]] = [split[rand],split[i]];
        }
        this.displayRandStrings(split.join(""));
    }
    displayRandStrings(str) {
        for(let i = 0; i < str.length; i++) {
            let para = document.createElement("p");
            para.textContent = str[i];
            spellPage.scrambleArea.appendChild(para);
        }
    }
    asideWords(word,status) {
        let para = document.createElement("p");
        para.textContent = word;
        if(status === "correct") {
            para.style = "color:green";
        }else{
            para.style = "color:red";
        }
        spellPage.aside.appendChild(para);
    }
    resetGamePlay () {
        spellPage.aside.innerHTML = "";
        spellPage.scrambleArea.innerHTML = "";
        spellPage.chancesCount = 3;
        spellPage.scoreCount = 0;
        spellPage.chancesLeft.innerHTML = `Chances Left: <span id="chances-no" class="chances-no">3</span>`;
        spellPage.chancesNo = document.getElementById("chances-no");
        spellPage.chancesNo.textContent = spellPage.chancesCount;
        spellPage.scoreBoard.textContent = spellPage.scoreCount;
        spellPage.listenBtn.dataset.status = "welcome";
        spellPage.listenBtn.textContent = "Start";
    }
    highScore() {
        let storageHighscore = JSON.parse(localStorage.getItem("HIGHSCORE")) || {highscore:30,username:"David"};
        if(spellPage.scoreCount > storageHighscore.highscore) {
            localStorage.setItem("HIGHSCORE",JSON.stringify({highscore:spellPage.scoreCount,username:welcomePage.formInputValue}));
            spellPage.scoreBoard.textContent += " (new highscore)";
            spellPage.highscore.textContent = JSON.parse(localStorage.getItem("HIGHSCORE")).highscore;
            spellPage.leader.textContent = JSON.parse(localStorage.getItem("HIGHSCORE")).username;
        }else {
            spellPage.highscore.textContent = storageHighscore.highscore;
            spellPage.leader.textContent = storageHighscore.username;
        }   
    }
}

let welcomePage = null;
let spellPage = null;
let wordLibrary = null;

document.addEventListener("DOMContentLoaded",()=>{
    welcomePage = new Welcome();
    spellPage = new Spell();
    wordLibrary = new Words();
    welcomePage.form.addEventListener("submit",(evet)=>{
        evet.preventDefault();
        welcomePage.validate(welcomePage.formInput.value);
    });
    //speak
    spellPage.listenBtn.dataset.status = "welcome";
    spellPage.listenBtn.addEventListener("click",()=>{
        if(spellPage.listenBtn.dataset.status === "welcome") {
            spellPage.listenBtn.dataset.status = "repeat";
            wordLibrary.randomGenWord();
            spellPage.listenBtn.textContent = "Repeat Word";
        }else if(spellPage.listenBtn.dataset.status === "repeat"){
            spellPage.speakWord(wordLibrary.wordStore);
        }else {
            wordLibrary.resetGamePlay();
        }
    })
    spellPage.answerBtn.addEventListener("click",()=>{
        wordLibrary.gamePlay();
    })
})
})(window);
