## Project Description
## Yapper (V1)
- Template: React Typescript
- Project Type: Social Media
- Inspiration sources: Twitter, Facebook
- Frontend External Dependencies: Bootstrap, FontAwesome, Sweetalert2, React (+ included packages), Vite (+ included packages), Axios
- Backend External Dependencies: Typescript, Hono, pg, Drizzle, argon2, jsonwebtoken, nodemailer
- Developer Note: V2 will be rewritten in Tailwind CSS and for the android version, it might be written in V2 along with React Native usage
- Production Ready: No
- Package Manager: PNPM
- Runtime: Bun.js
- Database: PostgreSQL

## Setup
## Database
1. Install database tool for PostgreSQL and [its driver](https://www.postgresql.org/). (I use [DBeaver](https://dbeaver.io/) as the tool here for offline, but you can use Supabase for online version.)
2. Use the `schema.sql` file or copy the script inside to the database tool
3. Generate the database URL and copy it to `DATABASE_URL` field in `.env`
Note: If the `schema.sql` file is broken, you can just generate new one with command `pnpm migrate-db` and do step 2.

## Backend
- Install BunJS
- Change the `.env.example` to `.env` and fill the data
- To get raw database schema, use `drizzle-kit`
- Run `cd server`
- Run `pnpm install`
- Run `pnpm start`

- Developer Note: Make sure to use an actual gmail username for email_user and [Google App Password](https://support.google.com/accounts/answer/185833?hl=en) for the email_pass

## Frontend
- Open new terminal
- Run `cd client`
- Run `pnpm install`
- Run `pnpm run dev`

## Credits (Assets)
- Login Page Background: [@Rawpixel.com in Freepik](https://www.freepik.com/author/rawpixel-com)
- Register Page Background: [@Pikisuperstar in Freepik](https://www.freepik.com/author/pikisuperstar)
- Verified Icon: [@oelhoem in Freepik](https://www.freepik.com/author/oelhoem/icons)
- Default Profile Picture: [Freeiconspng in Google](https://www.freeiconspng.com/img/898)
- App Icon (Vite Icon): [Vite](https://vite.dev)

## Features
- [x] Login
- [x] Register
- [x] Email verification
- [x] Reset Password
- [x] Basic Security Functions (for pages)
- [x] Sidebar
- [x] Home Page
- [x] Upload, Like and Delete posts (images are also supported)
- [x] Comment Post (Add, load, reply, like, like reply, and delete)
- [x] Report Post
- [x] Search Posts
- [x] Administrator / Developer Features (Ban User, Unban User)
- [x] Viewing Profile + Functionalities including: Follow, View User Posts, Block User, and Edit (for owners)
- [x] Notifications Page
- [ ] Messages Page
- [x] Settings Page