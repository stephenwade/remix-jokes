import type { LinksFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react';

import stylesUrl from '~/styles/jokes.css';
import { db } from '~/utils/db.server';
import { getUser } from '~/utils/session.server';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
  {
    rel: 'alternate',
    type: 'application/rss+xml',
    title: 'Remix Jokes',
    href: '/jokes.rss',
  },
];

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  jokes: { id: string; name: string }[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const jokesPromise = db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: 'desc' },
  });
  const userPromise = getUser(request);

  const [jokes, user] = await Promise.all([jokesPromise, userPromise]);

  const data: LoaderData = { jokes, user };
  return json(data);
};

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>();

  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link to="/" title="Remix Jokes" aria-label="Remix Jokes">
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokes.map((joke) => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>
                    {joke.name}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
