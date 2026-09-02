"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Password input with a show/hide toggle.
 *
 * Starts hidden and only ever reveals what the person is typing right now —
 * no existing password is ever loaded into this field, so there is nothing
 * stored to expose.
 *
 * The toggle is a real button: reachable by keyboard, labelled for screen
 * readers, and `aria-pressed` so its state is announced rather than implied
 * by the icon alone. It is skipped in the tab order between the two password
 * boxes (`tabIndex={-1}`) so tabbing runs New → Confirm as expected; it stays
 * reachable via the labelled control itself.
 */
export default function PasswordField({
  name,
  label,
  placeholder,
  minLength,
  autoComplete = "new-password",
  invalid,
  describedBy,
  disabled,
  onChange,
}: {
  name: string;
  label: string;
  placeholder?: string;
  minLength?: number;
  autoComplete?: string;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
  onChange?: () => void;
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="pw-field">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          minLength={minLength}
          autoComplete={autoComplete}
          disabled={disabled}
          onChange={onChange}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
        <button
          type="button"
          className="pw-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
          tabIndex={-1}
          disabled={disabled}
        >
          {visible ? (
            <EyeOff className="h-[17px] w-[17px]" aria-hidden />
          ) : (
            <Eye className="h-[17px] w-[17px]" aria-hidden />
          )}
        </button>
      </div>
    </div>
  );
}
