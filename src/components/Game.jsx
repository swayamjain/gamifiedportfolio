import React, { useEffect, useRef, useState, useCallback } from "react";
import Phaser from "phaser";
import { Joystick } from 'react-joystick-component';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import './Game.css';  // Import the stylesheet

const Game = () => {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null); // New ref for Phaser game instance
  const [isMobile, setIsMobile] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const sceneRef = useRef(null);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  const [showSkillsDialogue, setShowSkillsDialogue] = useState(false);
  const [showGithubDialogue, setShowGithubDialogue] = useState(false);
  const [showKnifeDialogue, setShowKnifeDialogue] = useState(false);
  const [showNPCDialogue, setShowNPCDialogue] = useState(false);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [npcIntroComplete, setNpcIntroComplete] = useState(false);
  const [dialogueTimer, setDialogueTimer] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const textTimeoutRef = useRef(null);
  const [skipPressed, setSkipPressed] = useState(false);

  // Define your skills
  const skills = [
    "JavaScript",
    "React",
    "Phaser.js",
    "CSS",
    "HTML",
    "Node.js",
    "Git",
    "Responsive Design"
  ];

  // First move the typeWriter function before handleKeyDown
  const typeWriter = useCallback((text) => {
    if (!text) return; // Add safety check for empty text
    
    setIsTyping(true);
    setSkipPressed(false);
    let i = 0;
    const speed = 100;

    function type() {
      if (i < text.length && !skipPressed) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        textTimeoutRef.current = setTimeout(type, speed);
      } else {
        setDisplayedText(text);
        setIsTyping(false);
      }
    }

    setDisplayedText('');
    type();
  }, [skipPressed]);

  // Then define progressDialogue before handleKeyDown
  const progressDialogue = useCallback(() => {
    const dialogueTexts = [
      "Hello Adventurer!",
      "Welcome to our tavern.",
      "Here you can learn all about our lord from the people and things around you."
    ];

    if (isTyping) {
      // First press during typing - show full text
      clearTimeout(textTimeoutRef.current);
      setDisplayedText(dialogueTexts[dialogueStep]);
      setIsTyping(false);
      return;
    }

    // Second press or auto-progress - go to next dialogue
    const nextStep = dialogueStep + 1;
    if (nextStep >= dialogueTexts.length) {
      setShowNPCDialogue(false);
      const scene = sceneRef.current;
      if (scene && scene.npc) {
        moveNPCToFinalPosition(scene);
      }
      setDialogueStep(0);
      return;
    }

    setDialogueStep(nextStep);
    typeWriter(dialogueTexts[nextStep]);
  }, [dialogueStep, isTyping, typeWriter]);

  // Finally define handleKeyDown
  const handleKeyDown = useCallback((event) => {
    switch(event.key.toLowerCase()) {
      case 'a':
        if (showDialogue) {
          window.open('https://instagram.com/sw4y4mj4in', '_blank');
          setShowDialogue(false);
        }
        if (showGithubDialogue) {
          window.open('https://github.com/swayamjain', '_blank');
          setShowGithubDialogue(false);
        }
        if (showNPCDialogue) {
          if (dialogueTimer) {
            clearTimeout(dialogueTimer);
            setDialogueTimer(null);
          }
          progressDialogue();
        }
        break;
      case 's':
        if (showDialogue) setShowDialogue(false);
        if (showSkillsDialogue) setShowSkillsDialogue(false);
        if (showGithubDialogue) setShowGithubDialogue(false);
        if (showKnifeDialogue) setShowKnifeDialogue(false);
        break;
    }
  }, [showDialogue, showSkillsDialogue, showGithubDialogue, showKnifeDialogue, showNPCDialogue, dialogueTimer, progressDialogue]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Check if we're on mobile
    setIsMobile(window.innerWidth <= 768);

    // Add window resize listener
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    // These constants control the base game size
    const MAP_WIDTH = 15 * 32;  // 480 pixels
    const MAP_HEIGHT = 13 * 32; // 416 pixels

    const config = {
      type: Phaser.AUTO,
      width: MAP_WIDTH,
      height: MAP_HEIGHT,
      parent: gameRef.current,
      backgroundColor: '#111111', // Add background color
      physics: {
        default: "arcade",
        arcade: {
          debug: false,
          gravity: { y: 0 }
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        min: {
          width: MAP_WIDTH * 0.5,  // Allow scaling down to 50%
          height: MAP_HEIGHT * 0.5
        },
        max: {
          width: MAP_WIDTH,
          height: MAP_HEIGHT
        }
      },
      render: {
        pixelArt: true, // Add this for better pixel art rendering
        antialias: false
      }
    };

    const game = new Phaser.Game(config);
    phaserGameRef.current = game; // Store game instance in ref

    function preload() {
      // Update asset paths to be relative to the base URL
      this.load.tilemapTiledJSON("map", "./assets/map.json");
      this.load.image('woodland_indoor', './assets/tilesets/tileset.png');
      this.load.spritesheet("player", "./assets/player.png", {
        frameWidth: 32,
        frameHeight: 64,
        spacing: 0,
        margin: 0
      });
      this.load.spritesheet("npc", "./assets/npc.png", {
        frameWidth: 32,
        frameHeight: 64
      });
    }

    function create() {
      // Create the map
      const map = this.make.tilemap({ key: "map" });
      const tileset = map.addTilesetImage("woodland_indoor", "woodland_indoor");

      // Create layers with specific depths
      const layers = {};
      
      // Ground and lower layers (depth 0-10)
      layers.ground = map.createLayer("Ground", tileset).setDepth(0);
      layers.walls = map.createLayer("Walls", tileset).setDepth(1);
      layers.doors = map.createLayer("doors", tileset).setDepth(2);
      layers.floorMat = map.createLayer("floor mat", tileset).setDepth(3);
      
      // Chair layer (depth 15)
      layers.underTable = map.createLayer("under the table", tileset).setDepth(13);
      
      // Table and upper layers (depth 25-35)
      layers.tabledepth = map.createLayer("tabledepth", tileset).setDepth(17);
      layers.table = map.createLayer("table", tileset).setDepth(10);
      layers.onTable = map.createLayer("on the table", tileset).setDepth(32);
      layers.onTable2 = map.createLayer("on the table2", tileset).setDepth(33);
      layers.onTable3 = map.createLayer("on the table3", tileset).setDepth(31);
      layers.bar = map.createLayer("bar", tileset).setDepth(10);
      layers.onBar = map.createLayer("on the bar", tileset).setDepth(10);
      layers.bookshelf = map.createLayer("bookshelf", tileset).setDepth(10);
      layers.boundary = map.createLayer("boundary", tileset).setDepth(10);
      layers.boundary2 = map.createLayer("boundary2", tileset).setDepth(10);
      layers.underTable2 = map.createLayer("undetabledepth", tileset).setDepth(9);
      // Create player with initial depth between chairs and tables
      this.player = this.physics.add.sprite(245, 362, "player");
      this.player.setCollideWorldBounds(true);
      this.player.setSize(20, 45);     // Collision box for 32x64 sprite
      this.player.setOffset(6, 14);    // Offset collision box
      this.player.setDepth(12);        // Default depth between chairs and tables

      // Get all collision layers
      const collisionLayers = [
        'collison',           
        'door collision',     
        'table collison',     
        'bas collision',      
        'on the bas collision',
        'skillsTrigger',
        'githubTrigger',
        'knifeTrigger'        // Add this new trigger
      ];
      
      // Set up collision objects
      const colliders = this.physics.add.staticGroup();
      this.doorColliders = this.physics.add.staticGroup(); // Group for doors
      this.skillsColliders = this.physics.add.staticGroup(); // Group for skills trigger
      this.githubColliders = this.physics.add.staticGroup(); // Add this line for GitHub colliders
      this.knifeColliders = this.physics.add.staticGroup();
      
      collisionLayers.forEach(layerName => {
        const layer = map.getObjectLayer(layerName);
        if (layer && layer.objects) {
          layer.objects.forEach(object => {
            const collider = this.add.rectangle(
              object.x + (object.width / 2), 
              object.y + (object.height / 2),
              object.width,
              object.height
            );
            
            this.physics.add.existing(collider, true);
            
            // Add to appropriate group
            if (layerName === 'door collision') {
              this.doorColliders.add(collider);
            } else if (layerName === 'skillsTrigger') {
              this.skillsColliders.add(collider);
            } else if (layerName === 'githubTrigger') {  // Add this condition
              this.githubColliders.add(collider);
            } else if (layerName === 'knifeTrigger') {
              this.knifeColliders.add(collider);
            } else {
              colliders.add(collider);
            }
          });
        }
      });

      // Add regular collisions
      this.physics.add.collider(this.player, colliders);

      // Add door collision with overlap callback
      let isOverlappingDoor = false;
      this.physics.add.overlap(
        this.player,
        this.doorColliders,
        () => {
          if (!isOverlappingDoor) {
            isOverlappingDoor = true;
            setShowDialogue(true);
          }
        }
      );

      // Add skills trigger with overlap callback
      let isOverlappingSkills = false;
      this.physics.add.overlap(
        this.player,
        this.skillsColliders,
        () => {
          if (!isOverlappingSkills) {
            isOverlappingSkills = true;
            setShowSkillsDialogue(true);
          }
        }
      );

      // Add Github trigger with overlap callback
      let isOverlappingGithub = false;
      this.physics.add.overlap(
        this.player,
        this.githubColliders,  // Make sure to create this group like others
        () => {
          if (!isOverlappingGithub) {
            isOverlappingGithub = true;
            setShowGithubDialogue(true);
          }
        }
      );

      // Add knife overlap detection
      let isOverlappingKnife = false;
      this.physics.add.overlap(
        this.player,
        this.knifeColliders,
        () => {
          if (!isOverlappingKnife) {
            isOverlappingKnife = true;
            setShowKnifeDialogue(true);
          }
        }
      );

      // Add a check in the scene for when overlap ends
      this.events.on('update', () => {
        let touchingDoor = false;
        this.doorColliders.getChildren().forEach(door => {
          if (this.physics.overlap(this.player, door)) {
            touchingDoor = true;
          }
        });

        if (!touchingDoor && isOverlappingDoor) {
          isOverlappingDoor = false;
          setShowDialogue(false);
        }

        let touchingSkills = false;
        this.skillsColliders.getChildren().forEach(skill => {
          if (this.physics.overlap(this.player, skill)) {
            touchingSkills = true;
          }
        });

        if (!touchingSkills && isOverlappingSkills) {
          isOverlappingSkills = false;
          setShowSkillsDialogue(false);
        }

        let touchingGithub = false;
        this.githubColliders.getChildren().forEach(github => {
          if (this.physics.overlap(this.player, github)) {
            touchingGithub = true;
          }
        });

        if (!touchingGithub && isOverlappingGithub) {
          isOverlappingGithub = false;
          setShowGithubDialogue(false);
        }

        let touchingKnife = false;
        this.knifeColliders.getChildren().forEach(knife => {
          if (this.physics.overlap(this.player, knife)) {
            touchingKnife = true;
          }
        });

        if (!touchingKnife && isOverlappingKnife) {
          isOverlappingKnife = false;
          setShowKnifeDialogue(false);
        }
      });

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

      // Create NPC
      this.npc = this.physics.add.sprite(400, 372, "npc");
      this.npc.setDepth(8);
      this.npc.setCollideWorldBounds(true);  // Keep NPC in world bounds
      this.npc.body.setImmovable(true);      // Make NPC immovable when player collides
      this.physics.add.collider(this.player, this.npc, null, null, this);
      this.npc.setSize(20, 10);
      
      // NPC animations
      this.anims.create({
        key: "npc-walk-left",
        frames: this.anims.generateFrameNumbers("npc", { start: 3, end: 5 }),
        frameRate: 8,
        repeat: -1
      });
      
      this.anims.create({
        key: "npc-walk-right",
        frames: this.anims.generateFrameNumbers("npc", { start: 9, end: 11 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: "npc-walk-up",
        frames: this.anims.generateFrameNumbers("npc", { start: 0, end: 2 }),
        frameRate: 8,
        repeat: -1
      });

      this.anims.create({
        key: "npc-idle",
        frames: [{ key: "npc", frame: 3 }],
        frameRate: 1
      });

      this.anims.create({
        key: "npc-idle-bar",
        frames: [{ key: "npc", frame: 6 }],
        frameRate: 1
      });

      // Start NPC movement towards player
      if (!npcIntroComplete) {
        this.time.delayedCall(1000, () => {
          const distance = Phaser.Math.Distance.Between(
            this.npc.x, this.npc.y,
            this.player.x, this.player.y
          );
          const duration = distance * 10; // Adjust speed as needed
          
          this.npc.anims.play("npc-walk-left", true);
          
          this.tweens.add({
            targets: this.npc,
            x: this.player.x + 50,
            y: this.player.y, // Stop slightly above player
            duration: duration,
            ease: 'Linear',
            onComplete: () => {
              this.npc.anims.play("npc-idle");
              setShowNPCDialogue(true);
              setNpcIntroComplete(true);
              typeWriter("Hello Adventurer!");
            }
          });
        });
      }
    }

    function update() {
      const speed = 160;
      
      // Add safety check for cursors
      if (!this.cursors) return;
      
      // Stop any previous movement
      this.player.setVelocity(0);

      // Movement and animation code
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

      // Track player position for dialogue positioning
      setPlayerPosition({
        x: this.player.x,
        y: this.player.y
      });
    }

    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Run this effect only once on mount

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

  // Add new styles for the retro dialogue and mobile controls
  const dialogueStyle = {
    position: 'absolute',
    backgroundColor: '#FEF5EA',
    left: '50%',
    transform: 'translateX(-50%)',
    border: '4px solid #fff',
    boxShadow: '0 0 0 4px #000',
    color: '#0B1623',
    padding: '15px',
    width: '280px',
    imageRendering: 'pixelated',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '12px',
    lineHeight: '1.5',
    zIndex: 1000,
    // Position above player with margin
    bottom: `calc(50% + ${playerPosition.y + 100}px)`,
  };

  const mobileControlsStyle = {
    position: 'fixed',
    bottom: '20px',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    zIndex: 1000
  };

  const actionButtonStyle = {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    border: '3px solid #fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: 'white',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 10px',
    cursor: 'pointer',
    fontFamily: '"Press Start 2P", monospace',
  };

  // Add new styles for the skills dialogue
  const skillsDialogueStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#000',
    border: '4px solid #fff',
    boxShadow: '0 0 0 4px #000',
    color: 'white',
    padding: '20px',
    width: '300px',
    maxWidth: '90%',
    imageRendering: 'pixelated',
    fontFamily: '"Press Start 2P", monospace',
    fontSize: '12px',
    lineHeight: '1.5',
    zIndex: 1000,
    textAlign: 'left',
  };

  // Update the useEffect for dialogue timing
  useEffect(() => {
    if (showNPCDialogue && !isTyping && dialogueStep < 3) {
      const timer = setTimeout(() => {
        progressDialogue();
      }, 4000); // Increased time to 4 seconds for better readability
      setDialogueTimer(timer);

      return () => {
        clearTimeout(timer);
        setDialogueTimer(null);
      };
    }
  }, [showNPCDialogue, dialogueStep, isTyping, progressDialogue]);

  // Add this function to handle the complex NPC movement
  const moveNPCToFinalPosition = (scene) => {
    const path = [
      { x: scene.npc.x + 128, y: scene.npc.y }, // Move right
      { x: scene.npc.x + 128, y: scene.npc.y - 300 }, // Move up
      { x: 208, y: scene.npc.y - 300 }, // Move left
      { x: 208, y: 70 } // Final move up
    ];

    let currentStep = 0;
    
    function moveToNextPoint() {
      if (currentStep >= path.length) {
        scene.npc.anims.play("npc-idle-bar");
        scene.npc.body.setImmovable(true); // Ensure NPC stays immovable at final position
        return;
      }

      const target = path[currentStep];
      const duration = Phaser.Math.Distance.Between(
        scene.npc.x, scene.npc.y,
        target.x, target.y
      ) * 15;

      // Determine animation based on movement direction
      if (target.x < scene.npc.x) {
        scene.npc.anims.play("npc-walk-left", true);
      } else if (target.x > scene.npc.x) {
        scene.npc.anims.play("npc-walk-right", true);
      } else if (target.y !== scene.npc.y) {
        scene.npc.anims.play("npc-walk-up", true);
      }

      scene.tweens.add({
        targets: scene.npc,
        x: target.x,
        y: target.y,
        duration: duration,
        ease: 'Linear',
        onUpdate: () => {
          // Keep collision active during movement
          scene.npc.body.setImmovable(true);
        },
        onComplete: () => {
          currentStep++;
          moveToNextPoint();
        }
      });
    }

    moveToNextPoint();
  };

  return (
    <div className="game-container">
      <div ref={gameRef} className="game-canvas" />
      
      {showDialogue && (
        <div className="dialogue-box">
          <div style={{ marginBottom: '10px' }}>Contact Me</div>
          <div style={{ marginBottom: '15px' }}>instagram.com/sw4y4mj4in</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press A for Yes, S for No
          </div>
        </div>
      )}

      {showSkillsDialogue && (
        <div className="skills-dialogue">
          <h3>My Skills</h3>
          <ul>
            {skills.map(skill => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press S to close
          </div>
        </div>
      )}

      {showGithubDialogue && (
        <div className="dialogue-box">
          <div style={{ marginBottom: '10px' }}>See My Work</div>
          <div style={{ marginBottom: '15px' }}>github.com/swayamjain</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press A for Yes, S for No
          </div>
        </div>
      )}

      {showKnifeDialogue && (
        <div className="dialogue-box">
          <div style={{ marginBottom: '15px' }}>That knife looks dangerous, better stay away from it!</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press S to close
          </div>
        </div>
      )}

      {showNPCDialogue && (
        <div className="dialogue-box npc-dialogue">
          <div>
            <div className={`typewriter ${!isTyping ? 'instant' : ''}`} style={{ marginBottom: '15px' }}>
              {displayedText}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              {isTyping ? 'Press A to skip' : 'Press A to continue'}
            </div>
          </div>
        </div>
      )}

      <div className="controls">
        <div className="action-buttons">
          <button 
            style={{...actionButtonStyle, backgroundColor: '#4CAF50'}}
            onClick={() => {
              if (showDialogue) {
                window.open('https://instagram.com/sw4y4mj4in', '_blank');
                setShowDialogue(false);
              }
              if (showGithubDialogue) {
                window.open('https://github.com/swayamjain', '_blank');
                setShowGithubDialogue(false);
              }
            }}
          >
            A
          </button>
          <button 
            style={{...actionButtonStyle, backgroundColor: '#f44336'}}
            onClick={() => {
              if (showDialogue) setShowDialogue(false);
              if (showSkillsDialogue) setShowSkillsDialogue(false);
              if (showGithubDialogue) setShowGithubDialogue(false);
              if (showKnifeDialogue) setShowKnifeDialogue(false);
            }}
          >
            S
          </button>
        </div>
        <div className="joystick-container">
          <Joystick 
            size={120}
            baseColor="rgba(255, 255, 255, 0.2)"
            stickColor="rgba(255, 255, 255, 0.8)"
            move={handleMove}
            stop={handleStop}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
