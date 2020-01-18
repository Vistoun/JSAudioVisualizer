let file = document.getElementById("theFile");
let audio = document.getElementById("audio");
let button = document.getElementById("button");
let sliderA = document.getElementById("sliderA");
let sliderW = document.getElementById("sliderW");
let canvas = document.getElementById("canvas");
let title = document.getElementById("title");
canvas.width = window.innerWidth; // Získáme aktualní šířku obrazovky uživatele
canvas.height = window.innerHeight; // Získéme aktualní výšku obrazovky uživatele
let ctx = canvas.getContext("2d");


ctx.fillRect(0, 0, canvas.width, canvas.height);
file.onchange = function () {

  let files = this.files;
  audio.src = URL.createObjectURL(files[0]);
  console.log(files);
  audio.load();
  audio.volume = 0.5
  audio.play();

  let audioCtx = new AudioContext(); // Vytvoření objektu 
  let src = audioCtx.createMediaElementSource(audio);
  let analyser = audioCtx.createAnalyser(); // Vytvoříme tzv. AnalyserNode, který nám převádí data z audia 

  src.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.minDecibels = -90;
  analyser.maxDecibels = -10;
  analyser.smoothingTimeConstant = 0.85;


  function draw() {
    analyser.fftSize = 1024;
    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    let dataArray = new Uint8Array(bufferLength);

    let width = canvas.width;
    let height = canvas.height;
    let barWidth = (width / bufferLength) * updateSliderW();
    let barHeight;
    let x;

    requestAnimationFrame(draw);
    x = 0;
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] * updateSliderA();
      let r = barHeight + (25 * (i / bufferLength));
      let g = 250 * (i / bufferLength);
      let b = 50;


      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;

    }
  }
  function toggle() {
    if (button.value == "OFF") {
      button.value = "ON";
      navigator.getUserMedia({ audio: true }, function (stream) {
        localStream = stream;
        src = audioCtx.createMediaStreamSource(stream);
        audio.pause();
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;
        //analyser.smoothingTimeConstant = 0.85;
        draw();
      }, function (err) {
        console.log('The following gUM error occured: ' + err);
      });
    } else {
      button.value = "OFF";
      audio.play()
      localStream.getAudioTracks()[0].stop();
    }
  }

  function updateSliderA() { return (sliderA.value); }
  function updateSliderW() { return (sliderW.value); }
  button.addEventListener("click", function () { toggle(); });
  sliderA.addEventListener("onchange", function () { updateSliderA(); })
  sliderW.addEventListener("onchange", function () { updateSliderW(); })
  draw();
}

file.addEventListener("change", function (event) {
  let file = event.target.files[0];
  jsmediatags.read(file, {
    onSuccess: function (tag) {
      console.log(tag);
      let tags = tag.tags;
      console.log(tags);
      title.innerHTML = tags.title
    },
    onError: function (error) {
      console.log(':(', error.type, error.info);
    }
  });
}, false);

