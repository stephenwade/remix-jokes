import { Outlet } from '@remix-run/react';

export default function JokesRoute() {
  return (
    <div>
      <h1 aria-hidden={true}>J🤪KES</h1>
      <h1 hidden>Jokes</h1>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
