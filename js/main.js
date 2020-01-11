

let file = document.getElementById("theFile");
let audio = document.getElementById("audio");


file.onchange = function(){
  let files = this.files; 
  audio.src = URL.createObjectURL(files[0]); 
  console.log(files);

  audio.load();
  audio.play();

  let audioCtx = new AudioContext(); // Vytvoření objektu 
  let src = audioCtx.createMediaElementSource(audio); // Vytovoření 
  let analyser = audioCtx.createAnalyser(); // Vytvoříme tzv. AnalyserNode, který nám převádí data z audia 

  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth; // Získáme aktualní šířku obrazovky uživatele
  canvas.height = window.innerHeight; // Získéme aktualní výšku obrazovky uživatele
  let ctx = canvas.getContext("2d"); 

  src.connect(analyser); // 
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 1024;
  let bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);

  let dataArray = new Uint8Array(bufferLength);

  let width = canvas.width;
  let height = canvas.height;

  let barWidth = (width / bufferLength) *2.5 ;
  let barHeight;
  let x = 0;
  function draw(){
    requestAnimationFrame(draw);

    x = 0;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,width,height);

    for(let i = 0; i < bufferLength; i++ ){
      barHeight = dataArray[i] * 1.5;
      let r = barHeight + (25 * (i / bufferLength));
      let g = 250 * (i/bufferLength);
      let b = 50;

      ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
      ctx.fillRect(x, height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }


  }
  audio.play();
  draw();

}

