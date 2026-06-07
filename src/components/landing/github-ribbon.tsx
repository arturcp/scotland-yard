type GitHubRibbonProps = {
  href: string;
  label?: string;
};

export function GitHubRibbon({
  href,
  label = 'Código no GitHub',
}: GitHubRibbonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="github-ribbon"
      aria-label={label}
    >
      {label}
    </a>
  );
}
