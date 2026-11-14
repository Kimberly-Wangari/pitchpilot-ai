
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  value,
  onChange,
  placeholder = "Enter your password",
  name = "password",
  autoComplete = "current-password",
  minLength,
  required = true,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-field">
      <input
        id={name}
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        minLength={minLength}
        required={required}
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={
          showPassword ? "Hide password" : "Show password"
        }
        aria-pressed={showPassword}
      >
        {showPassword ? (
          <EyeOff size={20} />
        ) : (
          <Eye size={20} />
        )}
      </button>
    </div>
  );
}
