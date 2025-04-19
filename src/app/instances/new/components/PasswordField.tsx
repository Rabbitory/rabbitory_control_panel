interface PasswordFieldProps {
  password: string;
  onChange: (password: string) => void;
}

export default function PasswordField({
  password,
  onChange,
}: PasswordFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="password"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Password:
      </label>
      <input
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => onChange(e.target.value)}
        className="font-text1 w-3/4 p-2 border rounded-md text-sm"
      />
    </div>
  )
}
