import { useRef, useState } from "react";

const sanitize = (value, maxLength) =>
  value.replace(/\D/g, "").slice(0, maxLength);

export default function OtpCodeInput({ length = 6, onComplete, disabled }) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const inputRefs = useRef([]);

  const focusInput = (index) => {
    inputRefs.current[index]?.focus();
  };

  const applyDigits = (newDigits) => {
    setDigits(newDigits);

    const code = newDigits.join("");
    if (code.length !== length) return;
    if (newDigits.includes("")) return;
    onComplete(code);
  };

  const handleChange = (index, rawValue) => {
    const digit = sanitize(rawValue, 1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    applyDigits(newDigits);

    if (!digit) return;
    if (index >= length - 1) return;
    focusInput(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key !== "Backspace") return;
    if (digits[index]) return;
    if (index === 0) return;
    focusInput(index - 1);
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = sanitize(event.clipboardData.getData("text"), length);
    if (!pasted) return;

    const newDigits = Array(length).fill("");
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    applyDigits(newDigits);
    focusInput(Math.min(pasted.length, length - 1));
  };

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => (inputRefs.current[index] = element)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={index === 0}
          value={digit}
          disabled={disabled}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className="h-14 w-12 rounded-md border border-gray-300 text-center text-2xl font-semibold focus:border-blue-600 focus:outline-none
          disabled:bg-gray-100"
        />
      ))}
    </div>
  );
}
