/**
 * JsonLd — injects a JSON-LD structured data script tag.
 * Usage: <JsonLd data={schemaObject} />
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
