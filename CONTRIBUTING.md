# Contributing to the AI Engineer Study Guide

Welcome, and thank you for considering a contribution to the AI Engineer Study
Guide. Whether you are fixing a typo, adding flashcards, writing new notes, or
proposing an entire project module, every contribution helps the community learn
faster and better.

## How to Contribute

There are several ways to help:

- **Fix errors** -- correct typos, broken links, outdated information, or
  inaccurate code snippets.
- **Add notes** -- write new topic notes following the CONCEPT / BUILD / SHIP
  pattern (see Content Style Guide below).
- **Add flashcards** -- expand the Anki-compatible flashcard decks in any module.
- **Add projects** -- propose or build hands-on projects that reinforce a
  module's concepts.
- **Improve existing content** -- clarify explanations, add diagrams, expand
  examples, or improve code quality.

## Content Style Guide

All written content in this repository must follow these conventions:

1. **Notes follow the CONCEPT / BUILD / SHIP pattern.** Every topic note is
   divided into three sections:
   - CONCEPT -- the theory and mental models.
   - BUILD -- runnable code examples.
   - SHIP -- production patterns, pitfalls, and checklists.

2. **Code examples should be runnable Python.** Include all necessary imports,
   use clear variable names, and add inline comments where the logic is not
   obvious. If a snippet requires external packages, note them at the top.

3. **Use relative links.** When linking to other files in the repository, always
   use relative paths (e.g., `../module-02/notes/embeddings.md`) rather than
   absolute GitHub URLs.

4. **No emojis.** Keep all content plain text with standard Markdown formatting.

5. **Cite sources.** When referencing papers, blog posts, documentation, or
   external tools, include a link and, where applicable, the author and year.

## Using Templates

The `_templates/` directory contains starter files for common content types:

- `_templates/note-template.md` -- for new topic notes
- `_templates/cheatsheet-template.md` -- for quick-reference cheat sheets
- `_templates/interview-questions-template.md` -- for interview prep content
- `_templates/project-readme-template.md` -- for project write-ups

Copy the appropriate template into the target module directory and fill in the
sections. Do not modify the templates themselves unless you are proposing a
structural change to the template format.

## Pull Request Process

1. **Fork the repository** and create a feature branch from `main`.
2. **Make your changes** in the feature branch, following the style guide above.
3. **Test locally** -- ensure all links resolve, code examples run, and
   Markdown renders correctly.
4. **Open a pull request** against `main`. Fill out the PR template completely.
5. **Respond to review feedback** promptly. Maintainers may request changes
   before merging.

Keep pull requests focused. One PR should address one topic, one fix, or one
template -- not a mix of unrelated changes.

## Good First Contributions

If you are looking for a place to start, here are specific gaps that need help:

- Add flashcards for any module that currently has none.
- Write cheat sheets for modules that only have notes.
- Add interview questions for modules missing that section.
- Improve code examples that lack error handling or type hints.
- Add "Further Reading" links to notes that have an empty section.
- Fix any broken relative links across the repository.

Check the open issues labeled `good first issue` for additional ideas.

## Code of Conduct

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).
By participating, you agree to uphold a welcoming and respectful environment for
everyone.
