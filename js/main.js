let file = document.getElementById("theFile");
let audio = document.getElementById("audio");
let button = document.getElementById("button");
let sliderA = document.getElementById("sliderA");
let sliderW = document.getElementById("sliderW");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let btnRST = document.getElementById("btnRST");
let img = new Image();
img.src = "icon.jpg"
let tags;



file.addEventListener("change", function (event) {
  let file = event.target.files[0];
  jsmediatags.read(file, { // Přečtení metadat souboru pomoci knihovny 
    onSuccess: function (tag) {
      tags = tag.tags;
      console.log(tags);
    },
    onError: function (error) {
      console.log(error.type, error.info);
    }
  });
}, false);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx.fillRect(0, 0, canvas.width, canvas.height);
file.onchange = function () {
  let files = this.files;
  audio.src = URL.createObjectURL(files[0]);
  console.log(files);
  audio.load();
  audio.volume = 0.2
  audio.play();

  let audioCtx = new AudioContext();
  let src = audioCtx.createMediaElementSource(audio);
  let analyser = audioCtx.createAnalyser(); // Vytvoření tzv. AnalyserNode, který převádí data z audia pomocí FFT

  src.connect(analyser); // Připojení analyseru na náš source
  analyser.connect(audioCtx.destination);
  // Nastavení analyseru
  analyser.minDecibels = -90; // Určení min. hodnoty anylyseru 
  analyser.maxDecibels = -10; // Určení max. hodnoty anylyseru 
  analyser.smoothingTimeConstant = 0.85; // Vyhlazení analyseru 
  analyser.fftSize = 1024; // Nastavení velikosti FFT 

  let bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);
  let dataArray = new Uint8Array(bufferLength);

  function draw() {
    let width = canvas.width;
    let height = canvas.height;
    let barWidth = (width / bufferLength) * updateSliderW();
    let barHeight;
    let x;
    ctx.font = "30px Calibri";
    requestAnimationFrame(draw); // požadáme prohlížeč aby zavolal funkci draw a aktualizoval hodnoty před dalším překreslením
    x = 0;

    analyser.getByteFrequencyData(dataArray); // Zachycení frekvenčních dat z FFT do pole 

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 20, 20, 150, 150);
    if (tags.title && tags.artist) {
      ctx.fillStyle = "white";
      ctx.fillText(tags.artist + " - " + tags.title, 200, 45);
    }
    else if (tags.title) {
      ctx.fillStyle = "white";
      ctx.fillText(tags.title, 200, 45);
    }
    if (tags.genre) {
      ctx.fillText(tags.genre, 200, 100);
    }
    if (tags.year) {
      ctx.fillText(tags.year, 200, 160);
    }

    for (let i = 0; i < bufferLength; i++) { // Loop funkce pro vykreslení obdelníku
      barHeight = dataArray[i] * updateSliderH();
      let r = barHeight + (25 * (i / bufferLength));
      let g = 250 * (i / bufferLength);
      let b = 50;

      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;



    }
  }
  function toggle() { // Funkce pro zapínaní a vypínaní zachycování mikrofonu
    if (button.value == "OFF") {
      button.value = "ON";
      navigator.getUserMedia({ audio: true }, function (stream) {
        localStream = stream;
        // Znova musíme určit zdroj a připojit analyser
        src = audioCtx.createMediaStreamSource(stream);
        audio.pause();
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
      }, function (err) {
        console.log('The following gUM error occured: ' + err);
      });
    } else {
      button.value = "OFF";
      audio.play()
      localStream.getAudioTracks()[0].stop();
    }
  }
  // Update funkce pro data ze slideru
  function updateSliderH() {
    sliderA.innerText = sliderA.value;
    return (sliderA.value);
  }
  function updateSliderW() {
    return (sliderW.value);
  }

  button.addEventListener("click", function () { toggle(); });
  sliderA.addEventListener("onchange", function () { updateSliderH(); })
  sliderW.addEventListener("onchange", function () { updateSliderW(); })
  btnRST.addEventListener("click", function () { // Reset button na zakladní hodnoty sliderů
    sliderA.value = 1.5;
    sliderW.value = 3;
  });
  draw();
}

