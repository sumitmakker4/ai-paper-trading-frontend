import { useId, useRef } from 'react';
import styles from './Ui.module.css';

export function Tabs({ items, value, onChange, label }) {
  const id = useId();
  const buttons = useRef([]);
  function onKeyDown(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % items.length;
    if (event.key === 'ArrowLeft') next = (index + items.length - 1) % items.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = items.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    onChange(items[next].value);
    buttons.current[next]?.focus();
  }
  return (
    <div>
      <div role="tablist" aria-label={label} className={styles.tabs}>
        {items.map((item, index) => (
          <button
            key={item.value}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            role="tab"
            id={`${id}-${item.value}-tab`}
            aria-controls={`${id}-${item.value}-panel`}
            aria-selected={value === item.value}
            tabIndex={value === item.value ? 0 : -1}
            onKeyDown={(event) => onKeyDown(event, index)}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          tabIndex={0}
          id={`${id}-${item.value}-panel`}
          aria-labelledby={`${id}-${item.value}-tab`}
          hidden={value !== item.value}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
