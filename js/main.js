let file = document.getElementById("theFile");
let audio = document.getElementById("audio");
let button = document.getElementById("button");
let sliderA = document.getElementById("sliderA");
let sliderW = document.getElementById("sliderW");
//let sliderR = document.getElementById("sliderR");
//let sliderG = document.getElementById("sliderG");
//let sliderB = document.getElementById("sliderB");
let canvas = document.getElementById("canvas");
let title = document.getElementById("title");
let artist = document.getElementById("artist");
let album = document.getElementById("album");
let genre = document.getElementById("genre");
let year = document.getElementById("year");
let ctx = canvas.getContext("2d");
let btnRST = document.getElementById("btnRST");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
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
        analyser.smoothingTimeConstant = 0.85;
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
  //function updateSliderR() { return (sliderR.value); }
  //function updateSliderG() { return (sliderG.value); } 
  //function updateSliderB() { return (sliderB.value); }

  button.addEventListener("click", function () { toggle(); });
  sliderA.addEventListener("onchange", function () { updateSliderA(); })
  sliderW.addEventListener("onchange", function () { updateSliderW(); })
  btnRST.addEventListener("click", function(){
    sliderA.value = 1.5;
    sliderW.value = 3;
  });
  //sliderR.addEventListener("onchange", function () { updateSliderR(); })
  //sliderG.addEventListener("onchange", function () { updateSliderG(); })
  //sliderB.addEventListener("onchange", function () { updateSliderB(); })
  draw();
}

file.addEventListener("change", function (event) {
  let file = event.target.files[0];
  jsmediatags.read(file, {
    onSuccess: function (tag) {
      let tags = tag.tags;
      console.log(tags);

      if (tags.title) {
        if (title.style.display == "none") { title.style.display = "block"; }
        title.innerHTML = tags.title;
        console.log(title);
      } else {
        title.style.display = "none";
        console.log(title);
      }

      if (tags.artist) {
        if (artist.style.display == "none") { artist.style.display = "block" }
        artist.innerHTML = tags.artist;
        console.log(artist);
      } else {
        artist.style.display = "none";
        console.log(artist);
      }

      if (tags.album) {
        if (album.style.display == "none") { album.style.display = "block"; }
        album.innerHTML = tags.album;
        console.log(album);
      } else {
        album.style.display = "none";
        console.log(album);
      }

      if (tags.genre) {
        if (genre.style.display == "none") { genre.style.display = "block"; }
        genre.innerHTML = tags.genre;
        console.log(genre);
      } else {
        genre.style.display = "none";
        console.log(genre);
      }

      if (tags.year) {
        if (year.style.display == "none") { year.style.display = "block"; }
        year.innerHTML = tags.year;
        console.log(year);
      } else {
        year.style.display = "none";
        console.log(year);
      }

    },
    onError: function (error) {
      console.log(error.type, error.info);
    }
  });
}, false);
