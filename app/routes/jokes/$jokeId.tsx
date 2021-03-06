import type { Joke } from '@prisma/client';
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { useCatch, useLoaderData, useParams } from '@remix-run/react';

import { JokeView } from '~/components/JokeView';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

type LoaderData = { joke: Joke; isOwner: boolean };

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await getUserId(request);

  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });

  if (!joke) {
    throw new Response('What a joke! Not found.', { status: 404 });
  }

  const data: LoaderData = {
    joke,
    isOwner: joke.jokesterId === userId,
  };

  return json(data);
};

export const action: ActionFunction = async ({ params, request }) => {
  const form = await request.formData();
  const method = form.get('_method');
  if (typeof method !== 'string') {
    return json(
      { formError: 'Form was not submitted correctly.' },
      { status: 400 }
    );
  }

  if (method !== 'delete') {
    throw new Response(`The _method ${method} is not supported`, {
      status: 400,
    });
  }

  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", { status: 404 });
  }
  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", { status: 403 });
  }

  await db.joke.delete({ where: { id: joke.id } });

  return redirect('/jokes');
};

export const meta: MetaFunction = ({ data }: { data?: LoaderData }) => {
  if (!data) {
    return {
      title: 'No joke | Remix Jokes',
      description: 'No joke found',
    };
  }

  return {
    title: `"${data.joke.name}" | Remix Jokes`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};

export default function JokeRoute() {
  const data: LoaderData = useLoaderData<LoaderData>();

  return <JokeView joke={data.joke} isOwner={data.isOwner} />;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  switch (caught.status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 403: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.jokeId}?
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">
      There was an error loading the joke with id {jokeId}. Sorry.
    </div>
  );
}
