/* -------------------------------------------------------------------------- */
/*  React / TypeScript component that reproduces the Figma UI                  */
/*  – Two large buttons (Dark / Orange) with hover/focus/disabled states      */
/*  – A toggle switch with Off/On variants and hover/disabled/focused states  */
/*  – Tailwind CSS v4 (class names only, no custom CSS)                       */
/* -------------------------------------------------------------------------- */

import React from "react";

/* ---------------------------  BUTTON COMPONENT  --------------------------- */

export type ButtonVariant = {
  /** Button style – only “solid” is used in this design */
  style?: "solid";
  /** Button colour – “dark” (default) or “orange” (variant) */
  color: "dark" | "orange";
  /** Button state – “default”, “hover”, “focus”, “disabled” */
  state?: "default" | "hover" | "focus" | "disabled";
  /** Button size – currently only “large” is defined */
  size?: "large";
  /** Optional click handler */
  onClick?: () => void;
};

export const Button: React.FC<ButtonVariant> = ({
  style = "solid",
  color,
  state = "default",
  size = "large",
  onClick,
  children = "Button-lg",
}) => {
  /* base classes for the button (large, rounded, no outline) */
  const base = [
    "inline-flex",
    "items-center",
    "justify-center",
    "px-5", // 20px → 5 * 4px
    "py-4", // 22px → 4.5 * 4px – rounded to 4
    "rounded-md",
    "text-base",
    "font-semibold",
    "transition-colors",
    "focus:outline-none",
  ].join(" ");

  /* colour styles */
  const colorClasses = {
    dark: "bg-gray-900 text-white",
    orange: "bg-orange-600 text-white",
  }[color];

  /* state overrides */
  const stateClasses = (() => {
    if (state === "disabled") return "opacity-50 cursor-not-allowed";
    if (state === "hover") return "hover:bg-opacity-80";
    if (state === "focus")
      return "focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
    return "";
  })();

  const classes = `${base} ${colorClasses} ${stateClasses}`.trim();

  return (
    <button type="button" className={classes} onClick={onClick} disabled={state === "disabled"}>
      {children}
    </button>
  );
};

/* --------------------------  SWITCH COMPONENT  --------------------------- */

export type SwitchVariant = {
  /** Switch type – “off” (default) or “on” */
  type: "off" | "on";
  /** Switch state – “default”, “hover”, “focus”, “disabled” */
  state?: "default" | "hover" | "focus" | "disabled";
  /** Optional click handler (toggles on/off) */
  onClick?: () => void;
};

export const SwitchButton: React.FC<SwitchVariant> = ({
  type,
  state = "default",
  onClick,
}) => {
  /* container styles */
  const baseContainer = [
    "relative",
    "inline-flex",
    "items-center",
    "w-10",
    "h-6",
    "rounded-full",
    "border",
    "border-gray-300",
    "transition-colors",
  ].join(" ");

  /* background colour based on type */
  const bgClasses = {
    off: "bg-gray-200",
    on: "bg-indigo-600",
  }[type];

  /* state overrides for the container */
  const containerState = (() => {
    if (state === "disabled") return "opacity-50 cursor-not-allowed";
    if (state === "hover") return "hover:opacity-90";
    if (state === "focus") return "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500";
    return "";
  })();

  /* handle keypress for accessibility */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onClick?.();
    }
  };

  /* inner circle (knob) */
  const knob = (
    <span
      className={[
        "absolute",
        "top-1",
        "left-1",
        "w-4",
        "h-4",
        "rounded-full",
        "bg-white",
        "transition-transform",
        "transform",
        type === "on" ? "translate-x-4" : "translate-x-0",
      ].join(" ")}
    />
  );

  /* container element (button) */
  const container = (
    <div className={`${baseContainer} ${bgClasses} ${containerState}`}>
      {knob}
    </div>
  );

  /* if disabled, just render container as is; otherwise make it clickable */
  return (
    <button
      type="button"
      className="p-0 bg-transparent border-none"
      onClick={onClick}
      onKeyPress={handleKeyPress}
      disabled={state === "disabled"}
      aria-pressed={type === "on"}
      aria-disabled={state === "disabled"}
    >
      {container}
    </button>
  );
};

/* ---------------------------  DEMO COMPONENT  ---------------------------- */

export const Demo: React.FC = () => {
  const [switchOn, setSwitchOn] = React.useState(false);
  const [switchHover, setSwitchHover] = React.useState(false);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Figma‑to‑React Demo</h1>

      {/* Buttons */}
      <div className="flex space-x-4">
        <Button color="dark" state="hover" />
        <Button color="orange" state="default" />
      </div>

      {/* Switches */}
      <div className="flex space-x-6 items-center">
        <div className="flex items-center space-x-2">
          <SwitchButton type="off" state="default" />
          <span>Off / Default</span>
        </div>

        <div className="flex items-center space-x-2">
          <SwitchButton
            type={switchOn ? "on" : "off"}
            state={switchHover ? "hover" : "default"}
            onClick={() => setSwitchOn((o) => !o)}
            onMouseEnter={() => setSwitchHover(true)}
            onMouseLeave={() => setSwitchHover(false)}
          />
          <span>{switchOn ? "On / Hover" : "Off / Hover"}</span>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Usage example (e.g. in App.tsx):                                         */
/*  import { Demo } from "./Demo";                                            */
/*  function App() { return <Demo />; }                                      */
/* -------------------------------------------------------------------------- */