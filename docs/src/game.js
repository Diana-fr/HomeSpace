// ❌ УДАЛИТЬ эту строку
// import Phaser from 'phaser';

// ❌ УДАЛИТЬ эту строку  
// import { EditorScene } from './scenes/EditorScene.js';

// Phaser уже глобальный, EditorScene будет доступна через window

console.log('Starting HomeSpace editor bootstrap');

// EditorScene должна быть определена глобально
// Убедитесь, что EditorScene загружена перед этим скриптом

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 800,
    parent: 'game',
    scene: [EditorScene], // EditorScene должна быть в глобальной области
    backgroundColor: '#cfe3fb',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    dom: {
        createContainer: true
    }
};

try {
    const game = new Phaser.Game(config);
    console.log('Phaser editor instance created');

    window.homespaceGame = game;
    window.getEditorScene = () => game?.scene?.getScene('EditorScene');

    setTimeout(() => {
        const s = window.getEditorScene?.();
        if (s) {
            console.log('EditorScene is ready', s);
            const debugText = s.add.text(20, 46, 'Scene check: OK', { fontSize: '16px', fill: '#00ff00' }).setDepth(9999);
            setTimeout(() => debugText.destroy(), 5000);
        } else {
            console.warn('EditorScene is not available yet');
        }
    }, 1500);
} catch (error) {
    console.error('Failed to initialize editor', error);
    const errorNode = document.getElementById('editor-error');
    if (errorNode) errorNode.style.display = 'flex';
}