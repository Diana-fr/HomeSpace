// Никаких import — всё через глобальные переменные

console.log('Starting HomeSpace editor bootstrap');

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 800,
    parent: 'game',
    scene: [window.EditorScene], // ← используем window.EditorScene
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
        } else {
            console.warn('EditorScene is not available yet');
        }
    }, 1500);
} catch (error) {
    console.error('Failed to initialize editor', error);
    const errorNode = document.getElementById('editor-error');
    if (errorNode) errorNode.style.display = 'flex';
}