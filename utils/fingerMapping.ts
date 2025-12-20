// Finger type definition
export type FingerName = 'pinky' | 'ring' | 'middle' | 'index' | 'thumb';
export type HandSide = 'left' | 'right';

export interface FingerInfo {
    hand: HandSide;
    finger: FingerName;
}

// Standard touch typing finger mapping
// Reference: https://www.typing.com/blog/which-finger-for-which-key/

const LEFT_PINKY_KEYS = ['q', 'a', 'z', '1', '`', '~', 'tab', 'capslock', 'shift'];
const LEFT_RING_KEYS = ['w', 's', 'x', '2'];
const LEFT_MIDDLE_KEYS = ['e', 'd', 'c', '3'];
const LEFT_INDEX_KEYS = ['r', 'f', 'v', 't', 'g', 'b', '4', '5'];

const RIGHT_INDEX_KEYS = ['y', 'h', 'n', 'u', 'j', 'm', '6', '7'];
const RIGHT_MIDDLE_KEYS = ['i', 'k', ',', '8'];
const RIGHT_RING_KEYS = ['o', 'l', '.', '9'];
const RIGHT_PINKY_KEYS = ['p', ';', '/', '0', '-', '=', '[', ']', "'", '\\', 'enter', 'backspace'];

const THUMB_KEYS = [' ', 'space'];

/**
 * Get the finger information for a given key
 * @param key - The key character (case-insensitive)
 * @returns FingerInfo object or null if key not found
 */
export function getFingerForKey(key: string): FingerInfo | null {
    const normalizedKey = key.toLowerCase().trim();

    // Handle space specially
    if (normalizedKey === ' ' || normalizedKey === 'space') {
        // Both thumbs can hit space, but we'll return right thumb as default
        // In practice, we'll highlight both thumbs for space
        return { hand: 'right', finger: 'thumb' };
    }

    // Left hand keys
    if (LEFT_PINKY_KEYS.includes(normalizedKey)) {
        return { hand: 'left', finger: 'pinky' };
    }
    if (LEFT_RING_KEYS.includes(normalizedKey)) {
        return { hand: 'left', finger: 'ring' };
    }
    if (LEFT_MIDDLE_KEYS.includes(normalizedKey)) {
        return { hand: 'left', finger: 'middle' };
    }
    if (LEFT_INDEX_KEYS.includes(normalizedKey)) {
        return { hand: 'left', finger: 'index' };
    }

    // Right hand keys
    if (RIGHT_INDEX_KEYS.includes(normalizedKey)) {
        return { hand: 'right', finger: 'index' };
    }
    if (RIGHT_MIDDLE_KEYS.includes(normalizedKey)) {
        return { hand: 'right', finger: 'middle' };
    }
    if (RIGHT_RING_KEYS.includes(normalizedKey)) {
        return { hand: 'right', finger: 'ring' };
    }
    if (RIGHT_PINKY_KEYS.includes(normalizedKey)) {
        return { hand: 'right', finger: 'pinky' };
    }

    return null;
}

/**
 * Check if space key is being pressed (needs both thumbs highlighted)
 */
export function isSpaceKey(key: string): boolean {
    const normalizedKey = key.toLowerCase().trim();
    return normalizedKey === ' ' || normalizedKey === 'space';
}
