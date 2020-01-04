let file = document.getElementById("theFile");
let audio = document.getElementById("audio");

file.onchange = function(){
 
  let files = this.files;
  audio.src = URL.createObjectURL(files[0]);
  console.log(files);
  audio.load();
  audio.play();

  let audioCtx = new AudioContext();
  let src = audioCtx.createMediaElementSource(audio)
  let analyser = audioCtx.createAnalyser();

  let canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let ctx = canvas.getContext("2d");
  
  src.connect(analyser);
  analyser.connect(audioCtx.destination);

  analyser.fftSize = 256;
  let bufferLength = analyser.frequencyBinCount;
  console.log(bufferLength);

  let dataArray = new Uint8Array(bufferLength);

  let width = canvas.width;
  let height = canvas.height;

  let barWidth = (width / bufferLength) * 2.8;
  let barHeight;
  let x;

  function draw(){
    requestAnimationFrame(draw);

    x = 0;

    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = "#000";
    ctx.fillRect(0,0,width,height);

    for(let i = 0; i < bufferLength; i++ ){
      barHeight = dataArray[i] *2;
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


