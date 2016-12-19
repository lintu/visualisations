(function () {
    var durrr = document.getElementById('durrr');
    var WIDTH = durrr.clientWidth;
    var HEIGHT = durrr.clientHeight;

    var toggleBtn = document.getElementById('toggle');
    toggleBtn.addEventListener('click', () => {
        togglePlayback();
    });
    var isPlaying = false;

    var audioContext = new AudioContext();
    var source = audioContext.createBufferSource();
    var analyser1 = audioContext.createAnalyser();
    var analyser2 = audioContext.createAnalyser();
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    var gain = audioContext.createGain();

    var channel1FrequencyData;
    var channel2FrequencyData;

    //threejs
    var camera, scene, renderer, particle;
    var mouseX = 0, mouseY = 0, mouseZ = 0;

    source.connect(splitter);
    splitter.connect(analyser1, 0, 0);
    splitter.connect(analyser2, 1, 0);
    var SEPARATION = 100;
    var AMOUNTX = 32;
    var AMOUNTY = 32;

    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    analyser1.connect(merger, 0, 0);
    analyser2.connect(merger, 0, 1);
    var particleSystem;
    merger.connect(gain);

    gain.connect(audioContext.destination, 0, 0);

    fetchSound();

    initThree();

    function initThree() {
        camera = new THREE.PerspectiveCamera(75, HEIGHT / WIDTH, 1, 10000);
        camera.position.z = 1000;
        camera.aspect = window.innerWidth / window.innerHeight;
        //camera.position.y = 0;
        var cameraHelper = new THREE.CameraHelper(camera);

        scene = new THREE.Scene();
        //scene.add(cameraHelper);

        scene.fog = new THREE.FogExp2(0x000000, 0.0009);
        //scene.background = new THREE.Color('white');
        var colors = [];
        //var geometry = new THREE.Geometry();

        var material = new THREE.MeshLambertMaterial({
            color: 'red'
        });
        var separationX = (WIDTH - (10 * 32)) / 32;
        var separationY = (HEIGHT - (10 * 32)) / 32;
        var geometry = new THREE.BoxGeometry(10, 10, 10);
        for (i = -16; i < 16; i++) {
            for (j = -16; j < 16; j++) {
                var particle = new THREE.Mesh(geometry, material);
                particle.position.x = i * separationX;
                particle.position.y = j * separationY;
                particle.position.z = 0;
                scene.add(particle);
            }
        }

        var ambientLight = new THREE.AmbientLight('white');
        scene.add(ambientLight);
        
        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({ canvas: durrr, alpha: true });
        }
        else {
            renderer = new THREE.CanvasRenderer({ canvas: durrr, alpha: true });
        }

        renderer.shadowMapEnabled = true;
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('mousewheel', mousewheel, false);
        window.addEventListener('resize', onWindowResize, false);
    }
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getColor(i) {
        // var colorArray = ['blue', 'orange', 'red', 'white'];
        // return colorArray[i%4];
    }
    function draw() {
        requestAnimationFrame(draw);
        analyser1.getByteTimeDomainData(channel1FrequencyData);
        analyser2.getByteFrequencyData(channel2FrequencyData);

        var particle;
        for (var i = scene.children.length - 1, j = 0; i >= 0; i-- , j++) {
            if (scene.children[i] instanceof THREE.Mesh) {
                var scale = (channel1FrequencyData[j]);
                scale = scale == 0 ? 1 : scale;
                particle = scene.children[i];
                particle.position.z = (scale);
               // particle.material.color.set(getColor(i));
            }
        }
        camera.position.x += (mouseX - camera.position.x) * .05;
        camera.position.y += (- mouseY - camera.position.y) * .05;
        camera.position.z += (mouseZ);
        mouseZ = 0;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
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
            isPlaying = true;
            draw();
        });
    }

    function togglePlayback() {
        if (isPlaying) {
            source.stop();
            isPlaying = false;
        } else {
            source.start();
            isPlaying = true;
        }
    }

    function onWindowResize() {
        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    //
    function onDocumentMouseMove(event) {
        mouseX = event.clientX - windowHalfX;
        mouseY = event.clientY - windowHalfY;
    }

    function onDocumentTouchStart(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(event) {
        if (event.touches.length == 1) {
            event.preventDefault();
            mouseX = event.touches[0].pageX - windowHalfX;
            mouseY = event.touches[0].pageY - windowHalfY;
        }
    }

    function mousewheel(event) {
        mouseZ = Math.sign(event.wheelDelta) * 20;
        mouseZ *= -1;
    }

})();

