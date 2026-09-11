"use client";

/**
 * A <select> inside a GET filter form that submits on change, so a filter
 * applies without an extra button. Falls back to plain form submission
 * when JS is off (the wrapping form still has its submit button in
 * <noscript>).
 */
export default function AutoSubmitSelect(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }
) {
  return (
    <select
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        e.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
