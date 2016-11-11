(function () {
    var durrr = document.getElementById('durrr');
    var ctx = durrr.getContext('2d');
    var WIDTH = durrr.clientWidth;
    var HEIGHT = durrr.clientHeight;


    var audioContext = new AudioContext();
    var source = audioContext.createBufferSource();
    var analyser1 = audioContext.createAnalyser();
    var analyser2 = audioContext.createAnalyser();
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    var gain = audioContext.createGain();

    var channel1FrequencyData;
    var channel2FrequencyData;


    source.connect(splitter);
    splitter.connect(analyser1, 0, 0);
    splitter.connect(analyser1, 1, 0);

    analyser1.connect(merger, 0, 0);
    analyser2.connect(merger, 0, 1);

    merger.connect(gain);

    gain.connect(audioContext.destination, 0, 0);

    fetchSound();

    function draw() {
        requestAnimationFrame(draw);
        analyser1.getByteFrequencyData(channel1FrequencyData);
        analyser2.getByteFrequencyData(channel2FrequencyData);
        ctx.fillStyle = '#354147';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#E84C3D';

        ctx.beginPath();

        var sliceWidth = WIDTH * 1.0 / analyser1.frequencyBinCount;
        var x = 0;
        var gap = Math.round(analyser1.frequencyBinCount / 10);

        for (var i = 0; i < analyser1.frequencyBinCount; i++) {
            var y = channel1FrequencyData[i];
            
            ctx.moveTo(x, y);
            ctx.lineTo(x, y);
            x += sliceWidth;
            console.log(x, y);
        }

        ctx.lineTo(WIDTH / 2, HEIGHT / 2);
        ctx.stroke();
    }

    function fetchSound() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'afreen.mp3', true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            processArrayBuffer(xhr.response);
        };
        xhr.send();
    }

    function processArrayBuffer(arrayBuffer) {
        audioContext.decodeAudioData(arrayBuffer, function (audioBuffer) {
            source.buffer = audioBuffer;


            channel1FrequencyData = new Uint8Array(analyser1.frequencyBinCount);
            channel2FrequencyData = new Uint8Array(analyser2.frequencyBinCount);

            source.start(0);
            draw();
        });
    }

})();

