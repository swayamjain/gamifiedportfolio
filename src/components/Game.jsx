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
  const [showMenuDialogue, setShowMenuDialogue] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const menuTimeoutRef = useRef(null);
  const [isMenuActive, setIsMenuActive] = useState(false);
  const [menuCooldown, setMenuCooldown] = useState(false);
  const [showSideTable1Dialogue, setShowSideTable1Dialogue] = useState(false);
  const [showSideTable2Dialogue, setShowSideTable2Dialogue] = useState(false);
  const [showBarrelDialogue, setShowBarrelDialogue] = useState(false);
  const [showBookDialogue, setShowBookDialogue] = useState(false);

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

    const scene = sceneRef.current;
    if (scene?.messageSound) {
      scene.messageSound.play();
    }

    setIsTyping(true);
    setSkipPressed(false);
    let i = 0;
    const speed = 125;

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
      "Welcome to my tavern",
      "That table's seen more plans than a war room, and the barrel? Let's just say it holds more than ale.",
      "If you're one for secrets, there's a paper by the door in the back.",
      "Need me? I'll be at the bar—where all the best tales begin."
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

  // First, add these state handlers to handle menu navigation
  const handleMenuSelection = (direction) => {
    if (!showMenuOptions) return;

    const scene = sceneRef.current;
    if (scene?.menuSelectSound) {
      scene.menuSelectSound.play();
    }

    setSelectedOption(prev => {
      if (direction === 'up') {
        return prev === null || prev === 0 ? 3 : prev - 1;
      } else {
        return prev === null || prev === 3 ? 0 : prev + 1;
      }
    });
  };

  // Update the handleKeyDown function
  const handleKeyDown = useCallback((event) => {
    // If menu is active, only allow menu-related keys (A, S, Up, Down)
    if (isMenuActive) {
      switch (event.key.toLowerCase()) {
        case 'arrowup':
          event.preventDefault();
          if (showMenuOptions) {
            handleMenuSelection('up');
          }
          break;
        case 'arrowdown':
          event.preventDefault();
          if (showMenuOptions) {
            handleMenuSelection('down');
          }
          break;
        case 'a':
          event.preventDefault();
          if (showMenuOptions) {
            // Get the appropriate email link based on selected option
            const emailLinks = [
              'mailto:jswayam234@gmail.com?subject=Responsive%20Brand%20Design&body=Hello%2C%0A%0AI%20am%20interested%20in%20getting%20a%20responsive%20brand%20design%20for%20my%20business.%20Here%20are%20some%20details%3A%0A%0A-%20Business%20Name%3A%20%20%0A-%20Industry%2FNiche%3A%20%20%0A-%20Preferred%20Color%20Scheme%20%26%20Style%3A%20%20%0A-%20Logo%20%26%20Branding%20Elements%20(if%20any)%3A%20%20%0A-%20Key%20Features%20Needed%3A%20%20%0A-%20Competitor%20Websites%20(if%20any)%3A%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0AThank%20you!%20Looking%20forward%20to%20your%20response.%0A',
              'mailto:jswayam234@gmail.com?subject=UI%2FUX%20Design&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20UI%2FUX%20design%20services.%20Here%20are%20my%20project%20details%3A%0A%0A-%20Project%20Name%3A%20%20%0A-%20Type%20(Website%2FApp%2FDashboard)%3A%20%20%0A-%20Target%20Audience%3A%20%20%0A-%20Preferred%20Design%20Style%20(Minimal%2C%20Modern%2C%20etc.)%3A%20%20%0A-%20Main%20Features%20%26%20Functionalities%3A%20%20%0A-%20Do%20you%20have%20wireframes%20or%20references%3F%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0AThanks%2C%20looking%20forward%20to%20working%20with%20you!%0A',
              'mailto:jswayam234@gmail.com?subject=React%20Web%20App&body=Hello%2C%0A%0AI%20am%20looking%20for%20a%20React-based%20web%20application.%20Here%20are%20the%20project%20details%3A%0A%0A-%20Project%20Name%3A%20%20%0A-%20Purpose%20of%20the%20Web%20App%3A%20%20%0A-%20Key%20Features%20Required%3A%20%20%0A-%20Authentication%20Needed%3F%20(Yes%2FNo)%3A%20%20%0A-%20Third-party%20API%20Integrations%20(if%20any)%3A%20%20%0A-%20Do%20you%20have%20a%20design%20ready%3F%20(Yes%2FNo)%3A%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0ALooking%20forward%20to%20your%20response!%0A',
              'mailto:jswayam234@gmail.com?subject=Custom%20Order&body=Hello%2C%0A%0AI%20have%20a%20custom%20website%20project%20in%20mind.%20Here%20are%20the%20initial%20details%3A%0A%0A-%20Project%20Type%20(Website%2FWeb%20App%2FOther)%3A%20%20%0A-%20Key%20Features%20%26%20Functionalities%20Needed%3A%20%20%0A-%20Technology%20Preferences%20(if%20any)%3A%20%20%0A-%20Design%20Preferences%20(if%20any)%3A%20%20%0A-%20Any%20References%20or%20Examples%3F%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0AExcited%20to%20discuss%20this%20further.%20Please%20let%20me%20know%20your%20thoughts!%0A'
            ];

            // Open the selected email template
            window.location.href = emailLinks[selectedOption];

            // Reset menu state
            setShowMenuOptions(false);
            setShowMenuDialogue(false);
            setIsMenuActive(false);
            const scene = sceneRef.current;
            if (scene?.menuBarrier) {
              scene.menuBarrier.body.enable = false;
            }
            return;
          }
          if (showMenuDialogue) {
            clearTimeout(menuTimeoutRef.current);
            setSelectedOption(0);
            setShowMenuOptions(true);
            setShowMenuDialogue(false);
            setIsMenuActive(true);
            return;
          }
          break;
        case 's':
          event.preventDefault();
          if (showMenuOptions) {
            setShowMenuOptions(false);
            setShowMenuDialogue(false);
            setIsMenuActive(false);
            setSelectedOption(null);
            setMenuCooldown(true); // Set cooldown when menu is closed
            setTimeout(() => setMenuCooldown(false), 500); // Reset after 500ms
            const scene = sceneRef.current;
            if (scene?.menuBarrier) {
              scene.menuBarrier.body.enable = false;
            }
            return;
          }
          if (showMenuDialogue) {
            setShowMenuDialogue(false);
            setIsMenuActive(false);
            setMenuCooldown(true); // Set cooldown when menu is closed
            setTimeout(() => setMenuCooldown(false), 500); // Reset after 500ms
            const scene = sceneRef.current;
            if (scene?.menuBarrier) {
              scene.menuBarrier.body.enable = false;
            }
            return;
          }
          break;
      }
      // Prevent any other key processing when menu is active
      event.preventDefault();
      return;
    }

    // Normal key handling when menu is not active
    switch (event.key.toLowerCase()) {
      case 'a':
        if (showDialogue) {
          window.open('https://instagram.com/sw4y4mj4in', '_blank');
          setShowDialogue(false);
        }
        if (showGithubDialogue) {
          window.open('https://github.com/swayamjain', '_blank');
          setShowGithubDialogue(false);
        }
        if (showSideTable1Dialogue) {
          window.open('https://www.instagram.com/reel/DHH5n5aoLua', '_blank');
          setShowSideTable1Dialogue(false);
        }
        if (showSideTable2Dialogue) {
          window.open('https://www.instagram.com/p/Ci5h9KmjjDL', '_blank');
          setShowSideTable2Dialogue(false);
        }
        if (showBarrelDialogue) {
          window.open('https://www.instagram.com/p/C8gc1TaNddn', '_blank');
          setShowBarrelDialogue(false);
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
        if (showSideTable1Dialogue) setShowSideTable1Dialogue(false);
        if (showSideTable2Dialogue) setShowSideTable2Dialogue(false);
        if (showBarrelDialogue) setShowBarrelDialogue(false);
        if (showBookDialogue) setShowBookDialogue(false);
        break;
    }
  }, [showDialogue, showSkillsDialogue, showGithubDialogue, showKnifeDialogue, showNPCDialogue, showMenuOptions, showMenuDialogue, dialogueTimer, progressDialogue, isMenuActive, menuCooldown, showSideTable1Dialogue, showSideTable2Dialogue, showBarrelDialogue, showBookDialogue]);

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

      // Load sound effects
      this.load.audio('message', './assets/sounds/message.mp3');
      this.load.audio('menuSelect', './assets/sounds/click7.mp3');
      this.load.audio('walking', './assets/sounds/woodwalking.mp3');
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

      // First, add the new trigger layers to the collisionLayers array
      const collisionLayers = [
        'collison',
        'door collision',
        'table collison',
        'bas collision',
        'on the bas collision',
        'skillsTrigger',
        'githubTrigger',
        'knifeTrigger',
        'sidetable1',        // Physical collision
        'sidetable2',        // Physical collision
        'barrel',            // Physical collision
        'sidetable1trigger', // Trigger layer
        'sidetable2trigger', // Trigger layer
        'barreltrigger',
        'bookshelftrigger'      // Trigger layer
      ];

      // Set up collision objects
      const colliders = this.physics.add.staticGroup();
      this.doorColliders = this.physics.add.staticGroup(); // Group for doors
      this.skillsColliders = this.physics.add.staticGroup(); // Group for skills trigger
      this.githubColliders = this.physics.add.staticGroup(); // Add this line for GitHub colliders
      this.knifeColliders = this.physics.add.staticGroup();
      this.sideTable1Colliders = this.physics.add.staticGroup();
      this.sideTable2Colliders = this.physics.add.staticGroup();
      this.barrelColliders = this.physics.add.staticGroup();
      this.sideTable1Triggers = this.physics.add.staticGroup();  // New trigger groups
      this.sideTable2Triggers = this.physics.add.staticGroup();
      this.barrelTriggers = this.physics.add.staticGroup();
      this.bookshelfTriggers = this.physics.add.staticGroup();

      collisionLayers.forEach(layerName => {
        const layer = map.getObjectLayer(layerName);
        if (layer && layer.objects) {
          layer.objects.forEach(object => {
            const rectangle = this.add.rectangle(
              object.x + (object.width / 2),
              object.y + (object.height / 2),
              object.width,
              object.height
            );

            this.physics.add.existing(rectangle, true);

            // Add to appropriate group based on layer name
            switch (layerName) {
              case 'door collision':
                this.doorColliders.add(rectangle);
                break;
              case 'skillsTrigger':
                this.skillsColliders.add(rectangle);
                break;
              case 'githubTrigger':
                this.githubColliders.add(rectangle);
                break;
              case 'knifeTrigger':
                this.knifeColliders.add(rectangle);
                break;
              case 'sidetable1':
                this.sideTable1Colliders.add(rectangle);
                break;
              case 'sidetable2':
                this.sideTable2Colliders.add(rectangle);
                break;
              case 'barrel':
                this.barrelColliders.add(rectangle);
                break;
              case 'sidetable1trigger':
                this.sideTable1Triggers.add(rectangle);
                break;
              case 'sidetable2trigger':
                this.sideTable2Triggers.add(rectangle);
                break;
              case 'barreltrigger':
                this.barrelTriggers.add(rectangle);
                break;
              case 'bookshelftrigger':
                this.bookshelfTriggers.add(rectangle);
                break;
              default:
                colliders.add(rectangle);
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

      // Update the overlap checks for sidetable1
      let isOverlappingSideTable1 = false;
      this.physics.add.overlap(
        this.player,
        this.sideTable1Triggers,
        () => {
          if (!isOverlappingSideTable1) {
            isOverlappingSideTable1 = true;
            setShowSideTable1Dialogue(true);
          }
        }
      );

      // Update the overlap checks for sidetable2
      let isOverlappingSideTable2 = false;
      this.physics.add.overlap(
        this.player,
        this.sideTable2Triggers,
        () => {
          if (!isOverlappingSideTable2) {
            isOverlappingSideTable2 = true;
            setShowSideTable2Dialogue(true);
          }
        }
      );

      // Update the overlap checks for barrel
      let isOverlappingBarrel = false;
      this.physics.add.overlap(
        this.player,
        this.barrelTriggers,
        () => {
          if (!isOverlappingBarrel) {
            isOverlappingBarrel = true;
            setShowBarrelDialogue(true);
          }
        }
      );
      let isOverlappingBook = false;
      this.physics.add.overlap(
        this.player,
        this.bookshelfTriggers,
        () =>{
          if(!isOverlappingBook){
            isOverlappingBook = true;
            setShowBookDialogue(true);
          }
        }
      );

      // Add this to your update event listener
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

        // Add checks for sidetable1
        let touchingSideTable1 = false;
        this.sideTable1Triggers.getChildren().forEach(trigger => {
          if (this.physics.overlap(this.player, trigger)) {
            touchingSideTable1 = true;
          }
        });
        if (!touchingSideTable1 && isOverlappingSideTable1) {
          isOverlappingSideTable1 = false;
          setShowSideTable1Dialogue(false);
        }

        // Add checks for sidetable2
        let touchingSideTable2 = false;
        this.sideTable2Triggers.getChildren().forEach(trigger => {
          if (this.physics.overlap(this.player, trigger)) {
            touchingSideTable2 = true;
          }
        });
        if (!touchingSideTable2 && isOverlappingSideTable2) {
          isOverlappingSideTable2 = false;
          setShowSideTable2Dialogue(false);
        }

        // Add checks for barrel
        let touchingBarrel = false;
        this.barrelTriggers.getChildren().forEach(trigger => {
          if (this.physics.overlap(this.player, trigger)) {
            touchingBarrel = true;
          }
        });
        if (!touchingBarrel && isOverlappingBarrel) {
          isOverlappingBarrel = false;
          setShowBarrelDialogue(false);
        }

        let touchingBook = false;
        this.bookshelfTriggers.getChildren().forEach(skill => {
          if (this.physics.overlap(this.player, skill)) {
            touchingBook = true;
          }
        });

        if (!touchingBook && isOverlappingBook) {
          isOverlappingBook = false;
          setShowBookDialogue(false);
        }
      });

      // Keep the physical collisions separate
      this.physics.add.collider(this.player, this.sideTable1Colliders);
      this.physics.add.collider(this.player, this.sideTable2Colliders);
      this.physics.add.collider(this.player, this.barrelColliders);

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
      this.physics.add.collider(this.player, this.npc, (player, npc) => {
        if (npc.y === 70 && !showMenuDialogue && !showMenuOptions && !menuCooldown) {
          setShowMenuDialogue(true);
          setIsMenuActive(true);
          // Enable the barrier when menu opens
          this.menuBarrier.body.enable = true;
          menuTimeoutRef.current = setTimeout(() => {
            setShowMenuOptions(true);
            setSelectedOption(0);
            setShowMenuDialogue(false);
          }, 3000);
        }
      }, null, this);
      this.npc.setSize(20, 12);

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
              typeWriter("Welcome to my tavern");
            }
          });
        });
      }

      // Create invisible barrier
      this.menuBarrier = this.add.rectangle(208, 150, 64, 32); // Position it near the NPC
      this.physics.add.existing(this.menuBarrier, true); // Make it a static physics body
      this.menuBarrier.body.enable = false; // Initially disable collision

      // Add collision between player and barrier
      this.physics.add.collider(this.player, this.menuBarrier);

      // Create sound effects
      this.messageSound = this.sound.add('message');
      this.menuSelectSound = this.sound.add('menuSelect');
      this.walkingSound = this.sound.add('walking', {
        loop: true,
        volume: 0.35  // Adjust volume as needed
      });
    }

    function update() {
      const speed = 120;

      if (!this.cursors) return;

      this.player.setVelocity(0);

      // Only allow movement when menu is not active
      if (!isMenuActive) {
        let isMoving = false;

        if (this.cursors.left.isDown) {
          this.player.setVelocityX(-speed);
          this.player.anims.play("walk-left", true);
          isMoving = true;
        } else if (this.cursors.right.isDown) {
          this.player.setVelocityX(speed);
          this.player.anims.play("walk-right", true);
          isMoving = true;
        } else if (this.cursors.up.isDown) {
          this.player.setVelocityY(-speed);
          this.player.anims.play("walk-up", true);
          isMoving = true;
        } else if (this.cursors.down.isDown) {
          this.player.setVelocityY(speed);
          this.player.anims.play("walk-down", true);
          isMoving = true;
        }

        // Play or stop walking sound based on movement
        if (isMoving && !this.walkingSound.isPlaying) {
          this.walkingSound.play();
        } else if (!isMoving && this.walkingSound.isPlaying) {
          this.walkingSound.stop();
        }
      } else {
        // Stop walking sound when menu is active
        if (this.walkingSound.isPlaying) {
          this.walkingSound.stop();
        }
      }

      if (this.player.body.velocity.x === 0 && this.player.body.velocity.y === 0) {
        const key = this.player.anims.currentAnim ? this.player.anims.currentAnim.key : 'walk-down';
        if (key.startsWith('walk-')) {
          this.player.anims.play(`idle-${key.split('-')[1]}`, true);
        }
      }

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

    // Only handle movement if menu is not active
    if (!isMenuActive) {
      if (data.x || data.y) {
        if (Math.abs(data.x) > Math.abs(data.y)) {
          scene.cursors[data.x > 0 ? 'right' : 'left'].isDown = true;
        } else {
          scene.cursors[data.y < 0 ? 'down' : 'up'].isDown = true;
        }
      }
    }

    // Handle menu navigation with reduced sensitivity
    if (showMenuOptions && data.y) {
      // Only trigger menu selection if joystick is moved more than 50% in either direction
      const threshold = 0.4;
      if (Math.abs(data.y) > threshold) {
        // Debounce the menu selection to prevent rapid changes
        if (!menuTimeoutRef.current) {
          handleMenuSelection(data.y < 0 ? 'down' : 'up');
          // Set a timeout to prevent rapid selection changes
          menuTimeoutRef.current = setTimeout(() => {
            menuTimeoutRef.current = null;
          }, 250); // 250ms delay between selections
        }
      }
    }
  };

  // Make sure to clear the timeout when stopping
  const handleStop = () => {
    const scene = sceneRef.current;
    if (!scene?.cursors) return;

    scene.cursors.up.isDown = false;
    scene.cursors.down.isDown = false;
    scene.cursors.left.isDown = false;
    scene.cursors.right.isDown = false;

    // Clear the menu selection timeout
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
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

  // Add this effect back to handle menu auto-closing when player walks away
  useEffect(() => {
    if (showMenuDialogue || showMenuOptions) {
      const scene = sceneRef.current;
      if (scene && scene.npc && scene.player) {
        const distance = Phaser.Math.Distance.Between(
          scene.npc.x, scene.npc.y,
          scene.player.x, scene.player.y
        );
        if (distance > 50) {
          setShowMenuDialogue(false);
          setShowMenuOptions(false);
          setSelectedOption(null);
          setIsMenuActive(false);
          clearTimeout(menuTimeoutRef.current);
          // Disable the barrier when walking away
          if (scene.menuBarrier) {
            scene.menuBarrier.body.enable = false;
          }
        }
      }
    }
  }, [playerPosition, showMenuDialogue, showMenuOptions]);

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
      
      {showBookDialogue &&(
  <div className="book-dialogue">
    <div className="book-content">
      <div className="leftpage">
        <div className="lefthead">Words Of the Wise</div>
        <div className="leftcont">"Programs must be written for people to read, and only incidentally for machines to execute."
        <p>— Harold Abelson</p></div> 
      </div>
        <div className="rightpage">
          <div className="righthead">The Coders Creed</div>
          <div className="rightcont">The lesson, noble traveler, speaks of clarity—let thy code be legible, lest future scribes curse thy name.</div>
          <div style={{ fontSize: '1rem', opacity: 0.8}}>
            Press S to close
          </div>
        </div>
    </div>
  </div>
 )}

      {showGithubDialogue && (
        <div className="github-dialogue">
          <div className="github-head">See My Work</div>
          <div className="github-cont">github.com/swayamjain</div>
          <div className="github-afterthought">
            Press A to see, S for No
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

      {showMenuDialogue && (
        <div className="dialogue-box npc-dialogue">
          <div style={{ marginBottom: '15px' }}>
            Order a piping hot wbesite now
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press A to view menu, S to close
          </div>
        </div>
      )}

      {showMenuOptions && (
        <div className="dialogue-box npc-dialogue">
          <div style={{ marginBottom: '15px' }}>
            {['Responsive Brand Website', 'UI/UX Design', 'React Web App', 'Custom Order'].map((option, index) => (
              <div
                key={option}
                style={{
                  padding: '8px',
                  marginBottom: '5px',
                  backgroundColor: selectedOption === index ? '#483C32' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span style={{
                  visibility: selectedOption === index ? 'visible' : 'hidden',
                  marginRight: '8px',
                  fontFamily: '"Press Start 2P", monospace',
                  color: '#fff'
                }}>
                  {'>'}
                </span>
                {option}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Use ↑↓ to select, A to confirm, S to cancel
          </div>
        </div>
      )}

      {showSideTable1Dialogue && (
        <div className="dialogue-box">
          <div style={{ marginBottom: '10px' }}>PrivChat</div>
          <div style={{ marginBottom: '15px' }}>it's a glimpse video of my personal project,one on one texting app</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press A to watch, S for No
          </div>
        </div>
      )}

      {showSideTable2Dialogue && (
        <div className="dialogue-box">
          <div style={{ marginBottom: '10px' }}>Python</div>
          <div style={{ marginBottom: '15px' }}>Oh, I can do python too for scripting purposes</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press A to see, S for No
          </div>
        </div>
      )}

      {showBarrelDialogue && (
        <div className="dialogue-box">
          <div style={{ marginBottom: '10px' }}>Cinematography</div>
          <div style={{ marginBottom: '15px' }}>Rather odd skill for a coder, I know</div>
          <div style={{ fontSize: '10px', opacity: 0.8 }}>
            Press A to watch, S for No
          </div>
        </div>
      )}

      <div className="controls">
        <div className="action-buttons">
          <button
            style={{ ...actionButtonStyle, backgroundColor: '#4CAF50' }}
            onClick={() => {
              if (showMenuOptions) {
                // Get the appropriate email link based on selected option
                const emailLinks = [
                  'mailto:jswayam234@gmail.com?subject=Responsive%20Brand%20Design&body=Hello%2C%0A%0AI%20am%20interested%20in%20getting%20a%20responsive%20brand%20design%20for%20my%20business.%20Here%20are%20some%20details%3A%0A%0A-%20Business%20Name%3A%20%20%0A-%20Industry%2FNiche%3A%20%20%0A-%20Preferred%20Color%20Scheme%20%26%20Style%3A%20%20%0A-%20Logo%20%26%20Branding%20Elements%20(if%20any)%3A%20%20%0A-%20Key%20Features%20Needed%3A%20%20%0A-%20Competitor%20Websites%20(if%20any)%3A%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0AThank%20you!%20Looking%20forward%20to%20your%20response.%0A',
                  'mailto:jswayam234@gmail.com?subject=UI%2FUX%20Design&body=Hello%2C%0A%0AI%20would%20like%20to%20request%20UI%2FUX%20design%20services.%20Here%20are%20my%20project%20details%3A%0A%0A-%20Project%20Name%3A%20%20%0A-%20Type%20(Website%2FApp%2FDashboard)%3A%20%20%0A-%20Target%20Audience%3A%20%20%0A-%20Preferred%20Design%20Style%20(Minimal%2C%20Modern%2C%20etc.)%3A%20%20%0A-%20Main%20Features%20%26%20Functionalities%3A%20%20%0A-%20Do%20you%20have%20wireframes%20or%20references%3F%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0AThanks%2C%20looking%20forward%20to%20working%20with%20you!%0A',
                  'mailto:jswayam234@gmail.com?subject=React%20Web%20App&body=Hello%2C%0A%0AI%20am%20looking%20for%20a%20React-based%20web%20application.%20Here%20are%20the%20project%20details%3A%0A%0A-%20Project%20Name%3A%20%20%0A-%20Purpose%20of%20the%20Web%20App%3A%20%20%0A-%20Key%20Features%20Required%3A%20%20%0A-%20Authentication%20Needed%3F%20(Yes%2FNo)%3A%20%20%0A-%20Third-party%20API%20Integrations%20(if%20any)%3A%20%20%0A-%20Do%20you%20have%20a%20design%20ready%3F%20(Yes%2FNo)%3A%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0ALooking%20forward%20to%20your%20response!%0A',
                  'mailto:jswayam234@gmail.com?subject=Custom%20Order&body=Hello%2C%0A%0AI%20have%20a%20custom%20website%20project%20in%20mind.%20Here%20are%20the%20initial%20details%3A%0A%0A-%20Project%20Type%20(Website%2FWeb%20App%2FOther)%3A%20%20%0A-%20Key%20Features%20%26%20Functionalities%20Needed%3A%20%20%0A-%20Technology%20Preferences%20(if%20any)%3A%20%20%0A-%20Design%20Preferences%20(if%20any)%3A%20%20%0A-%20Any%20References%20or%20Examples%3F%20%20%0A%0AAdditional%20Notes%3A%20%20%0A%5BWrite%20anything%20specific%20you%20need%5D%20%20%0A%0AExcited%20to%20discuss%20this%20further.%20Please%20let%20me%20know%20your%20thoughts!%0A'
                ];

                // Open the selected email template
                window.location.href = emailLinks[selectedOption];

                // Reset menu state
                setShowMenuOptions(false);
                setShowMenuDialogue(false);
                setIsMenuActive(false);
                const scene = sceneRef.current;
                if (scene?.menuBarrier) {
                  scene.menuBarrier.body.enable = false;
                }
                return;
              }
              if (showMenuDialogue) {
                clearTimeout(menuTimeoutRef.current);
                setSelectedOption(0);
                setShowMenuOptions(true);
                setShowMenuDialogue(false);
                setIsMenuActive(true);
                return;
              }
              if (showDialogue) {
                window.open('https://instagram.com/sw4y4mj4in', '_blank');
                setShowDialogue(false);
              }
              if (showGithubDialogue) {
                window.open('https://github.com/swayamjain', '_blank');
                setShowGithubDialogue(false);
              }
              if (showSideTable1Dialogue) {
                window.open('https://www.instagram.com/reel/DHH5n5aoLua', '_blank');
                setShowSideTable1Dialogue(false);
              }
              if (showSideTable2Dialogue) {
                window.open('https://www.instagram.com/p/Ci5h9KmjjDL', '_blank');
                setShowSideTable2Dialogue(false);
              }
              if (showBarrelDialogue) {
                window.open('https://www.instagram.com/p/C8gc1TaNddn', '_blank');
                setShowBarrelDialogue(false);
              }
              if (showNPCDialogue) {
                if (dialogueTimer) {
                  clearTimeout(dialogueTimer);
                  setDialogueTimer(null);
                }
                progressDialogue();
              }
            }}
          >
            A
          </button>
          <button
            style={{ ...actionButtonStyle, backgroundColor: '#f44336' }}
            onClick={() => {
              if (showMenuOptions) {
                setShowMenuOptions(false);
                setShowMenuDialogue(false);
                setIsMenuActive(false);
                setSelectedOption(null);
                setMenuCooldown(true); // Set cooldown when menu is closed
                setTimeout(() => setMenuCooldown(false), 500); // Reset after 500ms
                const scene = sceneRef.current;
                if (scene?.menuBarrier) {
                  scene.menuBarrier.body.enable = false;
                }
                return;
              }
              if (showMenuDialogue) {
                setShowMenuDialogue(false);
                setIsMenuActive(false);
                setMenuCooldown(true); // Set cooldown when menu is closed
                setTimeout(() => setMenuCooldown(false), 500); // Reset after 500ms
                const scene = sceneRef.current;
                if (scene?.menuBarrier) {
                  scene.menuBarrier.body.enable = false;
                }
                return;
              }
              if (showDialogue) setShowDialogue(false);
              if (showSkillsDialogue) setShowSkillsDialogue(false);
              if (showGithubDialogue) setShowGithubDialogue(false);
              if (showKnifeDialogue) setShowKnifeDialogue(false);
              if (showSideTable1Dialogue) setShowSideTable1Dialogue(false);
              if (showSideTable2Dialogue) setShowSideTable2Dialogue(false);
              if (showBarrelDialogue) setShowBarrelDialogue(false);
              if (showBookDialogue) setShowBookDialogue(false);
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
