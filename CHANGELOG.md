# Changelog

All notable changes to this project and its API will be documented in this file starting 2026-04-01 with patch 0.2.1, which is the first version after first publishing the app to foodieflip.app.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

- First real Profile Page for better overview of Account Details / Own Recipes/ Favorite Recipes
- Rework for Light Mode to not look like a\*\*
- Introduction of other Login Methods: Discord
- Introduce Servings per Recipe, Calories per Serving, Distinguish between ingredient and quantity per ingredient
- Rework of recipe tags: make them matter
- Rework of quick feedback actions on all recipes incl. report functions for false information
- Lots of minor Stuff (feedback pls?)

## [0.3.1] - 2026-04-21

### Added

- Recipes (and recipe submissions) now support sub-sections of ingredients (e.g. "Für die Soße"), might be neat for complex recipes
- Recipe submission items now support Drag and Drop to re-order ingredients (instructions soon, too... :D)
- minor styling upgrades

### Changed

- Major Refactor of recipe submission dialog component into too many sup-components
- [API] Database / image store now keeps submitted recipes stored even when they are rejected
- [API] Database now has a dev branch so no more downtime due to that hehe

### Fixed

- Portrait Pictures are now properly displayed without destroying the whole recipe view
- Colored Backdrop now scales with the site rather than stopping if recipe card gets bigger

## [0.3.0] - 2026-04-16

### Added

- First implementation of user accounts: only Google Sign-In for now
- Users may now favorite recipes to find them again in their user profile pages (which will soon be prettier)
- Users may now find their submitted recipes in their profile but cant do anything with them yet

### Changed

- Changed ToS and Privacy with fitting, detailed legal stuff suited to foodie flip incl. cookie stuff
- Recipe submission is now only possible when logged in
- [API] backend now available at api.foodieflip.app

### Fixed

- Fixed flipping animation in Firefox (both sides were visible at once while flipping)

### Deprecated

- [API] submittedBy dropped for submittedByUserId for long term support

## [0.2.2] - 2026-04-06

### Added

- Added Flip animation to recipe card: App name finally makes sense
- Added "Nutzungsbedingungen" Page and various links to it because people may actually read that sometimes

### Changed

- Re-localized all of the app and all of its content to German language.

### Fixed

- Add button now aligns with input field for ingredients/instructions
- various accessibility improvements (still probably really bad)
- [API] Discord notification now properly shows a link to the recipe because that's kind of the point isn't it
- various minor additions, bugfixes, spelling, security fixes

## [0.2.1] - 2026-04-01

### Added

- Added Contact Form to Contact Page
- first version of barebones admin panel for recipe approvals
- [API] First Implementation of recipe approvals
- [API] Added possibility to send discord notification upon approvals of new recipes

### Changed

- Complete Workover for Recipe Submission Dialog: Now actually usable on smaller devices
- Made Ingredients/Instructions in Recipe Submission editable
- Legal Pages now point to christried.me

### Deprecated

- [API] Starting transition away from using Trello for information and image submissions towards trello as pure kanban

### Removed

- Removed About Page and left as placeholder for future re-implementation

### Fixed

- components don't overflow to the right side on smaller devices anymore
- fixed overflowing elements in header

Older changes only visible through commit messages.

---

### Standardized Categories:

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security
