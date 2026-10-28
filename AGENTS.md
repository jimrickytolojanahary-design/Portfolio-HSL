<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep native textarea sizing in a global CSS rule and shared Textarea defaults, and apply equivalent sizing to the shared rich-text editor frame, so every form preserves resizing across UI state changes.
- Keep desktop project-pill alignment and timed DOM scrolling gated at 1024px, with loop rebasing outside animations; this preserves the existing mobile/tablet navigation and bidirectional continuity without another library.
