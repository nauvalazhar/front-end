export function Vim({ children }) {
  return (
    <div className="bg-blue-700 p-3 rounded-xl">
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}
