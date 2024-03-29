import React, { ChangeEvent, KeyboardEvent } from "react";
import cc from "classcat";

const KEY_CODE_MAP = {
  up: 38,
  right: 39,
  down: 40,
  left: 37,
};

type Props = {
  type: "number" | "text";
  total: number;
  value?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  Component?:
    | React.FC<{
        key: string;
        id: string;
        ["data-id"]: number;
        value: string;
        ref: React.Ref<HTMLInputElement>;
        type: "tel" | "text";
        autoFocus: boolean;
        onChange: (e: ChangeEvent<HTMLInputElement>) => void;
        onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
        onFocus: (e: ChangeEvent<HTMLInputElement>) => void;
        pattern?: string;
        disabled?: boolean;
        required?: boolean;
        placeholder?: string;
      }>
    | "input";
  clearAfterComplete?: boolean;
};

const VerificationCode = ({
  type,
  total,
  value,
  disabled,
  required,
  placeholder,
  onChange,
  onComplete,
  Component,
  clearAfterComplete,
}: Props): React.ReactElement => {
  const defaultValues = value ? value.split("") : [];
  const [state, setState] = React.useState<string[]>(
    Array(total)
      .fill("")
      .map((v, i) => defaultValues?.[i] ?? v)
  );
  const refs = Array(total)
    .fill(React.createRef<HTMLInputElement>())
    .map(() => React.createRef<HTMLInputElement>());
  const id = +new Date();

  const clear = () => {
    setState(Array(total).fill(""));
    refs[0].current.focus();
  };

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.dataset.id ?? "");

    if (type === "number") {
      e.target.value = e.target.value.replace(/[^\d]/gi, "");
    }

    if (
      e.target.value === "" ||
      (type === "number" && !e.target.validity.valid)
    ) {
      return;
    }

    let next;
    const value = e.target.value;
    const newValues = [...state];

    if (value.length > 1) {
      let nextIndex = value.length + index - 1;

      if (nextIndex >= total) {
        nextIndex = total - 1;
      }

      next = refs[nextIndex];

      value.split("").forEach((v, i) => {
        const pointer = index + i;
        if (pointer < total) {
          newValues[pointer] = v;
        }
      });
    } else {
      next = refs[index + 1];
      newValues[index] = value;
    }

    setState(newValues);

    if (next) {
      next.current.focus();
      next.current.select();
    }

    const valuesStr = newValues.join("");

    onChange?.(valuesStr);

    if (onComplete && valuesStr.length >= total) {
      onComplete(valuesStr);

      if (clearAfterComplete) {
        clear();
      }
    }
  };

  const onKeyDownInput = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }

    const index = parseInt(e.target.dataset.id || "");
    const prevIndex = index - 1;
    const nextIndex = index + 1;
    const prev = refs[prevIndex];
    const next = refs[nextIndex];

    switch (e.keyCode) {
      case KEY_CODE_MAP.left:
        e.preventDefault();
        if (prev) {
          prev.current.focus();
        }
        break;
      case KEY_CODE_MAP.right:
        e.preventDefault();
        if (next) {
          next.current.focus();
        }
        break;
      case KEY_CODE_MAP.up:
      case KEY_CODE_MAP.down:
        e.preventDefault();
        break;
    }
  };

  const onFocusInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      for (let i = 0; i < state.length; i++) {
        if (!state[i]) {
          refs[i].current?.select();
          break;
        }
      }
    }
  };

  return (
    <div
      className={cc([
        "grid gap-2 ",
        {
          "grid-cols-1": total === 1,
          "grid-cols-2": total === 2,
          "grid-cols-3": total === 3,
          "grid-cols-4": total === 4,
          "grid-cols-5": total === 5,
          "grid-cols-6": total === 6,
          "grid-cols-7": total === 7,
          "grid-cols-8": total === 8,
          "grid-cols-9": total === 9,
          "grid-cols-10": total === 10,
          "grid-cols-11": total === 11,
          "grid-cols-12": total === 12,
        },
      ])}
    >
      {state.map((value, index) => (
        <Component
          key={`${id}-${index}`}
          id={id ? `${id}-${index}` : undefined}
          data-id={index}
          value={value}
          ref={refs[index]}
          type={type === "number" ? "tel" : "text"}
          pattern={type === "number" ? "[0-9]*" : undefined}
          autoFocus={index === state.findIndex((v) => v === "")}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          onChange={onChangeInput}
          onKeyDown={onKeyDownInput}
          onFocus={onFocusInput}
        />
      ))}
    </div>
  );
};

VerificationCode.defaultProps = {
  type: "number",
  total: 6,
  value: "",
  disabled: false,
  required: false,
  placeholder: "0",
  Component: "input",
};

export default VerificationCode;
