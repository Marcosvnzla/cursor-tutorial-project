# Super Platformer 🍄

A 2D platformer game inspired by Super Mario Bros, built with Kaboom.js and running in modern browsers.

## Features

✅ **Complete Game Experience**

- Side-scrolling platformer with physics and gravity
- Player character with smooth movement and jumping
- 3 challenging levels with increasing difficulty
- Enemy AI with patrol behavior
- Collectible coins with scoring system
- Lives system with respawn mechanics

✅ **Game States**

- Title screen with instructions
- Active gameplay
- Game over screen
- Victory screen for completing all levels
- Restart functionality

✅ **Visual & Audio**

- Animated player sprites (normal and jumping states)
- Floating coin animations
- Visual feedback for score gains
- Sound effects for jumps, coin collection, enemy defeats, and level completion
- Smooth camera following

✅ **Controls**

- **Keyboard**: Arrow keys to move, Space to jump
- **Touch/Mobile**: Tap left/right sides of screen to move, center to jump

✅ **Performance Optimized**

- Crisp pixel rendering
- Efficient sprite management
- Mobile-friendly touch controls
- Smooth 60fps gameplay

## How to Play

1. Open `index.html` in a modern web browser
2. Press SPACE or tap the screen to start
3. Navigate through 3 increasingly challenging levels
4. Collect coins for points (50 points each)
5. Jump on enemies to defeat them (100 points each)
6. Reach the green flag to complete each level (500 bonus points)
7. Avoid falling off platforms or touching enemies directly (costs 1 life)
8. Complete all 3 levels to achieve victory!

## Level Design

- **Level 1**: Basic platforming with ground platforms and simple floating platforms
- **Level 2**: More challenging with gaps in ground platforms and complex floating sequences
- **Level 3**: Sky level with minimal ground support and precision jumping required

## Technical Details

- Built with Kaboom.js 3000
- Pure JavaScript with Web Audio API for sound
- SVG-based sprites for crisp rendering
- Responsive design that works on desktop and mobile
- No external dependencies beyond Kaboom.js CDN

## File Structure

```
├── index.html          # Main HTML file with game container
├── game.js            # Complete game logic and scenes
├── README.md          # This documentation
└── prompt.txt         # Original project requirements
```

## Browser Compatibility

Works in all modern browsers that support:

- ES6+ JavaScript
- Web Audio API
- Canvas 2D rendering
- Touch events (for mobile)

Tested on Chrome, Firefox, Safari, and Edge.

## Credits

Created with Cursor AI as a complete 2D platformer game implementation following the specifications in `prompt.txt`.
