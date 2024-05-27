import { pool } from '@/db';
import { parseCookies, destroyCookie } from 'nookies';

export default async function checkAuth(context) {
    const cookies = parseCookies(context);
    const rememberToken = cookies.rememberme;
    const { resolvedUrl } = context;

    const redirectLogin = { redirect: { destination: '/auth/login', permanent: false } };
    const redirectHome = { redirect: { destination: '/', permanent: false } };

    if (rememberToken) {
        const { rows } = await pool.query("SELECT * FROM users WHERE token = $1 AND verified = true", [rememberToken]);
        if (rows.length > 0) {
            const userData = rows[0];
            userData.created_at = userData.created_at ? userData.created_at.toISOString() : null;
            if (['/auth/login', '/auth/signup'].includes(resolvedUrl)) return redirectHome;
            return { props: { userData } };
        } else {
            destroyCookie(context, 'rememberme');
        }
    }

    if (!rememberToken && !['/auth/login', '/auth/signup'].includes(resolvedUrl)) return redirectLogin;
    return { props: {} };
}
