# Changelog

All notable changes to this project and its API will be documented in this file starting 2026-04-01 with patch 0.2.1, which is the first version after first publishing the app to foodieflip.app.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

- Introduction of user accounts using signups with Google(?)
- Introduction of favourite recipes view in user account profiles
- Rework of recipe tags: make them matter
- Rework of quick feedback actions on all recipes incl. report functions for false information

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
