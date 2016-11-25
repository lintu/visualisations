(function () {
    var durrr = document.getElementById('durrr');
    //var ctx = durrr.getContext('2d');

    var camera, scene, renderer, particle;
    var windowHalfX = window.innerWidth / 2;
    var windowHalfY = window.innerHeight / 2;
    var mouseX = 0, mouseY = 0;

    initThree();
    animate();


    function animate() {
        requestAnimationFrame(animate);
        render();
        update();
    }
    function update() {
     
    }
    function render() {
        renderer.render(scene, camera);
    }

    function initThree() {
        // SCENE
        scene = new THREE.Scene();
        // CAMERA
        var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
        var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
        camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
        scene.add(camera);
        camera.position.set(0, 150, 400);
        camera.lookAt(scene.position);
        // RENDERER
        if (Detector.webgl)
            renderer = new THREE.WebGLRenderer({ canvas: durrr, antialias: true });
        else
            renderer = new THREE.CanvasRenderer({ canvas: durrr, alpha: true });
        renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
        // LIGHT
        //var light = new THREE.PointLight(0xffffff);
        //light.position.set(0,250,0);
        //scene.add(light);

        // SKYBOX/FOG
        var skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
        var skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x9999ff, side: THREE.BackSide });
        var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        // scene.add(skyBox);
        scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

        ////////////
        // CUSTOM //
        ////////////
        // must enable shadows on the renderer 
        renderer.shadowMapEnabled = true;

        // "shadow cameras" show the light source and direction

        // spotlight #1 -- yellow, dark shadow
        var spotlight = new THREE.SpotLight(0xffff00);
        spotlight.position.set(-60, 150, -30);
        spotlight.shadowCameraVisible = true;
        spotlight.shadowDarkness = 0.95;
        spotlight.intensity = 2;
        // must enable shadow casting ability for the light
        spotlight.castShadow = true;
        //scene.add(spotlight);
        // spotlight #2 -- red, light shadow
        var spotlight2 = new THREE.SpotLight(0xff0000);
        spotlight2.position.set(60, 150, -60);
        scene.add(spotlight2);
        spotlight2.shadowCameraVisible = true;
        spotlight2.shadowDarkness = 0.70;
        spotlight2.intensity = 2;
        spotlight2.castShadow = true;

        // spotlight #3
        var spotlight3 = new THREE.SpotLight(0x0000ff);
        spotlight3.position.set(150, 80, -100);
        spotlight3.shadowCameraVisible = true;
        spotlight3.shadowDarkness = 0.95;
        spotlight3.intensity = 2;
        spotlight3.castShadow = true;
        //scene.add(spotlight3);
        // change the direction this spotlight is facing
        var lightTarget = new THREE.Object3D();
        lightTarget.position.set(150, 10, -100);
        scene.add(lightTarget);
        spotlight3.target = lightTarget;
        // cube: mesh to cast shadows
        var cubeGeometry = new THREE.CubeGeometry(50, 50, 50);
        var cubeMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(0, 50, 0);
        // Note that the mesh is flagged to cast shadows
        cube.castShadow = true;
        scene.add(cube);

        // floor: mesh to receive shadows
        var floorTexture = new THREE.ImageUtils.loadTexture('images/checkerboard.jpg');
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(10, 10);
        // Note the change to Lambert material.
        var floorMaterial = new THREE.MeshLambertMaterial({ map: floorTexture, side: THREE.DoubleSide });
        var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.y = -0.5;
        floor.rotation.x = Math.PI / 2;
        // Note the mesh is flagged to receive shadows
        floor.receiveShadow = true;
        scene.add(floor);

        // create "light-ball" meshes
        var sphereGeometry = new THREE.SphereGeometry(10, 16, 8);
        var darkMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });

        var wireframeMaterial = new THREE.MeshBasicMaterial(
            { color: 0xffff00, wireframe: true, transparent: true });
        var shape = THREE.SceneUtils.createMultiMaterialObject(
            sphereGeometry, [darkMaterial, wireframeMaterial]);
        shape.position = spotlight.position;
        scene.add(shape);

        var wireframeMaterial = new THREE.MeshBasicMaterial(
            { color: 0xff0000, wireframe: true, transparent: true });
        var shape = THREE.SceneUtils.createMultiMaterialObject(
            sphereGeometry, [darkMaterial, wireframeMaterial]);
        shape.position = spotlight2.position;
        scene.add(shape);

        var wireframeMaterial = new THREE.MeshBasicMaterial(
            { color: 0x0000ff, wireframe: true, transparent: true });
        var shape = THREE.SceneUtils.createMultiMaterialObject(
            sphereGeometry, [darkMaterial, wireframeMaterial]);
        shape.position = spotlight3.position;
        scene.add(shape);
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
})();