import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
} from "firebase/auth";
import { ref, set } from "firebase/database";

import { auth, database } from "./firebase";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export async function registerUser({ name, email, password }: RegisterInput) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  await set(ref(database, `users/${credential.user.uid}/profile`), {
    displayName: name.trim(),
    createdAt: new Date().toISOString(),
  });

  return credential.user;
}

export async function loginUser(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}
