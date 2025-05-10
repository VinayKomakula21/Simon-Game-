const buttonColours = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];
let level = 0;
let started = false;
let strictMode = false;
let score = 0;
let highScore = localStorage.getItem('simonHighScore') || 0;
let isPowered = false;
let isPaused = false;
let difficulty = 'easy';
let countdownInterval;
let sequenceInterval;

// Game settings based on difficulty
const difficultySettings = {
  easy: { sequenceSpeed: 600, fadeSpeed: 100 },
  medium: { sequenceSpeed: 500, fadeSpeed: 80 },
  hard: { sequenceSpeed: 400, fadeSpeed: 60 }
};

// Update high score display
$("#high-score").text(highScore);

// Power button handler
$("#power-button").click(function() {
  isPowered = !isPowered;
  $(this).toggleClass("active");
  
  if (isPowered) {
    enableControls();
    $("#level-title").text("Press Start");
  } else {
    disableControls();
    resetGame();
    $("#level-title").text("Power Off");
  }
});

// Start button click handler
$("#start-button").click(function() {
  if (!started && isPowered) {
    startCountdown();
  }
});

// Strict mode toggle
$("#strict-button").click(function() {
  if (!isPowered) return;
  strictMode = !strictMode;
  $(this).toggleClass("active");
  if (strictMode) {
    $(this).html('<i class="fas fa-lock-open"></i> Strict');
  } else {
    $(this).html('<i class="fas fa-lock"></i> Strict');
  }
});

// Difficulty toggle
$("#difficulty-button").click(function() {
  if (!isPowered) return;
  const difficulties = ['easy', 'medium', 'hard'];
  const currentIndex = difficulties.indexOf(difficulty);
  difficulty = difficulties[(currentIndex + 1) % difficulties.length];
  $(this).html(`<i class="fas fa-tachometer-alt"></i> ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}`);
});

// Pause button handler
$("#pause-button").click(function() {
  if (!isPowered || !started) return;
  isPaused = !isPaused;
  $(this).toggleClass("active");
  
  if (isPaused) {
    clearInterval(sequenceInterval);
    $("#level-title").text("Paused");
    $(this).html('<i class="fas fa-play"></i> Resume');
  } else {
    $("#level-title").text("Level " + level);
    $(this).html('<i class="fas fa-pause"></i> Pause');
    playSequence();
  }
});

// Keypress handler
$(document).keypress(function() {
  if (!started && isPowered) {
    startCountdown();
  }
});

// Button click handler
$(".simon-button").click(function() {
  if (!started || !isPowered || isPaused) return;
  
  const userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);
  
  animatePress(userChosenColour);
  playSound(userChosenColour);
  
  checkAnswer(userClickedPattern.length - 1);
});

function startCountdown() {
  let count = 3;
  $("#level-title").text(count);
  
  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      $("#level-title").text(count);
    } else {
      clearInterval(countdownInterval);
      startGame();
    }
  }, 1000);
}

function startGame() {
  $("#level-title").text("Level " + level);
  nextSequence();
  started = true;
  score = 0;
  $("#score").text(score);
  $("#pause-button").prop("disabled", false);
}

function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed");
  setTimeout(function() {
    $("#" + currentColor).removeClass("pressed");
  }, difficultySettings[difficulty].fadeSpeed);
}

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      score += level * 10;
      $("#score").text(score);
      
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('simonHighScore', highScore);
        $("#high-score").text(highScore);
      }
      
      setTimeout(function() {
        nextSequence();
      }, 1000);
    }
  } else {
    playSound("wrong");
    $("body").addClass("game-over");
    setTimeout(function() {
      $("body").removeClass("game-over");
    }, 200);
    
    if (strictMode) {
      $("#level-title").text("Game Over! Press Start to Try Again");
      startOver();
    } else {
      $("#level-title").text("Wrong! Try Again");
      setTimeout(function() {
        playSequence();
      }, 1000);
    }
  }
}

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);
  
  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);
  
  playSequence();
}

function playSequence() {
  let i = 0;
  const settings = difficultySettings[difficulty];
  
  sequenceInterval = setInterval(function() {
    if (i >= gamePattern.length) {
      clearInterval(sequenceInterval);
      return;
    }
    
    const color = gamePattern[i];
    $("#" + color).fadeIn(settings.fadeSpeed).fadeOut(settings.fadeSpeed).fadeIn(settings.fadeSpeed);
    playSound(color);
    i++;
  }, settings.sequenceSpeed);
}

function playSound(name) {
  const audio = new Audio("sounds/" + name + ".mp3");
  audio.volume = isPowered ? 1 : 0;
  audio.play();
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  userClickedPattern = [];
  $("#pause-button").prop("disabled", true);
}

function enableControls() {
  $("#start-button, #strict-button, #difficulty-button").prop("disabled", false);
}

function disableControls() {
  $("#start-button, #strict-button, #difficulty-button, #pause-button").prop("disabled", true);
  clearInterval(countdownInterval);
  clearInterval(sequenceInterval);
}

function resetGame() {
  startOver();
  $("#level-title").text("Power Off");
  $("#score").text("0");
  $(".control-button").removeClass("active");
  strictMode = false;
  difficulty = 'easy';
  $("#difficulty-button").html('<i class="fas fa-tachometer-alt"></i> Easy');
}