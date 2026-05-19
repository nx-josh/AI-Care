export type Identity =
  | { kind: "firebase_sub"; value: string }
  | { kind: "game_uuid"; value: string };

export function parseIdentity(input: {
  firebaseSub?: string | null;
  gameUuid?: string | null;
}): Identity | null {
  if (input.firebaseSub) return { kind: "firebase_sub", value: input.firebaseSub };
  if (input.gameUuid) return { kind: "game_uuid", value: input.gameUuid };
  return null;
}

export function identityKey(id: Identity): string {
  return `${id.kind}:${id.value}`;
}
