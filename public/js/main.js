define(
	['jquery', 'threejs', 'threejs-detector', 'threejs-stats', 'threejs-trackball'],
	function($, THREE, Dectector, Stats) {
		'use strict';

		// Check for webgl support.
		if (!Detector.webgl) {
			Detector.addGetWebGLMessage();
			return false;
		}

		// Globals.
		var scene, camera, controls, stats, renderer, systemParticles;

		// EVE data and logic container.
		var eve = {
			data: {
				systems: [],
				sovereignty: [],
				kills: [],
				alliances: []
			},
			draw: {
				kills: function() {
					// Create one shared material
					var sprite = THREE.ImageUtils.loadTexture('kills.png');

					// Any kill data?
					for (var i in eve.data.kills) {
						var geometry = new THREE.Geometry();
						var material = new THREE.ParticleBasicMaterial({
							size: eve.data.kills[i] * 2,
							map: sprite,
							blending: THREE.AdditiveBlending,
							depthTest: false,
							transparent: true,
							color: new THREE.Color(0xFF0000)
						});

						var colors = [];
						var j = 0;

						if (eve.data.systems[i] == null) {
							continue;
						}

						var system = eve.data.systems[i];

						var x = system.x / 1000000000000;
						var y = system.y / 1000000000000;
						var z = system.z / 1000000000000;
						geometry.vertices.push(new THREE.Vector3(x, y, z));

						//init particle system
						var particles = new THREE.ParticleSystem(geometry, material);
						particles.dynamic = true;
						particles.sortParticles = true;
						scene.add(particles);
						j++;
					}
				},
				systemCard: function(systemID, vertex) {
					if (systemID == null || eve.data.systems[systemID] == null) {
						$('#system-card').hide();
						return;
					}

					var system = eve.data.systems[systemID];

					var alliance = getSystemAlliance(systemID);

					var $ele = $('#system-card');
					$ele.html('')

					var html = [];
					html.push('<h4>'+system.name+'</h4>');
					if (alliance !== null) {
						html.push('<strong>'+alliance.name+'</strong><br/>');
					}
					html.push('<strong>Region:</strong> ???<br/>');
					if (eve.data.kills[systemID] != null) {
						html.push('<strong>Kills:</strong> '+eve.data.kills[systemID]+'<br/>');
					}
					$ele.html(html.join('\n'));

					var position = get2dPositionOnScreen(vertex.x, vertex.y, vertex.z);

					$ele.css({top:position.y-($ele.outerHeight()/2),left:position.x+16}).show();
				}
			}
		};

		var progressBar = function (percentage) {
			// Show/Update progress bar.
		};

		// Functions.

		var get2dPositionOnScreen = function (x, y, z) {
			var projector = new THREE.Projector(),
				vector = projector.projectVector(new THREE.Vector3(x, y, z), camera),
				halfWidth = renderer.domElement.width / 2,
				halfHeight = renderer.domElement.height / 2;
			return {
				x: Math.round(vector.x * halfWidth + halfWidth),
				y: Math.round(-vector.y * halfHeight + halfHeight)
			}
		};

		var renderScene = function () {
			requestAnimationFrame(renderScene);
			renderer.render(scene, camera);
			controls.update();
			stats.update();
		};

		var getSystemAlliance = function (systemID) {
			if (systemID == null || eve.data.sovereignty[systemID] == null) {
				return null;
			}
			// Should check it.
			return eve.data.alliances[eve.data.sovereignty[systemID]] || null;
		}

		var setup = function () {

			// CAMERA @fix
            var SCREEN_WIDTH = $(window).width(), SCREEN_HEIGHT = $(window).height();
            var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

                scene = new THREE.Scene(),
                camera = new THREE.PerspectiveCamera(45, ASPECT, 0.1, 20000);

            var mouse = {x:0,y:0}, ray, projector, particles, INTERSECTED;

            // Add camera to scene.
            scene.add(camera);
            camera.position.set(0, 150, 400);
            camera.lookAt(scene.position);

            // Create renderer.
            renderer = new THREE.WebGLRenderer( {antialias:true, clearColor: 0x000000, clearAlpha: 1 } );
            renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
            renderer.sortObjects = false;
            $('<div></div>').appendTo('body').append(renderer.domElement);

            // STATS
            stats = new Stats();
            stats.domElement.style.position = 'absolute';
            stats.domElement.style.bottom = '0px';
            stats.domElement.style.zIndex = 100;
    //        container.appendChild( stats.domElement );

            // Create controls.
            controls = new THREE.TrackballControls( camera );
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.5;
            controls.panSpeed = 1;
            controls.noZoom = false;
            controls.noPan = false;
            controls.staticMoving = false;
            controls.dynamicDampingFactor = 0.3;
            controls.minDistance = 150;
            controls.maxDistance = 1600;

            // Bind Events.

            var oldColor, oldVertex = null;

            $(document).bind('eve.intersect', function(e, intersects) {
                var v = intersects.vertex;
                if (oldVertex == v) {
                    return;
                }
                if (oldVertex != null) {
                    systemParticles.geometry.colors[oldVertex] = oldColor;
                }
                oldVertex = v;
                oldColor = systemParticles.geometry.colors[v];
                var c = new THREE.Color(0xffffff);
                systemParticles.geometry.colors[v] = c;
                eve.draw.systemCard(systemParticles.geometry.vertices[v].system, systemParticles.geometry.vertices[v]);
            });

            $(window).on('resize', function(){
                camera.aspect = $(window).width() / $(window).height();
                camera.updateProjectionMatrix();
                renderer.setSize($(window).width(), $(window).height());
                controls.handleResize();
            });

            $(document).on('mousemove', function (e) {
                // update the mouse variable
                mouse.x = ( e.clientX / $(window).width() ) * 2 - 1;
                mouse.y = - ( e.clientY / $(window).height() ) * 2 + 1;

                e.preventDefault();

                var projector = new THREE.Projector();

                var vector = new THREE.Vector3( ( e.clientX / $(window).width() ) * 2 - 1, - ( e.clientY / $(window).height() ) * 2 + 1, 0.5 );
                projector.unprojectVector(vector, camera);

                var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
                ray.threshold = 20;
                var intersects = ray.intersectObjects([systemParticles], true);

                if (intersects.length > 0 ) {
                    // Do it.
                    $(document).trigger('eve.intersect', intersects);
                } else {
                    if (oldVertex != null) {
                        systemParticles.geometry.colors[oldVertex] = oldColor;
                        oldVertex = null;
                        oldColor = null;
                        eve.draw.systemCard(null);
                    }
                }
            });
        };

		function init()
		{
			// SKYBOX/FOG
			var skyBoxGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );
			var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x090909 } );
			skyBoxMaterial.side = THREE.BackSide;
			skyBoxMaterial.name = 'skybox';
			var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
			 // skyBox.material  = THREE.DoubleSide ; // render faces from inside of the cube, instead of from outside (default).
			scene.add(skyBox);
		//	scene.fog = new THREE.FogExp2( 0x111111, 0.00025 );

			// Render System jumps.

			var lineMaterial = new THREE.LineBasicMaterial({
                color: 0x242424
            });

			var lineGroup = new THREE.Object3D();

			for (i in eve.data.systems) {
                var system = eve.data.systems[i];
				for (var j in system.jumps) {
					if (eve.data.systems[system.jumps[j]] == null) {
						continue;
					}
					var x = system.x / 1000000000000;
					var y = system.y / 1000000000000;
					var z = system.z / 1000000000000;
					var geometry = new THREE.Geometry();
					geometry.vertices.push(new THREE.Vector3(x,y,z));
					var x = eve.data.systems[system.jumps[j]].x / 1000000000000;
					var y = eve.data.systems[system.jumps[j]].y / 1000000000000;
					var z = eve.data.systems[system.jumps[j]].z / 1000000000000;
					geometry.vertices.push(new THREE.Vector3(x,y,z));
					var line = new THREE.Line(geometry, lineMaterial);
					lineGroup.add(line);
					//break;
				}
			}

		//	scene.add(lineGroup);

			// Render Systems

			geometry = new THREE.Geometry();
            //create one shared material
            var sprite = THREE.ImageUtils.loadTexture("system.png");
            var material = new THREE.ParticleBasicMaterial({
                    size: 20,
                    map: sprite,
                    blending: THREE.AdditiveBlending,
                    depthTest: false,
                    transparent: true,
                    vertexColors: true // allows 1 color per particle
            });

			// create particles
			var j = 0, colors = [], allianceColors = [];
				for (var i in eve.data.systems) {
				    var color;

				// Does an alliance own this system?
				if (eve.data.sovereignty[i] != null) {
					// Does alliance have a color already?
					if (allianceColors[eve.data.sovereignty[i]] == null) {
						allianceColors[eve.data.sovereignty[i]] = new THREE.Color();
						allianceColors[eve.data.sovereignty[i]].setHSV(Math.random(), 1, 1);
					}
					color = allianceColors[eve.data.sovereignty[i]];
				// Guess not. Grey.
				} else {
					color = new THREE.Color(0x333333);
				}

				colors[j] = color;
				var x = eve.data.systems[i].x / 1000000000000;
				var y = eve.data.systems[i].y / 1000000000000;
				var z = eve.data.systems[i].z / 1000000000000;

                geometry.vertices[j] = new THREE.Vector3(x, y, z);
				geometry.vertices[j].system = i;

				j++;
				}

				geometry.colors = colors;

			// init particle system
            systemParticles = new THREE.ParticleSystem(geometry, material);
            systemParticles.dynamic = true;
            systemParticles.sortParticles = true;
            scene.add(systemParticles);

			// Render Kills
			eve.draw.kills();

            // Jumps
			var j = 0;
				for (var i in eve.data.systems) {
                var system = eve.data.systems[i];
				for (var j in system.jumps) {
					if (eve.data.systems[system.jumps[j]] == null) {
						continue;
					}
					colors[j] = new THREE.Color(0xFF0000);
					var x = eve.data.systems[i].x / 1000000000000;
					var y = eve.data.systems[i].y / 1000000000000;
					var z = eve.data.systems[i].z / 1000000000000;
					 geometry.vertices[j] = new THREE.Vector3(x, y, z);

					j++;
				}
			}

        renderScene();
	};

	// Load data files, and begin.

	$(function() {
        setup();
		progressBar(0);
		$.getJSON('shared/systems.json', function(data) {
			eve.data.systems = data;
			progressBar(33);
			$.getJSON('shared/sovereignty.json', function(data) {
				eve.data.sovereignty = data;
				progressBar(66);
				$.getJSON('shared/kills.json', function(data) {
					eve.data.kills = data;
					progressBar(84);
					$.getJSON('shared/alliances.json', function(data) {
						eve.data.alliances = data;
						progressBar(90);
						init();
						progressBar(100);
					});
				});
			});
		});
	});

});