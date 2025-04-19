interface UsernameFieldProps {
  username: string;
  onChange: (username: string) => void;
}

export default function UsernameField({
  username,
  onChange,
}: UsernameFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <label
        htmlFor="username"
        className="font-heading1 text-md text-headertext1 w-1/4"
      >
        Username:
      </label>
      <input
        id="username"
        name="username"
        type="text"
        value={username}
        onChange={(e) => onChange(e.target.value)}
        className="font-text1 w-3/4 p-2 border rounded-md text-sm"
      />
    </div>
  )
}
