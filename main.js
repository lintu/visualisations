(function () {
    var durrr = document.getElementById('durrr');
    var WIDTH = durrr.clientWidth;
    var HEIGHT = durrr.clientHeight;

    var toggleBtn = document.getElementById('toggle');
    toggleBtn.addEventListener('click', ()=> {
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
    var SEPARATION = 100;
    var AMOUNTX = 32;
    var AMOUNTY = 32;
    var camera, scene, renderer, particle;
    var mouseX = 0, mouseY = 0, mouseZ = 0;

    source.connect(splitter);
    splitter.connect(analyser1, 0, 0);
    splitter.connect(analyser2, 1, 0);
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;

    analyser1.connect(merger, 0, 0);
    analyser2.connect(merger, 0, 1);

    merger.connect(gain);

    gain.connect(audioContext.destination, 0, 0);

    fetchSound();

    initThree();

    function initThree() {
        camera = new THREE.PerspectiveCamera(100, 0.7, 1, 10000);
        camera.position.z = 450;
        //camera.position.y = 700;
        var cameraHelper = new THREE.CameraHelper(camera);

        scene = new THREE.Scene();
        //scene.add(cameraHelper);
        var color = '#e242f4';
        var material = new THREE.MeshLambertMaterial({

        });
        var geometry = new THREE.BoxGeometry(10, 10, 10);
        var colorCounter = 0;
        for (var ix = 0; ix < AMOUNTX; ix++) {
            for (var iy = 0; iy < AMOUNTY; iy++) {
                colorCounter++;
                if (colorCounter % 200 == 0) {
                    color = getColor(color);
                }

                particle = new THREE.Mesh(geometry, material);
                particle.castShadow = true;
                //particle.scale.y = 100;
                particle.material.color.set('yellow');
                particle.position.x = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2);
                particle.position.z = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2);
                scene.add(particle);
            }
        }
        var bgMterial = new THREE.MeshLambertMaterial({
            map: new THREE.TextureLoader().load('bg.jpg')
        });
        var bgPlaneGeometry = new THREE.PlaneGeometry(WIDTH, HEIGHT , 1, 1);
        var planeMesh = new THREE.Mesh(bgPlaneGeometry, bgMterial);
        planeMesh.position.y = 50;
        planeMesh.position.z = 300;
        planeMesh.name = 'bg';
        scene.add(planeMesh);

        if (Detector.webgl) {
            renderer = new THREE.WebGLRenderer({ canvas: durrr, antialias: true });
        }
        else {
            renderer = new THREE.CanvasRenderer({ canvas: durrr, alpha: true });
        }

        //LIGHTS
        var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        var pointLight = new THREE.PointLight(0xffffff, 1);
        pointLight.position.set(-1000, 500, 1000)
        scene.add(pointLight);


        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);


        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);
        document.addEventListener('mousewheel', mousewheel, false);
        //
        window.addEventListener('resize', onWindowResize, false);
    }

    function draw() {
        requestAnimationFrame(draw);
        analyser1.getByteTimeDomainData(channel1FrequencyData);
        analyser2.getByteFrequencyData(channel2FrequencyData);

        for (var i = scene.children.length - 1, j = 0; i >= 0; i-- , j++) {
            if (scene.children[j].name != 'bg') {
                var scale = (channel1FrequencyData[j]);
                scale = scale == 0 ? 1 : scale;
                particle = scene.children[j];
                particle.position.y = scale * 2;
            }
        }
        camera.position.z += (mouseZ);
        mouseZ = 0;
        camera.position.x += (mouseX - camera.position.x) * .05;
        //camera.position.y += (- mouseY - camera.position.y) * .05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }

    function fetchSound() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'vocals.mp3', true);
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
    function getColor(currentColor) {
        var colorArray = ['red', 'green', 'yellow', 'orange', '#e242f4', 'indigo', '#42f4bc'];

        var currentIndex = colorArray.indexOf(currentColor);
        var nextColorIndex = 0;
        if (currentIndex >= colorArray.length - 1) {
            nextColorIndex = 0;
        } else {
            nextColorIndex = currentIndex + 1;
        }
        return colorArray[nextColorIndex];
    }
    function togglePlayback() {
        if(isPlaying) {
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

