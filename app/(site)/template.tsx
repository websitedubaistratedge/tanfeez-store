/** Calm page entrance on every navigation; pure CSS so it plays on first paint. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
