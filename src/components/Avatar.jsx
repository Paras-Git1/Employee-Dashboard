import { initials } from '../format.js';

const TONES = ['orange', 'blue', 'green', 'pink', 'violet', 'teal'];

// Initials avatar with a stable colour per name.
export function Avatar({ name, size = 36 }) {
  const label = name || '?';
  const tone = TONES[[...label].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length];
  return (
    <span className={`avatar avatar-${tone}`} style={{ width: size, height: size, fontSize: size * 0.38 }} aria-hidden="true">
      {initials(label) || '?'}
    </span>
  );
}
