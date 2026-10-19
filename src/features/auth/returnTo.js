const knownRoute =
  /^\/app(?:\/(?:dashboard|markets|paper|orders|portfolio|journal|settings|terminal(?:\/[A-Za-z0-9_-]+)?))?$/;

export function safeReturnTo(value) {
  if (
    typeof value !== 'string' ||
    /[\\%]/.test(value) ||
    [...value].some((character) => character.charCodeAt(0) <= 32)
  )
    return '/app/dashboard';
  try {
    const url = new URL(value, window.location.origin);
    if (
      url.origin !== window.location.origin ||
      !value.startsWith('/app') ||
      !knownRoute.test(url.pathname)
    )
      return '/app/dashboard';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/app/dashboard';
  }
}
