## [0.1.0] - Initial
### Added
- Initial commit

## [0.2.0]
### Added
- Posts module
- User settings page
- Password reset with OTP/Token verifier
- Search Page
- Mail sender integration
- Edit user feature

### Changed
- Refactored some core code

## [0.3.0]
### Added
- Comment system (load, add, delete comments & replies)
- Preparation for likes on comments/replies

## [0.4.0]
### Added
- Like on comments
- Reply to comments
- Like on replies

## [0.5.0]
### Added
- Optimized UI for Post View
- Report Button
- Added `Creator` tag for the post owner in their post (can be seen in comment column)
- Notifications Page
- Notification sender when follow user, comment, like comment, reply, and like post

## [1.0.0]
### Added
- Report comment & replies
- Audit Log Page (separated from notifications for moderator)
- Moved log out button from sidebar to settings
- Refactored the `Report` and `Notification` code
- Block User & Effect (Post can't be seen) & Functionality
### Fixed
- Fixed bug related to user profile viewing (now, the full_name and username visual don't go invisible anymore after changes)

## [1.1.0]
### Added
- Additional Effect for blocked user: Comments and replies content can't be seen unless it's revealed
- Ban & Unban User button and dialog for Administrator / Developer
- Ban Effect (User is unable to login and kicked out if online)- Simple Socket for messaging
- Added more details to Audit Logs
### Fixed
- Fixed bug when finding user that doesn't exist (instead of showing self, it shows 404)

## [1.1.1]
### Added
- Request & Approval for Verified Status
- Find user from 'Search' page
### Changed
- Changed the redirection way of `Sidebar Post` button & `View User` button