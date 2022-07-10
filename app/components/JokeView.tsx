import { Form, Link } from '@remix-run/react';

type JokeViewProps = {
  joke: { name: string; content: string };
  isOwner: boolean;
  canDelete?: boolean;
};

export function JokeView({ joke, isOwner, canDelete = true }: JokeViewProps) {
  return (
    <div>
      <p>Here's your hilarious joke:</p>
      <p>{joke.content}</p>
      <Link to=".">"{joke.name}" Permalink</Link>
      {isOwner && (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </Form>
      )}
    </div>
  );
}
