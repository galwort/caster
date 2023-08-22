import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

export const signUp = async (
  email: string,
  password: string,
) => {
  const auth = getAuth();
  const user = await createUserWithEmailAndPassword(auth, email, password);
  return user;
}