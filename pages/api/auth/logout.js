import { destroyCookie } from "nookies";

export default function logout(req, res) {
  destroyCookie({ res }, "rememberme", { path: "/" });
  res.status(200).end();
}