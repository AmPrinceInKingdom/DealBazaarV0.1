export function PolicyPage({
  title,
  updatedAt,
  sections,
}: {
  title: string;
  updatedAt: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  return (
    <div className="container-wrap py-10">
      <article className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-4xl font-black">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Last updated: {updatedAt}
          </p>
        </header>
        {sections.map((section) => (
          <section key={section.heading} className="surface p-6">
            <h2 className="text-xl font-bold">{section.heading}</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </article>
    </div>
  );
}
