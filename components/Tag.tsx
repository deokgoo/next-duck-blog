import Link from 'next/link';

interface Props {
  text: string;
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/search?q=${encodeURIComponent(text)}`}
      className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 dark:bg-accent/15 dark:text-accent"
    >
      {text}
    </Link>
  );
};

export default Tag;
