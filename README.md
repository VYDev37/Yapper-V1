## Project Description
# Yapper (V1)
- Template: React Typescript
- Project Type: Social Media
- Inspiration sources: Twitter, Facebook
- Frontend External Dependencies: Bootstrap, FontAwesome, Sweetalert2, React (+ included packages), Vite (+ included packages), Axios
- Backend External Dependencies: Typescript, Hono, pg, Drizzle, argon2, jsonwebtoken, nodemailer (not used for now)
- Developer Note: V2 will be rewritten in Tailwind CSS and for the android version, it might be written in V2 along with React Native usage
- Production Ready: No
- Package Manager: PNPM
- Runtime: Bun.js
- Database: PostgreSQL

## Setup
# Backend
- Install BunJS
- Change the `.env.example` to `.env` and fill the data
- To get raw database schema, use `drizzle-kit`
- Run `cd server`
- Run `pnpm install`
- Run `pnpm start`

# Frontend
- Open new terminal
- Run `cd client`
- Run `pnpm install`
- Run `pnpm run dev`

## Credits (Assets)
- Login Page Background: [@Rawpixel.com in Freepik](https://www.freepik.com/author/rawpixel-com)
- Register Page Background: [@Pikisuperstar in Freepik](https://www.freepik.com/author/pikisuperstar)
- Verified Icon: [@oelhoem in Freepik](https://www.freepik.com/author/oelhoem/icons)
- Default Profile Picture: [Freeiconspng in Google](https://www.freeiconspng.com/img/898)

## Features
[x] Login
[x] Register
[ ] Email verification
[x] Basic Security Functions (for pages)
[x] Sidebar
[x] Home Page
[x] Upload, Like and Delete posts (images are also supported)
[ ] Comment Post
[ ] Report Post
[x] Search Posts
[x] Viewing Profile + Functionalities including: Follow, User Posts, and Edit (for owners)
[ ] Notifications Page
[ ] Messages Page
[ ] Settings Page