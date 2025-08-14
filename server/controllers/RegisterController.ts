import type { Context } from 'hono';
import { eq, ilike, or } from 'drizzle-orm';

import argon2 from 'argon2';

import { NoSpecialChar } from '../utilities/Text';

import db from '../database/pool';
import { users } from '../database/schema';
import HTTPStatus from '../utilities/HTTPStatus';

export default class RegisterController {
    static async Post(c: Context) {
        try {
            const { full_name, username, email, password } = await c.req.json();

            const verifiedFullName: string = full_name.trim();
            const verifiedUsername: string = username.trim().toLowerCase();
            const verifiedEmail: string = email.trim().toLowerCase();
            const verifiedPassword: string = password.trim();

            //console.log(verifiedEmail, verifiedFullName, verifiedPassword, verifiedUsername);

            if (!verifiedFullName || !verifiedUsername || !verifiedEmail || !verifiedPassword)
                return c.json({ message: 'All fields are required.' }, HTTPStatus.CONFLICT);

            if (verifiedFullName.length < 3 || verifiedFullName.length > 50)
                return c.json({ message: 'Full name must be at least 3 characters long and 50 characters at maximum.' }, HTTPStatus.CONFLICT);

            if (!NoSpecialChar(verifiedUsername, false) || verifiedUsername.length < 3 || verifiedUsername.length > 20)
                return c.json({ message: 'Username must be at least 3 characters long and 20 characters at maximum and no special character.' }, HTTPStatus.CONFLICT);

            if (verifiedPassword.length < 5 || verifiedPassword.length > 25)
                return c.json({ message: 'Password must be at least 5 characters long and 25 characters at maximum.' }, HTTPStatus.CONFLICT);

            const hashedPassword: string = await argon2.hash(verifiedPassword);
            const existingUser = await db.query.users.findFirst({
                where: or(
                    eq(users.username, verifiedUsername),
                    ilike(users.email, verifiedEmail)
                )
            });

            if (existingUser)
                return c.json({ message: 'Username or email already used.' }, HTTPStatus.CONFLICT);

            await db.insert(users).values({
                full_name: verifiedFullName,
                username: verifiedUsername,
                email: verifiedEmail,
                password: hashedPassword,
                password_length: verifiedPassword.length
            });

            return c.json({ message: 'Registration successful! Please login.' }, HTTPStatus.OK);
        } catch (error) {
            console.error("Error during registration: ", error);
            return c.json({ message: 'Internal server error.' }, HTTPStatus.INTERNAL_SERVER_ERROR);
        }
    }
}