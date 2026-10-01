export default function Loading() {
  return <section className="section loading-section" aria-label="Loading page content"><div className="wrap"><div className="loading-block loading-title" /><div className="loading-grid">{Array.from({ length: 4 }, (_, index) => <div className="loading-card" key={index}><div className="loading-block loading-photo" /><div className="loading-block loading-line" /><div className="loading-block loading-short-line" /></div>)}</div></div></section>;
}
