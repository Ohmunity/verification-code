import React, { ChangeEvent, KeyboardEvent } from "react";

const KEY_CODE_MAP = {
  up: 38,
  right: 39,
  down: 40,
  left: 37,
};

type Props = {
  type: "number" | "text";
  total: number;
  values?: string[];
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
        forwardRef: React.Ref<HTMLInputElement>;
        type: string;
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
};

const VerificationCode = ({
  type,
  total,
  values,
  disabled,
  required,
  placeholder,
  onChange,
  onComplete,
  Component,
}: Props): React.ReactElement => {
  const [state, setState] = React.useState<string[]>(
    Array(total)
      .fill("")
      .map((v, i) => values?.[i] ?? v)
  );
  const refs = Array(total)
    .fill(React.createRef<HTMLInputElement>())
    .map(() => React.createRef<HTMLInputElement>());
  const id = +new Date();

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
    <div className={`grid gap-2 grid-cols-${total}`}>
      {state.map((value, index) => {
        const inputProps = {
          key: `${id}-${index}`,
          id: id ? `${id}-${index}` : undefined,
          "data-id": index,
          value,
          type: type === "number" ? "tel" : "text",
          pattern: type === "number" ? "[0-9]*" : undefined,
          autoFocus: index === state.findIndex((v) => v === ""),
          disabled,
          required,
          placeholder,
          onChange: onChangeInput,
          onKeyDown: onKeyDownInput,
          onFocus: onFocusInput,
        };
        const ref = refs[index];

        return typeof Component == "string" ? (
          <Component {...inputProps} ref={ref} />
        ) : (
          <Component {...inputProps} forwardRef={ref} />
        );
      })}
    </div>
  );
};

VerificationCode.defaultProps = {
  type: "number",
  total: 6,
  values: [],
  disabled: false,
  required: false,
  placeholder: "0",
  Component: "input",
};

export default VerificationCode;
