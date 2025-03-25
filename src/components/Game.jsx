import React, { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { Joystick } from 'react-joystick-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './Game.css';  // Import the stylesheet

const Game = () => {
  const gameRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const sceneRef = useRef(null);

  useEffect(() => {
    // Check if we're on mobile
    setIsMobile(window.innerWidth <= 768);

    // Add window resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    // Calculate exact map dimensions (15 tiles × 32 pixels, 13 tiles × 32 pixels)
    const MAP_WIDTH = 15 * 32;  // 480 pixels
    const MAP_HEIGHT = 13 * 32; // 416 pixels

    const config = {
      type: Phaser.AUTO,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      parent: gameRef.current,
      physics: {
        default: "arcade",
        arcade: {
          debug: false, // Set to true to see collision boxes
          gravity: { y: 0 } // No gravity for top-down game
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);

    function preload() {
      // Update asset paths to be relative to the base URL
      this.load.tilemapTiledJSON("map", "./assets/map.json");
      this.load.image('woodland_indoor', './assets/tilesets/tileset.png');
      this.load.spritesheet("player", "./assets/player.png", {
        frameWidth: 32,
        frameHeight: 32,
        spacing: 0,
        margin: 0
      });
    }

    function create() {
      // Create the map
      const map = this.make.tilemap({ key: "map" });
      const tileset = map.addTilesetImage("woodland_indoor", "woodland_indoor");

      // Create all layers in correct order (added bookshelf)
      const layers = [
        "Ground", "Walls", "doors", "floor mat", "under the table",
        "table", "on the table", "on the table2", "bar", "on the bar",
        "bookshelf", "boundary", "boundary2"  // Added bookshelf layer
      ];

      layers.forEach(layerName => {
        map.createLayer(layerName, tileset);
      });

      // Get all collision layers
      const collisionLayers = [
        'collison',           // Main collision layer
        'door collision',     // Door collisions
        'table collison',     // Table collisions
        'bas collision',      // Bar collisions
        'on the bas collision' // Added this collision layer that was in map.json
      ];
      
      // Create player at a better starting position
      this.player = this.physics.add.sprite(245, 372, "player");
      this.player.setCollideWorldBounds(true);
      this.player.setSize(20, 20);     // Make collision box smaller than sprite
      this.player.setOffset(6, 10);    // Offset collision box (x: 6 pixels right, y: 10 pixels down)

      // Set up collision objects
      const colliders = this.physics.add.staticGroup();
      
      collisionLayers.forEach(layerName => {
        const layer = map.getObjectLayer(layerName);
        if (layer && layer.objects) {
          layer.objects.forEach(object => {
            // Create collision boxes for all objects in collision layers
            const collider = this.add.rectangle(
              object.x + (object.width / 2), 
              object.y + (object.height / 2),
              object.width,
              object.height
            );
            
            this.physics.add.existing(collider, true);
            colliders.add(collider);
          });
        }
      });

      // Add collision between player and all colliders
      this.physics.add.collider(this.player, colliders);

      // Create player animations
      this.anims.create({
        key: "walk-down",
        frames: this.anims.generateFrameNumbers("player", { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: "walk-left",
        frames: this.anims.generateFrameNumbers("player", { start: 3, end: 5 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: "walk-right",
        frames: this.anims.generateFrameNumbers("player", { start: 6, end: 8 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: "walk-up",
        frames: this.anims.generateFrameNumbers("player", { start: 9, end: 11 }),
        frameRate: 8,
        repeat: -1
      });

      // Updated idle animations
      this.anims.create({
        key: "idle-down",
        frames: [{ key: "player", frame: 0 }],
        frameRate: 1
      });

      this.anims.create({
        key: "idle-left",
        frames: [{ key: "player", frame: 3 }],
        frameRate: 1
      });

      this.anims.create({
        key: "idle-right",
        frames: [{ key: "player", frame: 6 }],
        frameRate: 1
      });

      this.anims.create({
        key: "idle-up",
        frames: [{ key: "player", frame: 9 }],
        frameRate: 1
      });

      // Adjust camera settings
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      this.cameras.main.startFollow(this.player, true);
      this.cameras.main.setZoom(2); // Increased zoom to see the map better
      this.cameras.main.setDeadzone(50, 50); // Add small dead zone for smoother camera

      // Initialize keyboard controls BEFORE storing the reference
      this.cursors = this.input.keyboard.createCursorKeys();
      
      // Store scene reference for mobile controls
      sceneRef.current = this;
    }

    function update() {
      const speed = 160;
      
      // Add safety check for cursors
      if (!this.cursors) return;
      
      
      // Stop any previous movement
      this.player.setVelocity(0);

      // Use this.cursors instead of cursorsRef.current
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-speed);
        this.player.anims.play("walk-left", true);
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(speed);
        this.player.anims.play("walk-right", true);
      } else if (this.cursors.up.isDown) {
        this.player.setVelocityY(-speed);
        this.player.anims.play("walk-up", true);
      } else if (this.cursors.down.isDown) {
        this.player.setVelocityY(speed);
        this.player.anims.play("walk-down", true);
      } else {
        // Handle idle animations based on last direction
        const key = this.player.anims.currentAnim ? this.player.anims.currentAnim.key : 'walk-down';
        if (key.startsWith('walk-')) {
          this.player.anims.play(`idle-${key.split('-')[1]}`, true);
        }
      }
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      game.destroy(true);
    };
  }, []);

  // Updated mobile control handlers
  const handleMove = (data) => {
    const scene = sceneRef.current;
    if (!scene?.cursors) return;

    // Reset all directions
    scene.cursors.up.isDown = false;
    scene.cursors.down.isDown = false;
    scene.cursors.left.isDown = false;
    scene.cursors.right.isDown = false;

    if (data.x || data.y) {
      // Fix inverted controls by negating the y value
      if (Math.abs(data.x) > Math.abs(data.y)) {
        scene.cursors[data.x > 0 ? 'right' : 'left'].isDown = true;
      } else {
        // Negate y value to fix inverted controls
        scene.cursors[data.y < 0 ? 'down' : 'up'].isDown = true;
      }
    }
  };

  const handleStop = () => {
    const scene = sceneRef.current;
    if (!scene?.cursors) return;

    scene.cursors.up.isDown = false;
    scene.cursors.down.isDown = false;
    scene.cursors.left.isDown = false;
    scene.cursors.right.isDown = false;
  };

  return (
    <div className="game-container">
      <div 
        ref={gameRef}
        className="game-canvas"
      />
      
      {isMobile && (
        <div className="mobile-controls">
          <Joystick 
            size={120}
            baseColor="rgba(255, 255, 255, 0.2)"
            stickColor="rgba(255, 255, 255, 0.8)"
            move={handleMove}
            stop={handleStop}
          />
        </div>
      )}
    </div>
  );
};

export default Game;
