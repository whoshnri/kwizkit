"use client";
import { useRef, useState, useEffect } from "react";

interface Setters{
  setInputCode : (value: string) => void,
  inputCode : number
}

export default function VerificationCodeInput({setInputCode, inputCode} : {Setters}) {
  const length = 4;
  const [code, setCode] = useState<number[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
      setInputCode(code.join("") as string)
  }, [code]);

  const handleChange = (val: string, index: number) => {
    if (!/^[0-9]?$/.test(val)) return;

    const updated = [...code];
    updated[index] = val;
    setCode(updated);

    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Backspace") {
      if (code[i] === "" && i > 0) {
        inputsRef.current[i - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputsRef.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < length - 1) {
      inputsRef.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").slice(0, length).split("");
    const updated = [...code];
    for (let i = 0; i < paste.length; i++) {
      if (!/^[0-9]$/.test(paste[i])) continue;
      updated[i] = paste[i];
      if (inputsRef.current[i]) inputsRef.current[i]!.value = paste[i];
    }
    setCode(updated);
    const nextIndex = paste.length < length ? paste.length : length - 1;
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 mt-4">
      {code.map((char, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={char}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          ref={(el) => (inputsRef.current[i] = el)}
          className="w-12 h-12 text-center text-xl font-medium border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      ))}
    </div>
  );
}
