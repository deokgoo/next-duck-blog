interface YouTubeProps {
  id: string;
  title?: string;
}

export default function YouTube({ id, title = 'YouTube video player' }: YouTubeProps) {
  return (
    <div className="relative my-8 w-full overflow-hidden rounded-lg shadow-lg" style={{ paddingBottom: '56.25%' }}>
      <iframe
        className="absolute left-0 top-0 h-full w-full"
        src={`https://www.youtube.com/embed/${id}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
