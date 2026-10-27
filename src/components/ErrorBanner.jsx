import { AlertIcon } from './Icons.jsx';
import { SOURCE_LABELS } from '../format.js';

// Shown when one source failed but the other still returned tasks.
export function ErrorBanner({ errors }) {
  if (!errors?.length) return null;
  return (
    <div className="banner banner-warning" role="status">
      <AlertIcon />
      <div>
        <strong>
          {errors.map((e) => SOURCE_LABELS[e.source] ?? e.source).join(' and ')} unavailable, showing partial data.
        </strong>
        <ul>
          {errors.map((e) => <li key={e.source}>{e.message}</li>)}
        </ul>
      </div>
    </div>
  );
}
